import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebaseConfig";

// Add SOS Contact
export const addSOSContact = async (uid, contactData) => {
  try {
    const sosRef = collection(db, "users", uid, "sosContacts");

    const docRef = await addDoc(sosRef, {
      phone: contactData.phone,
      message: contactData.message,
      createdAt: serverTimestamp(),
    });

    return {
      success: true,
      id: docRef.id,
    };
  } catch (error) {
    console.log("Error adding SOS contact:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};