// ============================================================
//  notificationService.js  —  Notification Service
//  Handles all Firestore reads/writes for notifications.
//  Collection path: users/{uid}/notifications/{notificationId}
//
//  Fields in each notification doc:
//   title, message, type, read, docPassId, createdAt
// ============================================================

import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

// ─────────────────────────────────────────────
//  FETCH: Get all UNREAD notifications for a user
//  Query: users/{uid}/notifications where read == false
//  Ordered by createdAt descending (newest first)
//
//  @param {string} userId  - logged-in user's UID
//  @returns {Array}        - array of notification objects with id field
// ─────────────────────────────────────────────
export const fetchUnreadNotifications = async (userId) => {
  const notifRef = collection(db, "users", userId, "notifications");

  // Only fetch read:false — read:true are silently excluded
  const notifQuery = query(
    notifRef,
    where("read", "==", false),
    orderBy("createdAt", "desc")   // newest notification at top
  );

  const snapshot = await getDocs(notifQuery);

  // Map each doc → plain object with id included
  return snapshot.docs.map((docSnap) => ({
    id:        docSnap.id,          // Firestore auto-generated notification ID
    ...docSnap.data(),              // title, message, type, read, docPassId, createdAt
  }));
};

// ─────────────────────────────────────────────
//  MARK AS READ: Set read:true on a notification doc
//  Called when user taps a notification card.
//  After this, the notification won't appear in fetchUnreadNotifications().
//
//  @param {string} userId          - logged-in user's UID
//  @param {string} notificationId  - the specific notification doc ID
// ─────────────────────────────────────────────
export const markNotificationAsRead = async (userId, notificationId) => {
  const notifDocRef = doc(db, "users", userId, "notifications", notificationId);
  await updateDoc(notifDocRef, {
    read: true,
  });
};
