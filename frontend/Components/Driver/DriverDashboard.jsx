// Components/Driver/DriverDashboard.jsx

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Alert, AppState,
} from "react-native";
import { Image } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import NetInfo from "@react-native-community/netinfo";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as Location from "expo-location";
import {
  handleFetchBusInfo,
  handleCheckExistingSession,
  handleCheckLocationServices,
  handleStartGps,
  handleStopGps,
  handleUpdateLocation,
  handleGetSessionCount,
} from "../../src/controllers/driDashboardController";

// ─────────────────────────────────────────
// GLOBAL STATE — survives navigation, never resets
// ─────────────────────────────────────────
let globalSeconds          = 0;
let globalGpsActive        = false;
let globalTimerInterval    = null;
let globalLocationInterval = null;
let globalBackgroundTime   = null;
let globalPhoneGpsWatcher  = null;
let globalCurrentStop      = null;
let globalNextStop         = null;
let globalDistance         = null;
let globalBusInfo          = null;   // cached so re-mount doesn't overwrite
let globalScannedBusData   = null;   // QR data cached so re-focus doesn't lose it

const DriverDashboard = ({ route, navigation }) => {
  const driverUniqueId = route?.params?.driverUniqueId;
  const driverName     = route?.params?.driver?.name || "Driver";

  // Save QR data to global the first time we receive it
  if (route?.params?.busData && !globalScannedBusData) {
    globalScannedBusData = route.params.busData;
  }

  const [isOnline,        setIsOnline]        = useState(false);
  const [gpsActive,       setGpsActive]       = useState(globalGpsActive);
  const [seconds,         setSeconds]         = useState(globalSeconds);
  const [sessions,        setSessions]        = useState(0);
  const [busInfo,         setBusInfo]         = useState(globalBusInfo);
  const [currentStopName, setCurrentStopName] = useState(globalCurrentStop);
  const [nextStopName,    setNextStopName]    = useState(globalNextStop);
  const [distanceToStop,  setDistanceToStop]  = useState(globalDistance);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [initialized,     setInitialized]     = useState(false);

  const appState      = useRef(AppState.currentState);
  const isStoppingGps = useRef(false);
  const isStartingGps = useRef(false);
  const busInfoRef    = useRef(globalBusInfo);
  const driverIdRef   = useRef(null);

  useEffect(() => { driverIdRef.current = driverUniqueId; }, [driverUniqueId]);

  const updateStops = (currentStop, nextStop, distance) => {
    globalCurrentStop = currentStop?.name ?? null;
    globalNextStop    = nextStop?.name    ?? null;
    globalDistance    = distance          ?? null;
    setCurrentStopName(globalCurrentStop);
    setNextStopName(globalNextStop);
    setDistanceToStop(globalDistance);
  };

  const updateBusInfo = (info) => {
    globalBusInfo      = info;
    busInfoRef.current = info;
    setBusInfo(info);
  };

  // ─────────────────────────────────────────
  // START GPS
  // ─────────────────────────────────────────
  const startGpsSession = async () => {
    if (globalGpsActive || isStartingGps.current || isStoppingGps.current) return;

    const info = busInfoRef.current;
    const uid  = driverIdRef.current;
    if (!info || !uid) {
      console.warn("startGpsSession: busInfo or driverUniqueId not ready yet");
      return;
    }

    isStartingGps.current = true;

    const result = await handleStartGps(uid, info.busDocId, globalSeconds);
    if (!result.success) {
      isStartingGps.current = false;
      Alert.alert("GPS Error", result.error);
      return;
    }

    globalGpsActive = true;
    setGpsActive(true);

    if (globalTimerInterval) clearInterval(globalTimerInterval);
    globalTimerInterval = setInterval(() => {
      globalSeconds += 1;
      setSeconds((prev) => prev + 1);
    }, 1000);

    // Immediate first location ping
    const locResult = await handleUpdateLocation(
      info.busDocId, uid, info.routeId, info.stopsSequence
    );
    if (locResult.success) {
      updateStops(locResult.currentStop, locResult.nextStop, locResult.distanceMeters);
    }

    // Location every 10 seconds
    if (globalLocationInterval) clearInterval(globalLocationInterval);
    globalLocationInterval = setInterval(async () => {
      if (!globalGpsActive || isStoppingGps.current) return;
      const res = await handleUpdateLocation(
        info.busDocId, uid, info.routeId, info.stopsSequence
      );
      if (res.success) {
        updateStops(res.currentStop, res.nextStop, res.distanceMeters);
      }
    }, 10000);

    isStartingGps.current = false;
  };

  // ─────────────────────────────────────────
  // STOP GPS
  // ─────────────────────────────────────────
  const stopGpsSession = async (showAlert = false) => {
    if (!globalGpsActive || isStoppingGps.current) return;
    isStoppingGps.current = true;

    clearInterval(globalTimerInterval);
    clearInterval(globalLocationInterval);
    globalTimerInterval    = null;
    globalLocationInterval = null;
    globalGpsActive = false;
    setGpsActive(false);
    updateStops(null, null, null);

    const uid = driverIdRef.current;
    if (uid) {
      const result = await handleStopGps(uid, globalSeconds);
      if (result.success) setSessions((prev) => prev + 1);
    }

    if (showAlert) {
      Alert.alert("GPS Turned Off", "Location was disabled. GPS tracking stopped automatically.");
    }

    isStoppingGps.current = false;
  };

  // ─────────────────────────────────────────
  // 1. PHONE GPS WATCHER — every 3 seconds
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!driverUniqueId) return;

    globalPhoneGpsWatcher = setInterval(async () => {
      try {
        const enabled = await Location.hasServicesEnabledAsync();
        setLocationEnabled(enabled);
        if (!enabled && globalGpsActive)                                       await stopGpsSession(true);
        if (enabled && !globalGpsActive && !isStartingGps.current && busInfoRef.current) await startGpsSession();
      } catch (err) {
        console.log("GPS watcher error:", err);
      }
    }, 3000);

    return () => { clearInterval(globalPhoneGpsWatcher); globalPhoneGpsWatcher = null; };
  }, [driverUniqueId]);

  // ─────────────────────────────────────────
  // 2. NETWORK STATUS
  // ─────────────────────────────────────────
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected && state.isInternetReachable);
    });
    return () => unsub();
  }, []);

  // ─────────────────────────────────────────
  // 3. APP STATE — background elapsed time
  // ─────────────────────────────────────────
  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextAppState) => {
      if (appState.current === "active" && nextAppState.match(/inactive|background/)) {
        if (globalGpsActive) globalBackgroundTime = Date.now();
      }
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        if (globalGpsActive && globalBackgroundTime) {
          globalSeconds += Math.floor((Date.now() - globalBackgroundTime) / 1000);
          setSeconds(globalSeconds);
          globalBackgroundTime = null;
        }
      }
      appState.current = nextAppState;
    });
    return () => sub.remove();
  }, []);

  // ─────────────────────────────────────────
  // 4. FETCH BUS INFO
  //    ✅ Passes qrRouteId so service loads ROUTE33 stops, not stale ROUTE101
  //    ✅ Skips re-fetch if already loaded (prevents overwrite on re-mount)
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!driverUniqueId) return;

    if (globalBusInfo) {
      busInfoRef.current = globalBusInfo;
      setBusInfo(globalBusInfo);
      return;
    }

    const loadBusInfo = async () => {
      const qr          = globalScannedBusData;
      const qrRouteId   = qr?.routeId || null; // e.g. "ROUTE33"

      const result = await handleFetchBusInfo(driverUniqueId, qrRouteId);
      if (result.success) {
        const finalInfo = {
          ...result.busInfo,
          // QR display values always win for what the driver sees
          busNumber: qr?.busName   || result.busInfo.busNumber,
          routeName: qr?.routeName || result.busInfo.routeName,
        };
        updateBusInfo(finalInfo);
        console.log("busInfo loaded:", finalInfo.busNumber, "|", finalInfo.routeName, "| stops:", finalInfo.stopsSequence.length);
      } else {
        Alert.alert("Bus Info", result.error);
      }
    };

    loadBusInfo();
  }, [driverUniqueId]);

  // ─────────────────────────────────────────
  // 5. SESSION COUNT
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!driverUniqueId) return;
    handleGetSessionCount(driverUniqueId).then((r) => {
      if (r.success) setSessions(r.count);
    });
  }, [driverUniqueId]);

  // ─────────────────────────────────────────
  // 6. INIT SESSION — restore timer from Firestore
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!driverUniqueId || initialized) return;
    const init = async () => {
      const result = await handleCheckExistingSession(driverUniqueId);
      if (result.success && result.session) {
        globalSeconds = result.session.elapsedSeconds;
        setSeconds(globalSeconds);
        if (result.session.isActive && !globalTimerInterval) {
          globalGpsActive = true;
          setGpsActive(true);
          globalTimerInterval = setInterval(() => {
            globalSeconds += 1;
            setSeconds((prev) => prev + 1);
          }, 1000);
        }
      }
      setInitialized(true);
    };
    init();
  }, [driverUniqueId]);

  // ─────────────────────────────────────────
  // 7. SYNC UI on every focus
  //    Restores all global state when coming back from View Points
  // ─────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      setSeconds(globalSeconds);
      setGpsActive(globalGpsActive);
      setCurrentStopName(globalCurrentStop);
      setNextStopName(globalNextStop);
      setDistanceToStop(globalDistance);
      if (globalBusInfo) {
        setBusInfo(globalBusInfo);
        busInfoRef.current = globalBusInfo;
      }
    }, [])
  );

  // ─────────────────────────────────────────
  // 8. MANUAL GPS TOGGLE
  // ─────────────────────────────────────────
  const toggleGps = async () => {
    if (!globalGpsActive) {
      const loc = await handleCheckLocationServices();
      if (!loc.enabled) {
        setLocationEnabled(false);
        Alert.alert("Location Required", "Please turn on Location/GPS in your phone settings first.", [{ text: "OK" }]);
        return;
      }
      setLocationEnabled(true);
      await startGpsSession();
    } else {
      await stopGpsSession(false);
    }
  };

  const formatTime = () => {
    const hrs  = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("QRScanner")}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>DASHBOARD</Text>
        <View style={styles.onlineWrapper}>
          <View style={[styles.dot, { backgroundColor: isOnline ? "#2ECC71" : "#E74C3C" }]} />
          <Text style={[styles.onlineText, { color: isOnline ? "#2ECC71" : "#E74C3C" }]}>
            {isOnline ? "ONLINE" : "OFFLINE"}
          </Text>
        </View>
      </View>

      <Text style={styles.welcome}>Welcome, {driverName}</Text>

      {!locationEnabled && (
        <View style={styles.locationWarning}>
          <Text style={styles.locationWarningText}>⚠️ Location is OFF — GPS tracking stopped</Text>
        </View>
      )}

      {/* BUS INFO CARD */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          <Image
            source={require("../../assets/Untitled.png")}
            style={{ width: 20, height: 20, marginTop: 1 }}
            resizeMode="contain"
          /> Bus Information
        </Text>
        <View style={styles.row}>
          <View>
            <Text style={styles.label}>Bus Number</Text>
            <Text style={styles.value}>{busInfo?.busNumber || "Loading..."}</Text>
          </View>
          <View>
            <Text style={styles.label}>Route</Text>
            <Text style={styles.value}>{busInfo?.routeName || "Loading..."}</Text>
          </View>
        </View>

        {gpsActive && (
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Current Stop</Text>
              <Text style={styles.value}>{currentStopName || "Detecting..."}</Text>
              {distanceToStop !== null && (
                <Text style={styles.distance}>{distanceToStop}m away</Text>
              )}
            </View>
            <View>
              <Text style={styles.label}>Next Stop</Text>
              <Text style={styles.value}>{nextStopName || "Last Stop"}</Text>
            </View>
          </View>
        )}
      </View>

      {/* GPS CARD */}
      <View style={styles.card}>
        <View style={styles.gpsHeader}>
          <Text style={styles.cardTitle}>📍 GPS Tracking</Text>
          <TouchableOpacity
            style={[styles.statusBadge, { backgroundColor: gpsActive ? "#6C63FF" : "#B0B0B0" }]}
            onPress={toggleGps}
          >
            <Text style={styles.statusText}>{gpsActive ? "ACTIVE" : "INACTIVE"}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.note}>
          Note: Keep GPS active to earn points and to help passengers track your bus
        </Text>

        <View style={styles.row}>
          <View>
            <Text style={styles.label}>Timer</Text>
            <Text style={styles.value}>{formatTime()}</Text>
          </View>
          <View>
            <Text style={styles.label}>Sessions Today</Text>
            <Text style={styles.value}>{sessions}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.pointsBtn}
        onPress={() => navigation.navigate("Reward", { driverUniqueId })}
      >
        <Text style={styles.pointsText}>VIEW POINTS</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
};

export default DriverDashboard;

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: "#fff", paddingHorizontal: 25 },
  header:              { flexDirection: "row", alignItems: "center", marginTop: 40, right: 10, marginBottom: 10 },
  title:               { fontSize: 25, fontWeight: "800", color: "#3F3CC9" },
  onlineWrapper:       { marginLeft: "auto", marginTop: "auto", alignItems: "center" },
  dot:                 { width: 20, height: 20, borderRadius: 10, marginBottom: 2 },
  onlineText:          { fontSize: 12, fontWeight: "700" },
  welcome:             { marginTop: 12, fontSize: 19, color: "#444" },
  locationWarning:     { backgroundColor: "#FFE5E5", borderRadius: 10, padding: 10, marginTop: 8, borderLeftWidth: 4, borderLeftColor: "#E74C3C" },
  locationWarningText: { color: "#E74C3C", fontSize: 13, fontWeight: "600" },
  card:                { backgroundColor: "#fff", borderRadius: 20, padding: 10, marginTop: 6, elevation: 8, shadowColor: "#000", shadowOpacity: 0.15, shadowOffset: { width: 0, height: 4 } },
  cardTitle:           { fontSize: 19, bottom: 7, fontWeight: "700" },
  row:                 { marginTop: 28, flexDirection: "row", justifyContent: "space-between" },
  label:               { fontSize: 18, color: "#777", fontWeight: "600" },
  value:               { fontSize: 14, fontWeight: "700", marginTop: 4 },
  distance:            { fontSize: 11, color: "#6C63FF", marginTop: 2, fontWeight: "600" },
  gpsHeader:           { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  statusBadge:         { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  statusText:          { color: "#fff", fontSize: 13, fontWeight: "700" },
  note:                { fontSize: 16, color: "#E74C3C", marginTop: 20, lineHeight: 16 },
  pointsBtn:           { marginTop: 100, height: 50, borderRadius: 25, backgroundColor: "#6C63FF", justifyContent: "center", alignItems: "center", elevation: 6 },
  pointsText:          { color: "#fff", fontSize: 15, fontWeight: "700" },
});