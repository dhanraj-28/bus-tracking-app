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
// HELPER: Format seconds to "1h 23m 45s"
// ─────────────────────────────────────────
export const formatDuration = (totalSeconds) => {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
};

// ─────────────────────────────────────────
// 1. FETCH BUS INFO
//    drivers → assignedBusId → buses → routeId → Routes → STOPS
// ─────────────────────────────────────────
export const fetchBusInfo = async (driverUniqueId) => {
  const driverQuery = query(
    collection(db, "drivers"),
    where("driverUniqueId", "==", driverUniqueId)
  );
  const driverSnap = await getDocs(driverQuery);
  if (driverSnap.empty) throw new Error("DRIVER_NOT_FOUND");

  const driverData = driverSnap.docs[0].data();
  const assignedBusId = driverData.assignedBusId;
  if (!assignedBusId) throw new Error("BUS_NOT_ASSIGNED");

  let busSnap = await getDoc(doc(db, "buses", assignedBusId.toLowerCase()));
  if (!busSnap.exists()) {
    busSnap = await getDoc(doc(db, "buses", assignedBusId));
  }
  if (!busSnap.exists()) throw new Error("BUS_NOT_FOUND");

  const busData = { id: busSnap.id, ...busSnap.data() };
  const routeId = busData.routeId;
  let stopsSequence = [];
  let routeName = null;
  let startStop = null;
  let endStop = null;

  if (routeId) {
    const routeSnap = await getDoc(doc(db, "Routes", routeId));
    if (routeSnap.exists()) {
      const routeData = routeSnap.data();
      const stopsMap = routeData.STOPS || {};
      stopsSequence = Object.keys(stopsMap)
        .sort((a, b) => parseInt(a.replace("stop", "")) - parseInt(b.replace("stop", "")))
        .map((key) => ({ id: key, name: stopsMap[key] }));
      routeName = routeData.routeName || null;
      startStop = routeData.startStop || null;
      endStop = routeData.endStop || null;
    }
  }

  return {
    busDocId: busSnap.id,
    busNumber: busData.busNumber,
    routeId,
    routeName,
    startStop,
    endStop,
    stopsSequence,
    assignedBusId,
  };
};

// ─────────────────────────────────────────
// 2. CHECK EXISTING GPS SESSION
//    Returns session if gpsActive: true
// ─────────────────────────────────────────
export const checkExistingSession = async (driverUniqueId) => {
  const sessionRef = doc(db, "driverSessions", driverUniqueId);
  const sessionSnap = await getDoc(sessionRef);

  if (!sessionSnap.exists()) return null;

  const sessionData = sessionSnap.data();

  // If GPS was already active, return session with elapsed time
  if (sessionData.gpsActive && sessionData.sessionStartedAt) {
    const startedAt = sessionData.sessionStartedAt.toDate();
    const now = new Date();
    const elapsedSeconds = Math.floor((now - startedAt) / 1000);

    return {
      isActive: true,
      elapsedSeconds,
      busId: sessionData.busId,
      sessionStartedAt: startedAt,
    };
  }

  return null;
};

// ─────────────────────────────────────────
// 3. DETERMINE CURRENT & NEXT STOP
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
// 4. START GPS SESSION
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
    totalDurationFormatted: "0s",
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
// 5. STOP GPS SESSION
//    Stores duration in seconds + human readable format
// ─────────────────────────────────────────
export const stopGpsSession = async (driverUniqueId, totalSeconds) => {
  const sessionRef = doc(db, "driverSessions", driverUniqueId);

  await updateDoc(sessionRef, {
    gpsActive: false,
    isActive: false,
    sessionEndedAt: serverTimestamp(),
    totalDuration: totalSeconds,                          // e.g. 4980
    totalDurationFormatted: formatDuration(totalSeconds), // e.g. "1h 23m 0s"
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
// 6. UPDATE LIVE LOCATION
// ─────────────────────────────────────────
export const updateBusLocation = async (
  busDocId,
  driverUniqueId,
  routeId,
  stopsSequence,
  currentStopIndex
) => {
  const isLocationEnabled = await Location.hasServicesEnabledAsync();
  if (!isLocationEnabled) throw new Error("LOCATION_SERVICES_DISABLED");

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") throw new Error("LOCATION_PERMISSION_DENIED");

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  const { latitude, longitude, speed } = location.coords;
  const { currentStopId, currentStopName, nextStopId, nextStopName } =
    determineStops(stopsSequence, currentStopIndex);

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
// 7. GET SESSION COUNT FOR TODAY
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