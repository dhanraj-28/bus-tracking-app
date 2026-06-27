import React, { useEffect, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ScrollView,
} from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLiveBusTracking } from "../../src/hooks/useLiveBusTracking";
import AnimatedBusMarker from "./AnimatedBusMarker";
import RouteMapLayer from "./RouteMapLayer";

export default function LiveMapPage({ navigation, route: navRoute }) {
  const bus = navRoute?.params?.bus || {};
  const routeId = bus.routeId || bus.id;
  const busNumber = bus.busNumber || bus.busName || bus.number;

  const {
    loading,
    route,
    stops,
    polyline,
    region,
    busLocation,
    currentIndex,
    currentStopName,
    nextStopName,
    distances,
    etaMinutes,
    timeToNext,
    nearbyStops,
    isMoving,
    updatedText,
    heading,
    busStatus,
    error,
  } = useLiveBusTracking(routeId, busNumber);

  const mapRef = useRef(null);
  const hasFitted = useRef(false);

  const busLat = busLocation?.latitude;
  const busLng = busLocation?.longitude;

  const fitMap = useCallback(() => {
    if (!mapRef.current || !polyline.length) return;
    const coords = [...polyline];
    if (busLat != null && busLng != null) {
      coords.push({ latitude: busLat, longitude: busLng });
    }
    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 80, right: 40, bottom: 160, left: 40 },
      animated: !hasFitted.current,
    });
    hasFitted.current = true;
  }, [polyline, busLat, busLng]);

  useEffect(() => {
    if (polyline.length && !loading) {
      const t = setTimeout(fitMap, 250);
      return () => clearTimeout(t);
    }
  }, [polyline, loading, fitMap]);

  const displayBusNumber = busNumber || route?.busName || "—";
  const totalKm = route?.distance ?? distances.totalKm;
  const remainingKm = distances.remainingKm ?? 0;
  const coveredKm = Math.max(0, (totalKm || 0) - remainingKm);

  const nearbyList = useMemo(
    () => (nearbyStops?.length ? nearbyStops : []).slice(0, 6),
    [nearbyStops]
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Compact header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Live Map</Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            Bus {displayBusNumber}
          </Text>
        </View>
        {busStatus === "active" ? (
          <View style={[styles.statusPill, isMoving ? styles.pillMove : styles.pillStop]}>
            <View style={[styles.pillDot, { backgroundColor: isMoving ? "#22C55E" : "#9CA3AF" }]} />
            <Text style={styles.pillText}>{isMoving ? "Moving" : "Stopped"}</Text>
          </View>
        ) : (
          <View style={[styles.statusPill, styles.pillOffline]}>
            <Text style={styles.pillText}>Offline</Text>
          </View>
        )}
      </View>

      {/* Map fills most of screen */}
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#6e42a6" />
            <Text style={styles.hint}>Loading route…</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Ionicons name="alert-circle-outline" size={36} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={region}
              showsUserLocation={false}
              showsMyLocationButton={false}
              loadingEnabled={false}
              moveOnMarkerPress={false}
              pitchEnabled={false}
              rotateEnabled={false}
            >
              <RouteMapLayer
                polyline={polyline}
                stops={stops}
                route={route}
                currentIndex={currentIndex}
              />
              <AnimatedBusMarker
                latitude={busLat}
                longitude={busLng}
                title={`Bus ${displayBusNumber}`}
                isMoving={isMoving}
                heading={heading}
              />
            </MapView>

            {/* Floating info card — overlays map, no layout shift */}
            <View style={styles.floatCard}>
              <View style={styles.floatRow}>
                <View style={styles.floatCol}>
                  <Text style={styles.floatLabel}>Current</Text>
                  <Text style={styles.floatValue} numberOfLines={1}>
                    {currentStopName || route?.startStop || "—"}
                  </Text>
                </View>
                <View style={styles.floatCol}>
                  <Text style={styles.floatLabel}>Next</Text>
                  <Text style={styles.floatValue} numberOfLines={1}>
                    {nextStopName || "—"}
                  </Text>
                </View>
                <View style={styles.floatCol}>
                  <Text style={styles.floatLabel}>Reach</Text>
                  <Text style={styles.floatValue}>
                    {timeToNext?.etaMinutes ? `${timeToNext.etaMinutes} min` : etaMinutes ? `${etaMinutes} min` : "—"}
                  </Text>
                </View>
              </View>
              <Text style={styles.floatUpdated}>{updatedText}</Text>
            </View>

            {/* Nearby stops strip */}
            {nearbyList.length > 0 && (
              <View style={styles.nearbyWrap}>
                <Text style={styles.nearbyTitle}>Upcoming stops</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.nearbyScroll}
                >
                  {nearbyList.map((stop, i) => (
                    <View
                      key={`${stop.name}-${i}`}
                      style={[
                        styles.nearbyChip,
                        stop.isCurrent && styles.chipCurrent,
                        i === 1 && styles.chipNext,
                      ]}
                    >
                      <Text style={styles.chipName} numberOfLines={1}>
                        {stop.name}
                      </Text>
                      <Text style={styles.chipMeta}>
                        {stop.distanceKm != null ? `${stop.distanceKm.toFixed(1)} km` : "—"}
                        {stop.etaMinutes ? ` • ${stop.etaMinutes} min` : ""}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {busStatus === "inactive" && (
              <View style={styles.offlineBanner}>
                <Ionicons name="wifi-outline" size={14} color="#fff" />
                <Text style={styles.offlineText}>Waiting for driver GPS…</Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Bottom stats — fixed height, no map resize */}
      <View style={styles.bottomBar}>
        <Stat label="Total" value={totalKm != null ? `${Number(totalKm).toFixed(1)} km` : "—"} />
        <Stat label="Covered" value={coveredKm > 0 ? `${coveredKm.toFixed(1)} km` : "0 km"} />
        <Stat label="Left" value={remainingKm > 0 ? `${remainingKm.toFixed(1)} km` : "—"} />
        <Stat label="ETA" value={etaMinutes > 0 ? `${etaMinutes} min` : "—"} highlight />
      </View>
    </SafeAreaView>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, highlight && styles.statHighlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0EEF7",
  },
  iconBtn: { padding: 6 },
  headerCenter: { flex: 1, marginHorizontal: 8 },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#1A1A1A" },
  headerSub: { fontSize: 12, color: "#888", marginTop: 1 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 5,
  },
  pillMove: { backgroundColor: "#DCFCE7" },
  pillStop: { backgroundColor: "#F3F4F6" },
  pillOffline: { backgroundColor: "#FEE2E2" },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 11, fontWeight: "700", color: "#374151" },
  mapContainer: { flex: 1, position: "relative" },
  map: { ...StyleSheet.absoluteFillObject },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  hint: { color: "#666", fontSize: 13 },
  errorText: { color: "#EF4444", fontSize: 13, paddingHorizontal: 24, textAlign: "center" },
  floatCard: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 12,
    padding: 12,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 4 },
    }),
  },
  floatRow: { flexDirection: "row" },
  floatCol: { flex: 1, minWidth: 0 },
  floatLabel: { fontSize: 10, color: "#999", fontWeight: "600" },
  floatValue: { fontSize: 12, fontWeight: "800", color: "#222", marginTop: 2 },
  floatUpdated: { fontSize: 10, color: "#888", marginTop: 6 },
  nearbyWrap: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
  },
  nearbyTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 12,
    marginBottom: 6,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 4,
  },
  nearbyScroll: { paddingHorizontal: 10, gap: 8 },
  nearbyChip: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 120,
    maxWidth: 160,
    marginRight: 8,
  },
  chipCurrent: { borderWidth: 2, borderColor: "#7E57C2" },
  chipNext: { borderWidth: 2, borderColor: "#F59E0B" },
  chipName: { fontSize: 12, fontWeight: "800", color: "#333" },
  chipMeta: { fontSize: 10, color: "#666", marginTop: 2 },
  offlineBanner: {
    position: "absolute",
    top: "45%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(30,30,30,0.88)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  offlineText: { color: "#fff", fontSize: 12 },
  bottomBar: {
    flexDirection: "row",
    backgroundColor: "#6e42a6",
    paddingVertical: 10,
    paddingHorizontal: 8,
    paddingBottom: Platform.OS === "ios" ? 6 : 10,
  },
  stat: { flex: 1, alignItems: "center" },
  statLabel: { fontSize: 10, color: "#D9CDEF", fontWeight: "600" },
  statValue: { fontSize: 13, fontWeight: "800", color: "#fff", marginTop: 2 },
  statHighlight: { color: "#FDE68A" },
});
