import React, { useState, useEffect } from "react";
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
import { getRouteStoppingsById } from "../../src/controllers/trackController";

export default function LiveTrack({ route }) {
  const navigation = useNavigation();
  const { bus } = route?.params || {};
  const [stops, setStops] = useState([]);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStops = async () => {
    console.log("[LiveTrack] Selected bus:", bus);
    if (!bus?.id && !bus?.routeId) {
      console.log("[LiveTrack] No bus ID found in params!");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await getRouteStoppingsById(bus.id || bus.routeId);
      console.log("[LiveTrack] Fetch result for route ID:", bus.id || bus.routeId, result);
      if (result) {
        setStops(result.stoppings || []);
        if (result.route && typeof result.route.currentStopIndex === "number") {
          setCurrentStopIndex(result.route.currentStopIndex);
        } else {
          setCurrentStopIndex(0);
        }
      }
    } catch (error) {
      console.error("Error fetching stops:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStops();
  }, [bus]);

  const handleRefresh = () => {
    fetchStops();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Track Bus</Text>
      </View>

      {/* LIVE BAR TRACK */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#6e42a6" />
        </View>
      ) : (
        <LiveBarTrack
          stops={stops}
          currentStopIndex={currentStopIndex}
          onRefresh={handleRefresh}
          bus={bus}
        />
      )}
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
