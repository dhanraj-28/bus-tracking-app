// src/services/DashboardService.js

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
// 1. FETCH BUS INFO from qr routes
// ─────────────────────────────────────────
export const fetchBusInfo = async (driverUniqueId) => {
  const q = query(
    collection(db, "qr routes"),
    where("driverUniqueId", "==", driverUniqueId)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error("BUS_INFO_NOT_FOUND");
  }

  // Get latest session (last document)
  const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return docs[docs.length - 1];
};

// ─────────────────────────────────────────
// 2. START GPS SESSION
// ─────────────────────────────────────────
export const startGpsSession = async (driverUniqueId, busId) => {
  const sessionRef = doc(db, "driverSessions", driverUniqueId);

  await setDoc(sessionRef, {
    driverUniqueId,
    busId: busId || null,
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
// 3. STOP GPS SESSION
// ─────────────────────────────────────────
export const stopGpsSession = async (driverUniqueId, totalSeconds) => {
  const sessionRef = doc(db, "driverSessions", driverUniqueId);

  await updateDoc(sessionRef, {
    gpsActive: false,
    isActive: false,
    sessionEndedAt: serverTimestamp(),
    totalDuration: totalSeconds,
  });

  // Update driver isGpsOn = false
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
// 4. UPDATE LIVE LOCATION in busLocations
// ─────────────────────────────────────────
export const updateBusLocation = async (busId, driverUniqueId) => {
  // Request location permission
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("LOCATION_PERMISSION_DENIED");
  }

  // Get current position
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  const { latitude, longitude, speed } = location.coords;

  // Update busLocations/{busId}
  const busLocRef = doc(db, "busLocations", busId || driverUniqueId);

  await setDoc(busLocRef, {
    driverUniqueId,
    location: new GeoPoint(latitude, longitude),
    speed: speed ? Math.round(speed * 3.6) : 0, // convert m/s to km/h
    updatedAt: serverTimestamp(),
  }, { merge: true }); // merge so currentStopId/nextStopId are not overwritten

  return { latitude, longitude };
};

// ─────────────────────────────────────────
// 5. GET SESSION COUNT FOR TODAY
// ─────────────────────────────────────────
export const getTodaySessionCount = async (driverUniqueId) => {
  // Get start of today
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