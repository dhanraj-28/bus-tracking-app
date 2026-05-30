// Components/Driver/DriverDashboard.jsx

import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Alert,
} from "react-native";
import { Image } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  handleFetchBusInfo,
  handleStartGps,
  handleStopGps,
  handleUpdateLocation,
  handleGetSessionCount,
} from "../../src/controllers/driDashboardController";

const DriverDashboard = ({ route, navigation }) => {
  const driverUniqueId = route?.params?.driverUniqueId;
  const driverName = route?.params?.driver?.name || "Driver";

  const [isOnline, setIsOnline] = useState(false);
  const [gpsActive, setGpsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [sessions, setSessions] = useState(0);
  const [busInfo, setBusInfo] = useState(null);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [currentStopName, setCurrentStopName] = useState(null);
  const [nextStopName, setNextStopName] = useState(null);

  const locationInterval = useRef(null);
  const timerInterval = useRef(null);

  // 1. NETWORK STATUS
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected && state.isInternetReachable);
    });
    return () => unsubscribe();
  }, []);

  // 2. FETCH BUS INFO from drivers → buses → Routes
  useEffect(() => {
    if (!driverUniqueId) return;
    const loadBusInfo = async () => {
      const result = await handleFetchBusInfo(driverUniqueId);
      if (result.success) {
        setBusInfo(result.busInfo);
        console.log("Bus info loaded:", JSON.stringify(result.busInfo));
        if (result.busInfo.stopsSequence?.length > 0) {
          setCurrentStopName(result.busInfo.stopsSequence[0]?.name);
          setNextStopName(result.busInfo.stopsSequence[1]?.name);
        }
      } else {
        Alert.alert("Bus Info", result.error);
      }
    };
    loadBusInfo();
  }, [driverUniqueId]);

  // 3. SESSION COUNT
  useEffect(() => {
    if (!driverUniqueId) return;
    const loadSessions = async () => {
      const result = await handleGetSessionCount(driverUniqueId);
      if (result.success) setSessions(result.count);
    };
    loadSessions();
  }, [driverUniqueId]);

  // 4. TIMER
  useEffect(() => {
    if (gpsActive) {
      timerInterval.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerInterval.current);
    }
    return () => clearInterval(timerInterval.current);
  }, [gpsActive]);

  // 5. GPS TOGGLE
  const toggleGps = async () => {
    if (!gpsActive) {
      const result = await handleStartGps(driverUniqueId, busInfo?.busDocId);
      if (result.success) {
        setGpsActive(true);
        setSeconds(0);
        setCurrentStopIndex(0);

        // First location update immediately
        const locResult = await handleUpdateLocation(
          busInfo?.busDocId,
          driverUniqueId,
          busInfo?.routeId,
          busInfo?.stopsSequence,
          0
        );
        if (locResult.success) {
          setCurrentStopName(busInfo?.stopsSequence?.[0]?.name);
          setNextStopName(busInfo?.stopsSequence?.[1]?.name);
        }

        // Update every 10 seconds, advance stop index
        locationInterval.current = setInterval(async () => {
          setCurrentStopIndex((prevIndex) => {
            const newIndex =
              prevIndex + 1 < (busInfo?.stopsSequence?.length || 0)
                ? prevIndex + 1
                : prevIndex;

            handleUpdateLocation(
              busInfo?.busDocId,
              driverUniqueId,
              busInfo?.routeId,
              busInfo?.stopsSequence,
              newIndex
            ).then((res) => {
              if (res.success) {
                setCurrentStopName(busInfo?.stopsSequence?.[newIndex]?.name);
                setNextStopName(busInfo?.stopsSequence?.[newIndex + 1]?.name);
              }
            });

            return newIndex;
          });
        }, 10000);
      } else {
        Alert.alert("GPS Error", result.error);
      }
    } else {
      clearInterval(locationInterval.current);
      const result = await handleStopGps(driverUniqueId, seconds);
      if (result.success) {
        setGpsActive(false);
        setSessions((prev) => prev + 1);
      } else {
        Alert.alert("GPS Error", result.error);
      }
    }
  };

  const formatTime = () => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* HEADER */}
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

        {/* Current & Next Stop — only shown when GPS active */}
        {gpsActive && (
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Current Stop</Text>
              <Text style={styles.value}>{currentStopName || "-"}</Text>
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

      {/* VIEW POINTS BUTTON */}
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
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 25 },
  header: { flexDirection: "row", alignItems: "center", marginTop: 50, right: 10, marginBottom: 15 },
  title: { fontSize: 25, fontWeight: "800", color: "#3F3CC9" },
  onlineWrapper: { marginLeft: "auto", marginTop: "auto", alignItems: "center" },
  dot: { width: 20, height: 20, borderRadius: 10, marginBottom: 2 },
  onlineText: { fontSize: 12, fontWeight: "700" },
  welcome: { marginTop: 12, fontSize: 19, color: "#444" },
  card: {
    backgroundColor: "#fff", borderRadius: 20, padding: 10,
    marginTop: 10, elevation: 8, shadowColor: "#000",
    shadowOpacity: 0.15, shadowOffset: { width: 0, height: 4 },
  },
  cardTitle: { fontSize: 19, bottom: 7, fontWeight: "700" },
  row: { marginTop: 26, flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 18, color: "#777", fontWeight: "600" },
  value: { fontSize: 14, fontWeight: "700", marginTop: 4 },
  gpsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  statusBadge: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  statusText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  note: { fontSize: 16, color: "#E74C3C", marginTop: 20, lineHeight: 16 },
  pointsBtn: {
    marginTop: 210, height: 50, borderRadius: 25,
    backgroundColor: "#6C63FF", justifyContent: "center",
    alignItems: "center", elevation: 6,
  },
  pointsText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});