// ============================================================
//  trackBusService.js  —  TEAMMATE'S FILE + NEW ADDITIONS
//  ADDED at bottom (teammate's code untouched above):
//   - subscribeToBusLocationByRoute()  ← new realtime function
//  Everything above the NEW ADDITIONS line is teammate's original code.
// ============================================================

import { db } from "../config/firebase";

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

import { extractStoppingsFromRoute } from "../utils/routeStops";

// ── TEAMMATE'S ORIGINAL CODE — NOT TOUCHED ───────────────────

let ROUTES_COLLECTION = "Routes";
const STOPPING_SUBCOLLECTIONS = ["stoppings", "stops", "Stoppings", "stopping"];

const executeFirestoreOp = async (op) => {
  try {
    return await op(ROUTES_COLLECTION);
  } catch (error) {
    const errorMsg = String(error.message || error).toLowerCase();
    const isPermissionError = errorMsg.includes("permission") || errorMsg.includes("denied") || error.code === "permission-denied";
    if (isPermissionError && ROUTES_COLLECTION === "Routes") {
      console.log("[Firebase Fallback] Permission denied for 'Routes' collection. Retrying with 'routes' (lowercase)...");
      ROUTES_COLLECTION = "routes";
      return await op(ROUTES_COLLECTION);
    }
    throw error;
  }
};

export const getAllRoutesService = async () => {
  try {
    return await executeFirestoreOp(async (collectionName) => {
      const routesRef = collection(db, collectionName);
      const snapshot = await getDocs(routesRef);
      const routes = [];

      snapshot.forEach((routeDoc) => {
        routes.push({
          ...routeDoc.data(),
          routeId: routeDoc.id,
          id: routeDoc.id,
        });
      });

      return routes;
    });
  } catch (error) {
    console.log("Service Error:", error);
    throw error;
  }
};

export const getRouteByIdService = async (routeId) => {
  try {
    if (!routeId) {
      return null;
    }

    return await executeFirestoreOp(async (collectionName) => {
      const routeRef = doc(db, collectionName, String(routeId));
      const snapshot = await getDoc(routeRef);

      if (!snapshot.exists()) {
        console.log("[Stoppings] Document not found:", routeId);
        return null;
      }

      return {
        ...snapshot.data(),
        routeId: snapshot.id,
        id: snapshot.id,
      };
    });
  } catch (error) {
    console.log("Service Error:", error);
    throw error;
  }
};

const fetchStoppingsFromSubcollections = async (routeId) => {
  return await executeFirestoreOp(async (collectionName) => {
    for (const subName of STOPPING_SUBCOLLECTIONS) {
      const stoppingsRef = collection(
        db,
        collectionName,
        String(routeId),
        subName
      );
      const snapshot = await getDocs(stoppingsRef);

      if (snapshot.empty) continue;

      const items = [];
      snapshot.forEach((stopDoc) => {
        items.push({ id: stopDoc.id, ...stopDoc.data() });
      });

      const normalized = extractStoppingsFromRoute({ stoppings: items });
      if (normalized.length > 0) {
        return normalized;
      }
    }
    return [];
  });
};

export const getStoppingsByRouteIdService = async (routeId) => {
  const route = await getRouteByIdService(routeId);

  if (!route) {
    return { route: null, stoppings: [] };
  }

  console.log("[Stoppings] Fetched route:", routeId, "keys:", Object.keys(route));

  let stoppings = extractStoppingsFromRoute(route);

  if (stoppings.length > 0) {
    console.log("[Stoppings] Found", stoppings.length, "from document fields");
    return { route, stoppings };
  }

  stoppings = await fetchStoppingsFromSubcollections(routeId);

  if (stoppings.length > 0) {
    console.log("[Stoppings] Found", stoppings.length, "from subcollection");
    return { route, stoppings };
  }

  console.log("[Stoppings] No stoppings for route:", routeId);
  return { route, stoppings: [] };
};

export const searchBusesService = async (searchText) => {
  try {
    const busList = await executeFirestoreOp(async (collectionName) => {
      const routesRef = collection(db, collectionName);
      const snapshot = await getDocs(routesRef);
      const list = [];
      const queryStr = searchText.toLowerCase();

      snapshot.forEach((routeDoc) => {
        const data = routeDoc.data();
        if (
          data.busNumber?.toLowerCase().includes(queryStr) ||
          data.busName?.toLowerCase().includes(queryStr) ||
          data.routeName?.toLowerCase().includes(queryStr)
        ) {
          list.push({
            ...data,
            id: routeDoc.id,
            routeId: routeDoc.id,
          });
        }
      });
      return list;
    });

    return {
      success: true,
      data: busList,
    };
  } catch (error) {
    console.log("Service Error:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

// ── NEW ADDITIONS ─────────────────────────────────────────────
//  Everything below this line is new — teammate's code above is unchanged.
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────
//  REALTIME: Subscribe to busLocations for a route
//
//  Your busLocations doc structure:
//    routeId: "ROUTE101"
//    currentStopName: "Saravana Hospital"
//    nextStopName: "EB (Electricity Board)"
//    distanceToStop: 254
//    location: GeoPoint
//    speed: 0
//    updatedAt: timestamp
//
//  Queries busLocations where routeId == routeId,
//  subscribes with onSnapshot for realtime updates.
//  Returns unsubscribe function — call on screen unmount.
//
//  @param {string}   routeId   - e.g. "ROUTE101"
//  @param {function} onUpdate  - called with { currentStopName, nextStopName,
//                                              distanceToStop, speed, updatedAt }
//  @param {function} onError   - called with error string
//  @returns {function}         - unsubscribe function
// ─────────────────────────────────────────────
export const subscribeToBusLocationByRoute = (routeId, onUpdate, onError) => {
  // Query busLocations where routeId field matches
  const busQuery = query(
    collection(db, "busLocations"),
    where("routeId", "==", routeId),
    limit(1)  // one bus per route for now
  );

  const unsubscribe = onSnapshot(
    busQuery,
    { includeMetadataChanges: false }, // skip local cache updates — saves data on slow networks
    (snapshot) => {
      if (snapshot.empty) {
        // No active bus on this route — driver hasn't started
        onUpdate({
          currentStopName:  null,   // null = bus not started
          nextStopName:     null,
          distanceToStop:   0,
          speed:            0,
          updatedAt:        null,
          isActive:         false,
        });
        return;
      }

      const data = snapshot.docs[0].data();

      onUpdate({
        currentStopName:  data.currentStopName  || null,
        nextStopName:     data.nextStopName     || null,
        distanceToStop:   data.distanceToStop   || 0,
        speed:            data.speed            || 0,
        updatedAt:        data.updatedAt        || null,
        isActive:         true,    // driver is online
      });
    },
    (error) => {
      console.error("[BusLocation] onSnapshot error:", error);
      onError("Could not connect to live bus data.");
    }
  );

  return unsubscribe;
};