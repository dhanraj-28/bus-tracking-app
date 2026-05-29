import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";

const ROUTES_COLLECTION = "Routes";
const BUSES_COLLECTION = "buses";
const BUS_LOCATIONS_COLLECTION = "busLocations";

export function extractStopsFromRoute(routeData) {
  if (!routeData) return [];

  if (routeData.STOPS && typeof routeData.STOPS === "object") {
    return Object.keys(routeData.STOPS)
      .sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ""), 10) || 0;
        const numB = parseInt(b.replace(/\D/g, ""), 10) || 0;
        return numA - numB;
      })
      .map((key) => routeData.STOPS[key])
      .filter(Boolean);
  }

  const stops = [];
  if (routeData.startStop) stops.push(routeData.startStop);

  for (let i = 2; i <= 20; i++) {
    const stop = routeData[`stop${i}`];
    if (stop) stops.push(stop);
  }

  if (routeData.endStop) {
    const last = stops[stops.length - 1];
    if (last?.toLowerCase() !== routeData.endStop.toLowerCase()) {
      stops.push(routeData.endStop);
    }
  }

  return stops;
}

const normalizeStop = (value) =>
  (value || "").trim().toLowerCase().replace(/\s+/g, " ");

const stopsMatch = (query, stopName) => {
  const q = normalizeStop(query);
  const s = normalizeStop(stopName);
  if (!q || !s) return false;
  return s === q || s.includes(q) || q.includes(s);
};

function getStartStop(routeData) {
  const stops = extractStopsFromRoute(routeData);
  return routeData.startStop || stops[0] || "";
}

function getEndStop(routeData) {
  const stops = extractStopsFromRoute(routeData);
  return routeData.endStop || stops[stops.length - 1] || "";
}

function routeMatchesStartEnd(routeData, fromQuery, toQuery) {
  const startStop = getStartStop(routeData);
  const endStop = getEndStop(routeData);

  return stopsMatch(fromQuery, startStop) && stopsMatch(toQuery, endStop);
}

function getBusRouteId(busData) {
  return busData.routeId || busData.routeID || busData.RouteId || null;
}

function mapRouteAndBus(routeDoc, busDoc) {
  const routeData = routeDoc.data();
  const busData = busDoc?.data() ?? {};
  const stops = extractStopsFromRoute(routeData);

  return {
    id: busDoc?.id ?? routeDoc.id,
    routeId: routeDoc.id,
    number: routeData.busName || busData.busNumber || routeDoc.id,
    busNumber: busData.busNumber ?? null,
    routeName: routeData.routeName ?? null,
    from: getStartStop(routeData),
    to: getEndStop(routeData),
    distance: routeData.Distance ?? null,
    stops,
    isActive: busData.isActive ?? true,
    driverId: busData.driverId ?? null,
  };
}

export const fetchAllRoutesService = async () => {
  try {
    const snapshot = await getDocs(collection(db, ROUTES_COLLECTION));
    const routes = snapshot.docs.map((routeDoc) => ({
      id: routeDoc.id,
      ...routeDoc.data(),
      stops: extractStopsFromRoute(routeDoc.data()),
    }));

    return { success: true, routes };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const searchBusesByRouteService = async (from, to) => {
  try {
    const [routesSnap, busesSnap] = await Promise.all([
      getDocs(collection(db, ROUTES_COLLECTION)),
      getDocs(collection(db, BUSES_COLLECTION)),
    ]);

    const busesByRouteId = {};
    busesSnap.docs.forEach((busDoc) => {
      const routeId = getBusRouteId(busDoc.data());
      if (routeId) busesByRouteId[routeId] = busDoc;
    });

    const results = routesSnap.docs
      .filter((routeDoc) => routeMatchesStartEnd(routeDoc.data(), from, to))
      .map((routeDoc) =>
        mapRouteAndBus(routeDoc, busesByRouteId[routeDoc.id])
      )
      .filter((bus) => bus.isActive !== false);

    return {
      success: true,
      buses: results,
      message:
        results.length === 0
          ? "No routes match this From/To. Check startStop and endStop in Firestore."
          : null,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to fetch buses from Firestore",
    };
  }
};

export const fetchRouteEndpointsService = async () => {
  try {
    const routesResult = await fetchAllRoutesService();
    if (!routesResult.success) {
      return routesResult;
    }

    const startStops = new Set();
    const endStops = new Set();

    routesResult.routes.forEach((route) => {
      const start = route.startStop || route.stops[0];
      const end = route.endStop || route.stops[route.stops.length - 1];
      if (start) startStops.add(start);
      if (end) endStops.add(end);
    });

    if (routesResult.routes.length === 0) {
      return {
        success: false,
        error:
          "No routes found in Firestore. Check Routes collection and security rules.",
      };
    }

    return {
      success: true,
      startStops: [...startStops],
      endStops: [...endStops],
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to load stops from Firestore",
    };
  }
};

export const getRouteByIdService = async (routeId) => {
  try {
    const routeRef = doc(db, ROUTES_COLLECTION, routeId);
    const routeSnap = await getDoc(routeRef);

    if (!routeSnap.exists()) {
      return { success: false, error: "Route not found" };
    }

    const data = routeSnap.data();
    return {
      success: true,
      route: {
        id: routeSnap.id,
        ...data,
        stops: extractStopsFromRoute(data),
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getBusLocationService = async (busId) => {
  try {
    const locationRef = doc(db, BUS_LOCATIONS_COLLECTION, busId);
    const locationSnap = await getDoc(locationRef);

    if (!locationSnap.exists()) {
      return { success: false, error: "Location not found" };
    }

    return {
      success: true,
      location: { id: locationSnap.id, ...locationSnap.data() },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const subscribeBusLocationService = (busId, onUpdate, onError) => {
  const locationRef = doc(db, BUS_LOCATIONS_COLLECTION, busId);
  return onSnapshot(
    locationRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onError?.("Location not found");
        return;
      }
      onUpdate({ id: snapshot.id, ...snapshot.data() });
    },
    (error) => onError?.(error.message)
  );
};