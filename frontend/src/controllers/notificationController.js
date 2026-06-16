// ============================================================
//  notificationController.js  —  Notification Controller
//  Orchestrates fetching and marking notifications as read.
//  Called directly from NotificationsPage.jsx
// ============================================================

import { auth } from "../config/firebase";
import {
  fetchUnreadNotifications,
  markNotificationAsRead,
} from "../services/notificationService";

// ─────────────────────────────────────────────
//  HELPER: Get logged-in user's UID safely
// ─────────────────────────────────────────────
const getAuthenticatedUserId = () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("No authenticated user. Please log in again.");
  }
  return currentUser.uid;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  LOAD NOTIFICATIONS
//  Fetches all unread notifications for the logged-in user.
//  Call this in useEffect on mount inside NotificationsPage.
//
//  @param {object} callbacks
//    {
//      onSuccess: (notifications) => void  ← array of notification objects
//      onError:   (msg) => void
//    }
//
//  USAGE in NotificationsPage:
//    import { loadNotifications } from '../controllers/notificationController';
//
//    useEffect(() => {
//      loadNotifications({
//        onSuccess: (data) => setNotifications(data),
//        onError:   (msg) => Alert.alert('Error', msg),
//      });
//    }, []);
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const loadNotifications = async ({ onSuccess, onError }) => {
  try {
    const userId       = getAuthenticatedUserId();
    const notifications = await fetchUnreadNotifications(userId);

    console.log(`[Notifications] ✅ Fetched ${notifications.length} unread notifications`);
    onSuccess(notifications);

  } catch (error) {
    console.error("[Notifications] ❌ Fetch failed:", error);
    onError("Could not load notifications. Please try again.");
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  HANDLE NOTIFICATION TAP
//  Marks the tapped notification as read in Firestore,
//  then removes it from the UI list immediately.
//
//  @param {string}   notificationId  - the tapped notification's Firestore doc ID
//  @param {object}   callbacks
//    {
//      onSuccess: () => void   ← remove from UI list
//      onError:   (msg) => void
//    }
//
//  USAGE in NotificationsPage:
//    import { handleNotificationTap } from '../controllers/notificationController';
//
//    const handleAction = (notificationId) => {
//      handleNotificationTap(notificationId, {
//        onSuccess: () => {
//          // Remove from local state immediately (optimistic UI)
//          setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
//        },
//        onError: (msg) => Alert.alert('Error', msg),
//      });
//    };
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const handleNotificationTap = async (notificationId, { onSuccess, onError }) => {
  try {
    const userId = getAuthenticatedUserId();

    // Mark as read in Firestore
    await markNotificationAsRead(userId, notificationId);

    console.log(`[Notifications] ✅ Marked as read | id: ${notificationId}`);

    // Remove from UI
    onSuccess();

  } catch (error) {
    console.error("[Notifications] ❌ Mark as read failed:", error);
    onError("Could not update notification. Please try again.");
  }
};
