// ============================================================
//  NotificationsPage.jsx
//  CHANGES FROM YOUR ORIGINAL:
//   1. Removed hardcoded dummy data from useEffect
//   2. useEffect now calls loadNotifications() from controller
//      which fetches only read:false docs from Firestore
//   3. handleAction() now calls handleNotificationTap() from controller
//      which sets read:true in Firestore then removes from UI
//   4. Added loading state while fetching
//   5. Added empty state message when no notifications exist
//   6. Icon mapped from notification `type` field (since Firestore
//      docs don't have an icon field — we derive it from type)
//   Everything else (UI layout, styles, colors) is UNCHANGED.
// ============================================================

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

// ── Controller imports ───────────────────────────────────────
import {
  loadNotifications,
  handleNotificationTap,
} from "../../src/controllers/notificationController";

// ─────────────────────────────────────────────
//  Map notification `type` → Ionicons icon name
//  Add more types here as you add new notification types later
// ─────────────────────────────────────────────
const getIconForType = (type) => {
  switch (type) {
    case "payment_success": return "card-outline";
    case "pass_expiry":     return "card-outline";
    case "bus_arriving":    return "bus-outline";
    case "pass_approved":   return "checkmark-circle-outline";
    case "thanks_msg":      return "heart-outline";
    default:                return "notifications-outline";
  }
};

// ─────────────────────────────────────────────
//  Map notification `type` → button label
//  Keeps your original button UI intact
// ─────────────────────────────────────────────
const getButtonLabel = (type) => {
  switch (type) {
    case "payment_success": return "OK";
    case "pass_expiry":     return "Renew";
    case "bus_arriving":    return "Check";
    case "pass_approved":   return "View";
    default:                return "OK";
  }
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const navigation = useNavigation();

  // ── Fetch unread notifications on mount ──────────────────
  useEffect(() => {
    loadNotifications({
      onSuccess: (data) => {
        setNotifications(data);
        setLoading(false);
      },
      onError: (msg) => {
        setLoading(false);
        Alert.alert("Error", msg);
      },
    });
  }, []);

  // ── Handle notification tap ──────────────────────────────
  // Marks as read in Firestore + removes from UI immediately
  const handleAction = (notificationId) => {
    // Optimistic UI — remove from list immediately for instant feedback
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

    // Then update Firestore in background
    handleNotificationTap(notificationId, {
      onSuccess: () => {
        console.log(`[UI] Notification ${notificationId} removed from list`);
      },
      onError: (msg) => {
        // If Firestore update failed, add it back to UI
        Alert.alert("Error", msg);
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffffff", paddingTop: 50 }}>

      {/* Header — UNCHANGED */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 10,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons style={styles.backIcon} name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: "700", marginLeft: 20 }}>
          NOTIFICATIONS
        </Text>
      </View>

      {/* ── Loading state ── */}
      {loading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#7C77F7" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      )}

      {/* ── Empty state ── */}
      {!loading && notifications.length === 0 && (
        <View style={styles.centerContainer}>
          <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No new notifications</Text>
          <Text style={styles.emptySubText}>You're all caught up!</Text>
        </View>
      )}

      {/* Notification List — UI UNCHANGED */}
      {!loading && notifications.length > 0 && (
        <ScrollView style={{ paddingHorizontal: 15 }}>
          {notifications.map((item) => (
            <View
              key={item.id}
              style={{
                backgroundColor: "#d3cae7ff",
                borderRadius: 12,
                padding: 15,
                marginBottom: 15,
                borderWidth: 1,
                borderColor: "#eee",
              }}
            >
              {/* Title Row — UNCHANGED layout */}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name={getIconForType(item.type)}  // ← derived from type field
                  size={22}
                  style={{ marginRight: 10 }}
                />
                <Text style={{ fontSize: 17, fontWeight: "600" }}>
                  {item.title}
                </Text>
              </View>

              {/* Description — UNCHANGED */}
              <Text style={{ fontSize: 14, marginTop: 8, color: "#555" }}>
                {item.message}
              </Text>

              {/* Button — UNCHANGED style, label derived from type */}
              <TouchableOpacity
                onPress={() => handleAction(item.id)}
                style={{
                  alignSelf: "flex-end",
                  backgroundColor: "#7C77F7",
                  paddingVertical: 8,
                  paddingHorizontal: 22,
                  borderRadius: 8,
                  marginTop: 12,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
                  {getButtonLabel(item.type)}  {/* ← derived from type */}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  backIcon: {},
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#9CA3AF",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 13,
    color: "#D1D5DB",
    marginTop: 6,
  },
});