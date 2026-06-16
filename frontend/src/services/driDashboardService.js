// src/services/driDashboardService.js

import {
  doc, getDoc, setDoc, updateDoc,
  collection, query, where, getDocs,
  serverTimestamp, GeoPoint,
} from "firebase/firestore";
import { db } from "../config/firebase";
import * as Location from "expo-location";

// ─────────────────────────────────────────
// HELPER: Format seconds → "1h 2m 3s"
// ─────────────────────────────────────────
export const formatDuration = (totalSeconds) => {
  const total = Number(totalSeconds) || 0;
  const hrs   = Math.floor(total / 3600);
  const mins  = Math.floor((total % 3600) / 60);
  const secs  = total % 60;
  if (hrs > 0)  return `${hrs}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
};

// ─────────────────────────────────────────
// HELPER: Haversine distance (meters)
// ─────────────────────────────────────────
const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R    = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ─────────────────────────────────────────
// 1. CHECK LOCATION SERVICES
// ─────────────────────────────────────────
export const checkLocationServices = async () => {
  try {
    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) return { enabled: false };
    const { status } = await Location.requestForegroundPermissionsAsync();
    return { enabled: status === "granted" };
  } catch {
    return { enabled: false };
  }
};

// ─────────────────────────────────────────
// HELPER: Fetch stops for a given routeId
//   Trims stop names before querying stopCoordinates
//   so trailing spaces like "Saravana Hospital " don't cause misses
// ─────────────────────────────────────────
const fetchStopsForRoute = async (routeId) => {
  if (!routeId) return { stopsSequence: [], routeName: null, startStop: null, endStop: null };

  const routeSnap = await getDoc(doc(db, "Routes", routeId));
  if (!routeSnap.exists()) {
    console.warn(`fetchStopsForRoute: Route "${routeId}" not found in Firestore`);
    return { stopsSequence: [], routeName: null, startStop: null, endStop: null };
  }

  const routeData = routeSnap.data();
  const stopsMap  = routeData.STOPS || {};

  // Sort stop1, stop2, stop3... in order
  const orderedStopNames = Object.keys(stopsMap)
    .sort((a, b) => parseInt(a.replace("stop", "")) - parseInt(b.replace("stop", "")))
    .map((key) => stopsMap[key].trim()); // ✅ trim trailing/leading spaces

  console.log(`Stops for ${routeId}:`, orderedStopNames);

  const stopsSequence = await Promise.all(
    orderedStopNames.map(async (stopName) => {
      try {
        // Try exact trimmed name first
        let stopSnap = await getDoc(doc(db, "stopCoordinates", stopName));

        // If not found, try case-insensitive by listing and matching
        // (handles minor name differences)
        if (!stopSnap.exists()) {
          console.warn(`stopCoordinates: No doc found for "${stopName}"`);
          return { name: stopName, lat: null, lng: null };
        }

        const stopData = stopSnap.data();
        const geo      = stopData.location; // Firestore GeoPoint

        // ✅ Handles Firestore GeoPoint format (what your DB uses)
        if (geo && typeof geo.latitude === "number") {
          return { name: stopName, lat: geo.latitude, lng: geo.longitude };
        }
        // Fallback: plain {lat, lng} object
        if (geo && typeof geo.lat === "number") {
          return { name: stopName, lat: geo.lat, lng: geo.lng };
        }
        // Fallback: flat fields
        if (typeof stopData.lat === "number") {
          return { name: stopName, lat: stopData.lat, lng: stopData.lng };
        }

        console.warn(`stopCoordinates: Doc exists for "${stopName}" but no recognizable coords`);
        return { name: stopName, lat: null, lng: null };
      } catch (e) {
        console.warn(`stopCoordinates fetch error for "${stopName}":`, e.message);
        return { name: stopName, lat: null, lng: null };
      }
    })
  );

  return {
    stopsSequence,
    routeName:  routeData.routeName  || null,
    startStop:  routeData.startStop  || null,
    endStop:    routeData.endStop    || null,
  };
};

// ─────────────────────────────────────────
// 2. FETCH BUS INFO
//    ✅ FIX: accepts optional qrRouteId parameter
//    If QR has a routeId, use that for stops instead of the buses doc routeId
//    This fixes the wrong-route problem when bus doc has stale routeId
// ─────────────────────────────────────────
export const fetchBusInfo = async (driverUniqueId, qrRouteId = null) => {
  // Step 1: Get driver doc
  const driverQuery = query(
    collection(db, "drivers"),
    where("driverUniqueId", "==", driverUniqueId)
  );
  const driverSnap = await getDocs(driverQuery);
  if (driverSnap.empty) throw new Error("DRIVER_NOT_FOUND");

  const driverData    = driverSnap.docs[0].data();
  const assignedBusId = driverData.assignedBusId; // e.g. "BUS101"
  if (!assignedBusId) throw new Error("BUS_NOT_ASSIGNED");

  // Step 2: Get bus doc (try lowercase first, then as-is)
  // Your DB has doc ID "bus101" but assignedBusId is "BUS101"
  let busSnap = await getDoc(doc(db, "buses", assignedBusId.toLowerCase()));
  if (!busSnap.exists()) busSnap = await getDoc(doc(db, "buses", assignedBusId));
  if (!busSnap.exists()) throw new Error("BUS_NOT_FOUND");

  const busData         = { id: busSnap.id, ...busSnap.data() };
  const busDocRouteId   = busData.routeId; // routeId stored in buses doc

  // ✅ KEY FIX: prefer QR routeId over the buses doc routeId
  // The QR is scanned fresh each session — it always has the correct route
  // The buses doc routeId can be stale (e.g. still says ROUTE101 when today's route is ROUTE33)
  const activeRouteId = qrRouteId || busDocRouteId;

  console.log(`fetchBusInfo: busDocRouteId="${busDocRouteId}" | qrRouteId="${qrRouteId}" | using="${activeRouteId}"`);

  // Step 3: Fetch stops for the active route
  const { stopsSequence, routeName, startStop, endStop } =
    await fetchStopsForRoute(activeRouteId);

  return {
    busDocId:    busSnap.id,          // "bus101"
    busNumber:   busData.busNumber,   // "TN01AB1234"
    routeId:     activeRouteId,       // ROUTE33 (from QR) or ROUTE101 (from bus doc)
    routeName,
    startStop,
    endStop,
    stopsSequence,
    assignedBusId,
  };
};

// ─────────────────────────────────────────
// 3. FIND NEAREST STOP
// ─────────────────────────────────────────
export const findNearestStop = (stopsSequence, currentLat, currentLng) => {
  if (!stopsSequence || stopsSequence.length === 0) {
    return { currentStop: null, nextStop: null, currentIndex: 0, distanceMeters: null };
  }

  const stopsWithCoords = stopsSequence.filter(
    (s) => s.lat != null && s.lng != null
  );

  if (stopsWithCoords.length === 0) {
    console.warn("findNearestStop: NONE of the stops have coordinates — check stopCoordinates collection");
    return {
      currentStop:    stopsSequence[0] || null,
      nextStop:       stopsSequence[1] || null,
      currentIndex:   0,
      distanceMeters: null,
    };
  }

  let nearestIndex = 0;
  let minDistance  = Infinity;

  stopsSequence.forEach((stop, index) => {
    if (stop.lat == null || stop.lng == null) return;
    const dist = getDistanceMeters(currentLat, currentLng, stop.lat, stop.lng);
    if (dist < minDistance) {
      minDistance  = dist;
      nearestIndex = index;
    }
  });

  return {
    currentStop:    stopsSequence[nearestIndex],
    nextStop:       stopsSequence[nearestIndex + 1] || null,
    currentIndex:   nearestIndex,
    distanceMeters: Math.round(minDistance), // ✅ always returned
  };
};

// ─────────────────────────────────────────
// 4. CHECK EXISTING GPS SESSION
// ─────────────────────────────────────────
export const checkExistingSession = async (driverUniqueId) => {
  const sessionRef  = doc(db, "driverSessions", driverUniqueId);
  const sessionSnap = await getDoc(sessionRef);
  if (!sessionSnap.exists()) return null;

  const data = sessionSnap.data();

  if (data.gpsActive && data.sessionStartedAt) {
    const startedAt        = data.sessionStartedAt.toDate();
    const currentElapsed   = Math.floor((Date.now() - startedAt) / 1000);
    const previousDuration = Number(data.totalDuration) || 0;
    return { isActive: true, elapsedSeconds: previousDuration + currentElapsed, busId: data.busId };
  }

  if (!data.gpsActive && Number(data.totalDuration) > 0) {
    return { isActive: false, elapsedSeconds: Number(data.totalDuration), busId: data.busId };
  }

  return null;
};

// ─────────────────────────────────────────
// 5. START GPS SESSION
// ─────────────────────────────────────────
export const startGpsSession = async (driverUniqueId, busDocId, previousSeconds) => {
  const safePrevious = Number(previousSeconds) || 0;
  const sessionRef   = doc(db, "driverSessions", driverUniqueId);
  await setDoc(sessionRef, {
    driverUniqueId,
    busId:                  busDocId || null,
    gpsActive:              true,
    isActive:               true,
    sessionStartedAt:       serverTimestamp(),
    sessionEndedAt:         null,
    totalDuration:          safePrevious,
    totalDurationFormatted: formatDuration(safePrevious),
  });

  const driverQuery = query(
    collection(db, "drivers"),
    where("driverUniqueId", "==", driverUniqueId)
  );
  const driverSnap = await getDocs(driverQuery);
  if (!driverSnap.empty) {
    await updateDoc(driverSnap.docs[0].ref, { isGpsOn: true, isActive: true });
  }
};

// ─────────────────────────────────────────
// 6. STOP GPS SESSION
// ─────────────────────────────────────────
export const stopGpsSession = async (driverUniqueId, totalSeconds) => {
  const safeTotal  = Number(totalSeconds) || 0;
  const sessionRef = doc(db, "driverSessions", driverUniqueId);
  await updateDoc(sessionRef, {
    gpsActive:              false,
    isActive:               false,
    sessionEndedAt:         serverTimestamp(),
    totalDuration:          safeTotal,
    totalDurationFormatted: formatDuration(safeTotal),
  });

  const driverQuery = query(
    collection(db, "drivers"),
    where("driverUniqueId", "==", driverUniqueId)
  );
  const driverSnap = await getDocs(driverQuery);
  if (!driverSnap.empty) {
    await updateDoc(driverSnap.docs[0].ref, { isGpsOn: false, isActive: false });
  }
};

// ─────────────────────────────────────────
// 7. UPDATE LIVE LOCATION
// ─────────────────────────────────────────
export const updateBusLocation = async (
  busDocId, driverUniqueId, routeId, stopsSequence
) => {
  const isLocationEnabled = await Location.hasServicesEnabledAsync();
  if (!isLocationEnabled) throw new Error("LOCATION_SERVICES_DISABLED");

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") throw new Error("LOCATION_PERMISSION_DENIED");

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  const { latitude, longitude, speed } = location.coords;
  console.log("GPS coords:", latitude, longitude);

  const { currentStop, nextStop, currentIndex, distanceMeters } =
    findNearestStop(stopsSequence, latitude, longitude);

  console.log("Nearest stop:", currentStop?.name, "| dist:", distanceMeters, "m");

  const busLocRef = doc(db, "busLocations", busDocId);
  await setDoc(busLocRef, {
    driverUniqueId,
    routeId:         routeId        || null,
    location:        new GeoPoint(latitude, longitude),
    speed:           speed ? Math.round(speed * 3.6) : 0,
    currentStopName: currentStop?.name  || null,
    nextStopName:    nextStop?.name     || null,
    distanceToStop:  distanceMeters     || null,
    updatedAt:       serverTimestamp(),
  }, { merge: true });

  // ✅ distanceMeters included in return (was missing before)
  return { latitude, longitude, currentStop, nextStop, currentIndex, distanceMeters };
};

// ─────────────────────────────────────────
// 8. GET SESSION COUNT FOR TODAY
// ─────────────────────────────────────────
export const getTodaySessionCount = async (driverUniqueId) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const q = query(
    collection(db, "driverSessions"),
    where("driverUniqueId", "==", driverUniqueId),
    where("sessionStartedAt", ">=", startOfDay)
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
};