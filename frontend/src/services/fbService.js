import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../config/firebase";

export const submitFeedbackService = async ({
  userId,
  rating,
  locationAccuracy,
  message,
}) => {
  try {
    const feedbackRef = doc(collection(db, "feedback"));

    await setDoc(feedbackRef, {
      feedbackId: feedbackRef.id,
      userId,
      rating,
      locationAccuracy,
      message,
      createdAt: serverTimestamp(),
    });

    return {
      success: true,
      feedbackId: feedbackRef.id,
    };
  } catch (error) {
    console.log("Feedback Save Error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};
