// src/services/driService.js

import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

export const verifyDriver = async (uniqueId, password) => {

  // Query by driverUniqueId field (not document ID)
  const q = query(
    collection(db, "drivers"),
    where("driverUniqueId", "==", uniqueId.trim())
  );

  const snapshot = await getDocs(q);

  console.log("Docs found:", snapshot.size); // check in Metro terminal

  if (snapshot.empty) {
    throw new Error("DRIVER_NOT_FOUND");
  }

  const driverData = snapshot.docs[0].data();

  console.log("Driver data:", driverData); // check fields

  // Compare password — convert both to string since password is stored as number
  if (String(password) !== String(driverData.password)) {
    throw new Error("WRONG_PASSWORD");
  }

  return { success: true, driver: driverData };
};