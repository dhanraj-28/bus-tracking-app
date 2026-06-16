// src/services/BusDetailService.js

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

export const saveBusSession = async (driverUniqueId, busData) => {
  if (!driverUniqueId) {
    throw new Error("DRIVER_ID_MISSING");
  }

  if (!busData) {
    throw new Error("BUS_DATA_INVALID");
  }

  // ✅ Save into "qr routes" collection as a new document
  const qrRoutesRef = collection(db, "qr routes");

  await addDoc(qrRoutesRef, {
    driverUniqueId,
    busName: busData.busName,
    routeId: busData.routeId || null,
    routeName: busData.routeName,
    routeNumber: busData.routeNumber,
    routeDate: busData.routeDate,
    sessionStartedAt: serverTimestamp(),
    isActive: true,
  });

  return { success: true };
};