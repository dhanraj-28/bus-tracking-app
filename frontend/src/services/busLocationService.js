import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";
import {
  extractLatLng,
  getNearestStop,
  haversineKm,
  sumRouteDistanceKm,
  calculateEtaMinutes,
} from "../utils/geoUtils";

const BUS_LOCATIONS = "busLocations";

const normalizeBusLocation = (docId, data) => {
  const coords = extractLatLng(data);
  return {
    id: docId,
    busId: data.busId || docId,
    busNumber: data.busNumber || null,
    routeId: data.routeId || null,
    latitude: coords?.latitude ?? null,
    longitude: coords?.longitude ?? null,
    speed: data.speed ?? 0,
    currentStopName: data.currentStopName || null,
    nextStopName: data.nextStopName || null,
    distanceToStop: data.distanceToStop ?? null,
    updatedAt: data.updatedAt || data.lastUpdated || null,
    isActive: !!(coords || data.currentStopName),
  };
};

export const getCurrentBusLocation = async (routeId, busNumber) => {
  try {
    if (routeId) {
      const q = query(
        collection(db, BUS_LOCATIONS),
        where("routeId", "==", routeId),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        return normalizeBusLocation(d.id, d.data());
      }
    }

    if (busNumber) {
      const q = query(
        collection(db, BUS_LOCATIONS),
        where("busNumber", "==", busNumber),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        return normalizeBusLocation(d.id, d.data());
      }
    }

    return null;
  } catch (error) {
    console.error("[busLocationService] getCurrentBusLocation:", error);
    return null;
  }
};

export const getCurrentBusLocationByDocId = async (busDocId) => {
  if (!busDocId) return null;
  try {
    const snap = await getDoc(doc(db, BUS_LOCATIONS, busDocId));
    if (!snap.exists()) return null;
    return normalizeBusLocation(snap.id, snap.data());
  } catch (error) {
    console.error("[busLocationService] getCurrentBusLocationByDocId:", error);
    return null;
  }
};

export const subscribeToBusLocation = (routeId, busNumber, onUpdate, onError) => {
  let activeUnsub = () => {};
  let cancelled = false;

  const startQuery = (field, value, onEmpty) => {
    if (!value || cancelled) return;

    const q = query(
      collection(db, BUS_LOCATIONS),
      where(field, "==", value),
      limit(1)
    );

    activeUnsub = onSnapshot(
      q,
      { includeMetadataChanges: false },
      (snapshot) => {
        if (cancelled) return;
        if (snapshot.empty) {
          onEmpty?.();
          return;
        }
        const d = snapshot.docs[0];
        onUpdate(normalizeBusLocation(d.id, d.data()));
      },
      (error) => {
        console.error("[busLocationService] onSnapshot:", error);
        onError?.(error.message || "Could not connect to live bus data.");
      }
    );
  };

  if (routeId) {
    startQuery("routeId", routeId, () => {
      if (busNumber) {
        activeUnsub();
        startQuery("busNumber", busNumber, () => {
          onUpdate({
            latitude: null,
            longitude: null,
            speed: 0,
            currentStopName: null,
            nextStopName: null,
            distanceToStop: null,
            updatedAt: null,
            isActive: false,
          });
        });
      } else {
        onUpdate({
          latitude: null,
          longitude: null,
          speed: 0,
          currentStopName: null,
          nextStopName: null,
          distanceToStop: null,
          updatedAt: null,
          isActive: false,
        });
      }
    });
  } else if (busNumber) {
    startQuery("busNumber", busNumber, () => {
      onUpdate({
        latitude: null,
        longitude: null,
        speed: 0,
        currentStopName: null,
        nextStopName: null,
        distanceToStop: null,
        updatedAt: null,
        isActive: false,
      });
    });
  } else {
    onError?.("routeId or busNumber required");
  }

  return () => {
    cancelled = true;
    activeUnsub();
  };
};

export const calculateNearestStop = (busLat, busLng, stops) =>
  getNearestStop(busLat, busLng, stops);

export const calculateNextStop = (busLat, busLng, stops) => {
  const { index, nextStop } = getNearestStop(busLat, busLng, stops);
  return { index, nextStop: nextStop || stops[index + 1] || null };
};

export const calculateRemainingDistance = (busLat, busLng, stops, currentIndex) => {
  if (!stops?.length) {
    return { remainingKm: 0, coveredKm: 0, totalKm: 0 };
  }

  const coords = stops
    .filter((s) => s.latitude != null && s.longitude != null)
    .map((s) => ({ latitude: s.latitude, longitude: s.longitude }));

  const totalKm = sumRouteDistanceKm(coords);
  if (busLat == null || busLng == null) {
    return { remainingKm: totalKm, coveredKm: 0, totalKm };
  }

  const idx = Math.max(0, Math.min(currentIndex ?? 0, stops.length - 1));
  let coveredKm = 0;

  for (let i = 0; i < idx; i += 1) {
    const a = stops[i];
    const b = stops[i + 1];
    if (a?.latitude == null || b?.latitude == null) continue;
    coveredKm += haversineKm(a.latitude, a.longitude, b.latitude, b.longitude) || 0;
  }

  const current = stops[idx];
  if (current?.latitude != null) {
    coveredKm += haversineKm(busLat, busLng, current.latitude, current.longitude) || 0;
  }

  const end = stops[stops.length - 1];
  let remainingKm = 0;
  if (end?.latitude != null) {
    remainingKm = haversineKm(busLat, busLng, end.latitude, end.longitude) || 0;
  }

  return {
    totalKm: totalKm || coveredKm + remainingKm,
    coveredKm: Math.min(coveredKm, totalKm || coveredKm),
    remainingKm: Math.max(0, remainingKm),
  };
};

export const calculateEta = (remainingKm, speedKmh) =>
  calculateEtaMinutes(remainingKm, speedKmh);
