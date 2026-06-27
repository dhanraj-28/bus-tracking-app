import React, { useEffect, useRef } from "react";
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
import { useLiveBusTracking } from "../../src/hooks/useLiveBusTracking";

export default function LiveTrack({ route }) {
  const navigation = useNavigation();
  const { bus } = route?.params || {};
  const routeId = bus?.id || bus?.routeId;
  const busNumber = bus?.busNumber || bus?.busName || bus?.number;

  const tracking = useLiveBusTracking(routeId, busNumber);
  const {
    loading,
    route: routeData,
    stops,
    currentIndex,
    currentStopName,
    nextStopName,
    busLocation,
    updatedText,
    busStatus,
    error,
    distances,
    etaMinutes,
    timeToNext,
    isMoving,
  } = tracking;

  const refreshRef = useRef(0);

  const handleRefresh = () => {
    refreshRef.current += 1;
    navigation.replace("LiveTrack", {
      bus: { ...bus, _refresh: refreshRef.current },
    });
  };

  const busData = busLocation
    ? {
        currentStopName,
        nextStopName,
        speed: busLocation.speed,
        updatedAt: busLocation.updatedAt,
        latitude: busLocation.latitude,
        longitude: busLocation.longitude,
      }
    : null;

  const enrichedBus = {
    ...bus,
    busNumber: busNumber || routeData?.busName,
    busName: busNumber || routeData?.busName,
    routeName: routeData?.routeName || bus.routeName,
    destination: routeData?.endStop || bus.destination || bus.to,
    startStop: routeData?.startStop || bus.from,
    endStop: routeData?.endStop || bus.to,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Track Bus</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6e42a6" />
        </View>
      ) : (
        <LiveBarTrack
          stops={stops}
          currentStopIndex={currentIndex}
          onRefresh={handleRefresh}
          bus={enrichedBus}
          updatedText={updatedText}
          busStatus={busStatus}
          busData={busData}
          etaMinutes={etaMinutes}
          remainingKm={distances?.remainingKm}
          timeToNext={timeToNext}
          isMoving={isMoving}
          currentStopName={currentStopName}
          nextStopName={nextStopName}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  back: { fontSize: 36, marginRight: 10 },
  title: { fontSize: 20, fontWeight: "800" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: {
    color: "#c00",
    textAlign: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontSize: 13,
  },
});
