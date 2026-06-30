// ============================================================
//  LiveTrack.jsx
//  CHANGES FROM TEAMMATE'S ORIGINAL:
//   1. Added subscribeBusLocation() call after stops load
//   2. currentStopIndex now driven by live busLocations data
//      (was always 0 before — that's why bus icon never moved)
//   3. Added busData state for status bar info
//   4. Added busStatus state: "loading" | "inactive" | "active"
//   5. Cleanup: unsubscribe on unmount to prevent memory leak
//   6. Added updatedAt display in status (shows "X seconds ago")
//   Everything else (UI, styles, header, LiveBarTrack props) UNCHANGED.
// ============================================================

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LiveBarTrack from "./LiveBarTrack";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // ← new import
import {
  getRouteStoppingsById,
  subscribeBusLocation,
} from "../../src/controllers/trackController";

export default function LiveTrack({ route }) {
  const navigation = useNavigation();
  const { bus } = route?.params || {};

  const [stops, setStops]                   = useState([]);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [loading, setLoading]               = useState(true);
  const [busData, setBusData]               = useState(null);      // ← new
  const [busStatus, setBusStatus]           = useState("loading"); // ← new: "loading"|"inactive"|"active"

  // ── Keep unsubscribe ref so we can clean up on unmount ───────
  const unsubscribeRef = useRef(null);

  // ── Fetch stops (unchanged from teammate's logic) ────────────
  const fetchStops = async () => {
    console.log("[LiveTrack] Selected bus:", bus);

    if (!bus?.id && !bus?.routeId) {
      console.log("[LiveTrack] No bus ID found in params!");
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const routeId = bus.id || bus.routeId;
      const result  = await getRouteStoppingsById(routeId);

      console.log("[LiveTrack] Fetch result for route ID:", routeId, result);

      if (result) {
        const loadedStops = result.stoppings || [];
        setStops(loadedStops);

        // ── NEW: Start realtime bus location subscription ──────
        // Only start after stops are loaded so we can match stop names → index
        startBusTracking(routeId, loadedStops);
      }
    } catch (error) {
      console.error("Error fetching stops:", error);
    } finally {
      setLoading(false);
    }
  };

  // ── NEW: Start realtime tracking ─────────────────────────────
  const startBusTracking = (routeId, loadedStops) => {
    // Clean up any existing subscription first (handles refresh case)
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    const unsub = subscribeBusLocation(
      routeId,
      loadedStops,

      // ✅ Bus is active — update index and data
      (index, liveData) => {
        setCurrentStopIndex(index);   // → LiveBarTrack animates bus icon automatically
        setBusData(liveData);
        setBusStatus("active");
      },

      // 🚫 No active driver on this route
      () => {
        setCurrentStopIndex(0);       // bus stays at start
        setBusStatus("inactive");
      },

      // ❌ Error
      (msg) => {
        console.error("[LiveTrack] Tracking error:", msg);
        setBusStatus("inactive");
      }
    );

    unsubscribeRef.current = unsub;
  };

  // ── On mount: fetch stops (subscription starts inside fetchStops) ─
  useEffect(() => {
    fetchStops();

    // ── Cleanup on unmount ──────────────────────────────────────
    // This stops the Firestore listener when user goes back
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
        console.log("[LiveTrack] Unsubscribed from bus location ✅");
      }
    };
  }, [bus]);

  // ── Refresh: re-fetch stops + restart subscription ───────────
  const handleRefresh = () => {
    fetchStops();
  };

  // ── Format updatedAt timestamp → "X seconds ago" ─────────────
  const getUpdatedText = () => {
    if (!busData?.updatedAt) return "Updated few seconds ago";
    try {
      const updatedDate = busData.updatedAt.toDate
        ? busData.updatedAt.toDate()
        : new Date(busData.updatedAt);
      const seconds = Math.floor((Date.now() - updatedDate.getTime()) / 1000);
      if (seconds < 10)  return "Updated just now";
      if (seconds < 60)  return `Updated ${seconds}s ago`;
      if (seconds < 120) return "Updated 1 min ago";
      return `Updated ${Math.floor(seconds / 60)} mins ago`;
    } catch {
      return "Updated few seconds ago";
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* HEADER — UNCHANGED */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Track Bus</Text>
      </View>

      {/* LIVE BAR TRACK — UNCHANGED */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#6e42a6" />
        </View>
      ) : (
        <LiveBarTrack
          stops={stops}
          currentStopIndex={currentStopIndex}   // ← now driven by live data
          onRefresh={handleRefresh}
          bus={bus}
          updatedText={getUpdatedText()}         // ← pass formatted time to LiveBarTrack
          busStatus={busStatus}                  // ← "active" | "inactive" | "loading"
          busData={busData}                      // ← full bus data if needed
        />
      )}
    </SafeAreaView>
  );
}

// ── Styles — UNCHANGED ────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
  },
});