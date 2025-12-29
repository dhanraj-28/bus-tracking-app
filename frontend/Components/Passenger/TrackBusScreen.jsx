import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LiveBarTrack from "./LiveBarTrack";

const STOPS = [
  { name: "Ludhiana", time: "7:40 pm" },
  { name: "Sahnewal", time: "7:55 pm" },
  { name: "Samrala", time: "8:15 pm" },
  { name: "Chandigarh", time: "9:00 pm" },
  { name: "Mohali", time: "9:20 pm" },
  { name: "Chandigarh", time: "9:00 pm" },
  { name: "Mohali", time: "9:20 pm" },
  { name: "Chandigarh", time: "9:00 pm" },
  { name: "Mohali", time: "9:20 pm" },
];

export default function TrackBusScreen() {
  // 🔑 ONLY THIS VALUE CONTROLS BUS POSITION
  const [currentStopIndex, setCurrentStopIndex] = useState(3);

  const handleRefresh = () => {
    console.log("Refresh pressed");
    // later → backend update
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity >
        <Text style={styles.title}>Track Bus</Text>
      </View>

      {/* LIVE BAR TRACK */}
      <LiveBarTrack
        stops={STOPS}
        currentStopIndex={currentStopIndex}
        onRefresh={handleRefresh}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  back: {
    fontSize: 36,
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
  },
});
