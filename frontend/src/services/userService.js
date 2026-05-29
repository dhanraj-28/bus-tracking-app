import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../config/firebase";

export const createUserInFirestore = async (
  user
) => {

  try {

    await setDoc(
      doc(db, "users", user.uid),
      {

        uid: user.uid,

        phone: user.phoneNumber,

        role: "passenger",

        createdAt: serverTimestamp(),
      }
    );

    return {
      success: true,
    };

  } catch (error) {

    return {
      success: false,
      error: error.message,
    };
  }
};