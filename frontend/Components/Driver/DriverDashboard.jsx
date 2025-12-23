
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from "react-native";
import { Image } from "react-native";




const DriverDashboard = () => {
  // ===== STATES =====
  const [isOnline, setIsOnline] = useState(true);
  const [gpsActive, setGpsActive] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [sessions, setSessions] = useState(12);

  // ===== TIMER LOGIC =====
  useEffect(() => {
    let interval = null;

    if (gpsActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [gpsActive]);

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
        <Text style={styles.backArrow}>←</Text>
        <Text style={styles.title}>DASHBOARD</Text>

        <View style={styles.onlineWrapper}>
          <View
            style={[
              styles.dot,
              { backgroundColor: isOnline ? "#2ECC71" : "#E74C3C" },
            ]}
          />
          <Text
            style={[
              styles.onlineText,
              { color: isOnline ? "#2ECC71" : "#E74C3C" },
            ]}
          >
            {isOnline ? "ONLINE" : "OFFLINE"}
          </Text>
        </View>
      </View>

      <Text style={styles.welcome}>Welcome, Driver name</Text>

      {/* BUS INFO CARD */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}> <Image
  source={require("../../assets/Untitled.png")}
  style={{ width: 20, height: 20 ,marginTop:1}}
  resizeMode="contain"
/> Bus Information</Text>

        <View style={styles.row}>
          <View>
            <Text style={styles.label}>Bus Number</Text>
            <Text style={styles.value}>MH-12-AB-1234</Text>
          </View>

          <View>
            <Text style={styles.label}>Route</Text>
            <Text style={styles.value}>Airport-downtown</Text>
          </View>
        </View>
      </View>

      {/* GPS CARD */}
      <View style={styles.card}>
        <View style={styles.gpsHeader}>
          <Text style={styles.cardTitle}>📍 GPS Tracking</Text>

          
            <Text  style={[
                styles.statusText,
              styles.statusBadge,
              { backgroundColor: gpsActive ? "#6C63FF" : "#B0B0B0" },
            ]}>
              {gpsActive ? "ACTIVE" : "INACTIVE"}
            </Text>
          
        </View>

        <Text style={styles.note}>
          Note: Keep GPS active to earn points and to help passengers track your
          bus
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
      <TouchableOpacity style={styles.pointsBtn}>
        <Text style={styles.pointsText}>VIEW POINTS</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default DriverDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 25,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 50,
  },

  backArrow: {
    fontSize: 42,
    right:10,
    marginBottom:15
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    color: "#3F3CC9",
  },

  onlineWrapper: {
    marginLeft: "auto",
    marginTop:"auto",
    alignItems: "center",
    
  },

  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 2,
    
  },

  onlineText: {
    fontSize: 12,
    fontWeight: "700",
  },

  welcome: {
    marginTop: 12,
    fontSize: 19,
    color: "#444",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginTop: 18,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
  },

  cardTitle: {
    fontSize: 19,
    bottom:7,
    fontWeight: "700",
  },

  row: {
    marginTop: 26,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  label: {
    fontSize: 18,
    color: "#777",
    
    fontWeight: "600",
    
  },

  value: {
    fontSize: 14,
    fontWeight: "700",
    
    marginTop: 4,
  },

  gpsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  statusBadge: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },

  statusText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  note: {
    fontSize: 16,
    color: "#E74C3C",
    marginTop: 20,
    lineHeight: 16,
  },

  pointsBtn: {
    marginTop: 210,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#6C63FF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },

  pointsText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
