import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { extractStoppingsFromRoute } from "../utils/routeStops";
import { getStopCoordinatesBatch } from "./mapService";

const ROUTES_COLLECTION = "Routes";

const executeRoutesOp = async (op) => {
  try {
    return await op(ROUTES_COLLECTION);
  } catch (error) {
    const msg = String(error.message || error).toLowerCase();
    if (msg.includes("permission") && ROUTES_COLLECTION === "Routes") {
      return await op("routes");
    }
    throw error;
  }
};

const buildOrderedStopNames = (routeData) => {
  if (!routeData) return [];

  const middle = extractStoppingsFromRoute(routeData).map((s) => s.name);
  const start = routeData.startStop?.trim();
  const end = routeData.endStop?.trim();
  const names = [];

  if (start) names.push(start);

  middle.forEach((name) => {
    const trimmed = name?.trim();
    if (!trimmed) return;
    const last = names[names.length - 1];
    if (last?.toLowerCase() !== trimmed.toLowerCase()) {
      names.push(trimmed);
    }
  });

  if (end) {
    const last = names[names.length - 1];
    if (last?.toLowerCase() !== end.toLowerCase()) {
      names.push(end);
    }
  }

  return names.length ? names : middle;
};

const mapRouteDoc = (routeDoc) => {
  const data = routeDoc.data();
  const stopNames = buildOrderedStopNames(data);
  return {
    ...data,
    id: routeDoc.id,
    routeId: routeDoc.id,
    stopNames,
    startStop: data.startStop || stopNames[0] || "",
    endStop: data.endStop || stopNames[stopNames.length - 1] || "",
    busNumber: data.busName || data.busNumber || "",
    distance: data.Distance ?? data.distance ?? null,
  };
};

export const searchBusByNumber = async (searchText) => {
  const queryStr = (searchText || "").trim().toLowerCase();
  if (!queryStr) return [];

  const routes = await executeRoutesOp(async (collectionName) => {
    const snapshot = await getDocs(collection(db, collectionName));
    const matches = [];

    snapshot.forEach((routeDoc) => {
      const route = mapRouteDoc(routeDoc);
      const busName = (route.busName || route.busNumber || "").toLowerCase();
      const routeName = (route.routeName || "").toLowerCase();

      if (busName.includes(queryStr) || routeName.includes(queryStr)) {
        matches.push({
          id: route.id,
          routeId: route.id,
          busNumber: route.busName || route.busNumber,
          busName: route.busName || route.busNumber,
          routeName: route.routeName,
          startStop: route.startStop,
          endStop: route.endStop,
          from: route.startStop,
          to: route.endStop,
          destination: route.endStop,
          distance: route.distance,
        });
      }
    });

    return matches;
  });

  return routes;
};

export const getRouteByBusNumber = async (busNumber) => {
  const results = await searchBusByNumber(busNumber);
  const exact = results.find(
    (r) =>
      r.busNumber?.toLowerCase() === busNumber.toLowerCase() ||
      r.busName?.toLowerCase() === busNumber.toLowerCase()
  );
  return exact || results[0] || null;
};

export const getRouteById = async (routeId) => {
  if (!routeId) return null;

  return executeRoutesOp(async (collectionName) => {
    const snap = await getDoc(doc(db, collectionName, String(routeId)));
    if (!snap.exists()) return null;
    return mapRouteDoc(snap);
  });
};

export const getRouteStops = async (routeId) => {
  const route = await getRouteById(routeId);
  if (!route) return [];

  const stopNames = route.stopNames || buildOrderedStopNames(route);
  return stopNames.map((name, index) => ({
    id: `stop-${index}`,
    name,
    index,
    time: "",
  }));
};

export const getCompleteRoute = async (routeId) => {
  const route = await getRouteById(routeId);
  if (!route) {
    return { route: null, stops: [], polylineStops: [] };
  }

  const stopNames = route.stopNames || buildOrderedStopNames(route);
  const coordsMap = await getStopCoordinatesBatch(stopNames);

  const stops = stopNames.map((name, index) => {
    const coords = coordsMap[name] || coordsMap[name.trim()] || null;
    return {
      id: `stop-${index}`,
      name,
      index,
      time: "",
      latitude: coords?.latitude ?? null,
      longitude: coords?.longitude ?? null,
    };
  });

  const polylineStops = stops.filter(
    (s) => s.latitude != null && s.longitude != null
  );

  return { route, stops, polylineStops };
};
