// src/services/driDashboardService.js

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  GeoPoint,
} from "firebase/firestore";
import { db } from "../config/firebase";
import * as Location from "expo-location";

// ─────────────────────────────────────────
// 1. FETCH BUS INFO
//    Flow: drivers → assignedBusId
//          buses/{busId} → routeId, busNumber
//          Routes/{routeId} → STOPS
// ─────────────────────────────────────────
export const fetchBusInfo = async (driverUniqueId) => {
  // Step 1: Get driver document to find assignedBusId
  const driverQuery = query(
    collection(db, "drivers"),
    where("driverUniqueId", "==", driverUniqueId)
  );
  const driverSnap = await getDocs(driverQuery);

  if (driverSnap.empty) throw new Error("DRIVER_NOT_FOUND");

  const driverData = driverSnap.docs[0].data();
  const assignedBusId = driverData.assignedBusId;

  if (!assignedBusId) throw new Error("BUS_NOT_ASSIGNED");

  // Step 2: Get bus document using assignedBusId as doc ID
  // Firestore IDs are lowercase: "BUS101" → try both cases
  const busDocRef = doc(db, "buses", assignedBusId.toLowerCase());
  const busSnap = await getDoc(busDocRef);

  if (!busSnap.exists()) throw new Error("BUS_NOT_FOUND");

  const busData = { id: busSnap.id, ...busSnap.data() };

  // Step 3: Get route from Routes collection using buses.routeId
  const routeId = busData.routeId;
  let stopsSequence = [];
  let routeName = null;
  let startStop = null;
  let endStop = null;

  if (routeId) {
    const routeDocRef = doc(db, "Routes", routeId);
    const routeSnap = await getDoc(routeDocRef);

    if (routeSnap.exists()) {
      const routeData = routeSnap.data();

      // Sort STOPS map by stop number: stop1, stop2, stop3...
      const stopsMap = routeData.STOPS || {};
      stopsSequence = Object.keys(stopsMap)
        .sort((a, b) => {
          const numA = parseInt(a.replace("stop", ""));
          const numB = parseInt(b.replace("stop", ""));
          return numA - numB;
        })
        .map((key) => ({ id: key, name: stopsMap[key] }));

      routeName = routeData.routeName || null;
      startStop = routeData.startStop || null;
      endStop = routeData.endStop || null;
    }
  }

  return {
    busDocId: busSnap.id,           // "bus101" — used as busLocations doc ID
    busNumber: busData.busNumber,   // "TN01AB1234"
    routeId,                        // "ROUTE101"
    routeName,                      // "Gudiyattam to vellore"
    startStop,
    endStop,
    stopsSequence,                  // ordered array of stops
    assignedBusId,                  // "BUS101"
  };
};

// ─────────────────────────────────────────
// 2. DETERMINE CURRENT & NEXT STOP
// ─────────────────────────────────────────
export const determineStops = (stopsSequence, currentStopIndex) => {
  if (!stopsSequence || stopsSequence.length === 0) {
    return { currentStopId: null, currentStopName: null, nextStopId: null, nextStopName: null };
  }

  const safeIndex = Math.min(currentStopIndex, stopsSequence.length - 1);
  const current = stopsSequence[safeIndex];
  const next = stopsSequence[safeIndex + 1] || null;

  return {
    currentStopId: current?.id || null,
    currentStopName: current?.name || null,
    nextStopId: next?.id || null,
    nextStopName: next?.name || null,
  };
};

// ─────────────────────────────────────────
// 3. START GPS SESSION
// ─────────────────────────────────────────
export const startGpsSession = async (driverUniqueId, busDocId) => {
  const sessionRef = doc(db, "driverSessions", driverUniqueId);

  await setDoc(sessionRef, {
    driverUniqueId,
    busId: busDocId || null,
    gpsActive: true,
    isActive: true,
    sessionStartedAt: serverTimestamp(),
    sessionEndedAt: null,
    totalDuration: 0,
  });

  // Update driver isGpsOn = true
  const driverQuery = query(
    collection(db, "drivers"),
    where("driverUniqueId", "==", driverUniqueId)
  );
  const driverSnap = await getDocs(driverQuery);
  if (!driverSnap.empty) {
    await updateDoc(driverSnap.docs[0].ref, {
      isGpsOn: true,
      isActive: true,
    });
  }
};

// ─────────────────────────────────────────
// 4. STOP GPS SESSION
// ─────────────────────────────────────────
export const stopGpsSession = async (driverUniqueId, totalSeconds) => {
  const sessionRef = doc(db, "driverSessions", driverUniqueId);

  await updateDoc(sessionRef, {
    gpsActive: false,
    isActive: false,
    sessionEndedAt: serverTimestamp(),
    totalDuration: totalSeconds,
  });

  const driverQuery = query(
    collection(db, "drivers"),
    where("driverUniqueId", "==", driverUniqueId)
  );
  const driverSnap = await getDocs(driverQuery);
  if (!driverSnap.empty) {
    await updateDoc(driverSnap.docs[0].ref, {
      isGpsOn: false,
      isActive: false,
    });
  }
};

// ─────────────────────────────────────────
// 5. UPDATE LIVE LOCATION in busLocations
//    Document ID = busDocId (e.g. "bus101")
// ─────────────────────────────────────────
export const updateBusLocation = async (
  busDocId,
  driverUniqueId,
  routeId,
  stopsSequence,
  currentStopIndex
) => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") throw new Error("LOCATION_PERMISSION_DENIED");

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  const { latitude, longitude, speed } = location.coords;

  const { currentStopId, currentStopName, nextStopId, nextStopName } =
    determineStops(stopsSequence, currentStopIndex);

  // Save to busLocations/{busDocId} e.g. busLocations/bus101
  const busLocRef = doc(db, "busLocations", busDocId);

  await setDoc(
    busLocRef,
    {
      driverUniqueId,
      routeId: routeId || null,
      location: new GeoPoint(latitude, longitude),
      speed: speed ? Math.round(speed * 3.6) : 0,
      currentStopId: currentStopId || null,
      currentStopName: currentStopName || null,
      nextStopId: nextStopId || null,
      nextStopName: nextStopName || null,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return { latitude, longitude, currentStopId, nextStopId };
};

// ─────────────────────────────────────────
// 6. GET SESSION COUNT FOR TODAY
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