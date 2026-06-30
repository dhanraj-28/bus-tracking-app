import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Platform,
  Image,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  getCompleteRoute,
  getCurrentBusLocation,
  getStopCoordinates,
} from "../../src/controllers/trackController";
import { subscribeToBusLocationByRoute } from "../../src/services/trackBusService";

const { width, height } = Dimensions.get("window");
const GOOGLE_MAPS_APIKEY = "AIzaSyCO6EL6SNX-_2cqDJWN_5ZkqBCL9TZvyS4";

// ── PREDEFINED ROAD-FOLLOWING ROUTES (100% OFFLINE & RELIABLE) ──────────────
const PREDEFINED_ROAD_ROUTES = {
  "ROUTE99": [
    { latitude: 13.1118, longitude: 80.1558 }, // T.I. School
    { latitude: 13.1126, longitude: 80.1551 },
    { latitude: 13.1135, longitude: 80.1545 }, // Ambattur
    { latitude: 13.1143, longitude: 80.1548 }, // Ambattur O.T
    { latitude: 13.1155, longitude: 80.1535 },
    { latitude: 13.1168, longitude: 80.1520 },
    { latitude: 13.1182, longitude: 80.1508 }, // Raaki Theatre
    { latitude: 13.1194, longitude: 80.1514 },
    { latitude: 13.1203, longitude: 80.1521 },
    { latitude: 13.1215, longitude: 80.1528 }, // Oragadam O.T.
    { latitude: 13.1235, longitude: 80.1531 },
    { latitude: 13.1255, longitude: 80.1535 },
    { latitude: 13.1274, longitude: 80.1538 }, // Oragadam
    { latitude: 13.1287, longitude: 80.1552 },
    { latitude: 13.1299, longitude: 80.1571 },
    { latitude: 13.1310, longitude: 80.1591 }, // Pudur
    { latitude: 13.1313, longitude: 80.1612 },
    { latitude: 13.1316, longitude: 80.1635 },
    { latitude: 13.1319, longitude: 80.1653 }, // Wireless Company
  ],
  "ROUTE101": [
    { latitude: 12.9468, longitude: 78.8682 }, // Gudiyattam
    { latitude: 12.9442, longitude: 78.8805 },
    { latitude: 12.9411, longitude: 78.8914 }, // Polytechnic koot road
    { latitude: 12.9295, longitude: 78.9052 },
    { latitude: 12.9150, longitude: 78.9180 }, // moovendar nagar
    { latitude: 12.9102, longitude: 78.9285 },
    { latitude: 12.9038, longitude: 78.9377 }, // sethuvalai
    { latitude: 12.9015, longitude: 78.9555 },
    { latitude: 12.8980, longitude: 78.9818 }, // pallikonda
    { latitude: 12.8962, longitude: 79.0055 },
    { latitude: 12.8953, longitude: 79.0315 }, // Abdullapuram
    { latitude: 12.9005, longitude: 79.0605 },
    { latitude: 12.9135, longitude: 79.0911 }, // konavattam
    { latitude: 12.9252, longitude: 79.1105 },
    { latitude: 12.9329, longitude: 79.1278 }, // Viruthampet
    { latitude: 12.9234, longitude: 79.1320 }, // thottapalayam
    { latitude: 12.9196, longitude: 79.1332 }, // vellore new bus stand
  ],
  "ROUTE33": [
    { latitude: 11.084867, longitude: 79.647295 }, // Srinivasapuram
    { latitude: 11.087405, longitude: 79.648112 }, // Saravana Hospital
    { latitude: 11.089552, longitude: 79.648340 }, // EB (Electricity Board)
    { latitude: 11.091446, longitude: 79.647914 }, // Subramaniyapuram
    { latitude: 11.093218, longitude: 79.648647 }, // Kenikarri
    { latitude: 11.096350, longitude: 79.650820 }  // Mayiladuthurai Bus Stand
  ],
  "ROUTE31": [
    { latitude: 13.078100, longitude: 80.259500 }, // Egmore
    { latitude: 13.078500, longitude: 80.251500 }, // Nehru Park
    { latitude: 13.077500, longitude: 80.243100 }, // Kilpauk
    { latitude: 13.075970, longitude: 80.233440 }, // Pachaiyappa
    { latitude: 13.078000, longitude: 80.213500 }, // Anna Nagar
    { latitude: 13.085194, longitude: 80.199950 }, // Thirumangalam
    { latitude: 13.067450, longitude: 80.205660 }  // Koyambedu
  ],
  "ROUTE32": [
    { latitude: 13.078100, longitude: 80.259500 }, // Egmore
    { latitude: 13.078500, longitude: 80.251500 }, // Nehru Park
    { latitude: 13.077500, longitude: 80.243100 }, // Kilpauk
    { latitude: 13.075970, longitude: 80.233440 }, // Pachaiyappa
    { latitude: 13.078000, longitude: 80.213500 }, // Anna Nagar
    { latitude: 13.085194, longitude: 80.199950 }, // Thirumangalam
    { latitude: 13.067450, longitude: 80.205660 }  // Koyambedu
  ]
};

// ── LOCAL COORDINATE FALLBACKS ──────────────────────────────────────────────
const FALLBACK_STOP_COORDINATES = {
  "t.i.school": { latitude: 13.1118, longitude: 80.1558 },
  "t.i. school": { latitude: 13.1118, longitude: 80.1558 },
  "ambattur": { latitude: 13.1135, longitude: 80.1545 },
  "ambattur o.t": { latitude: 13.1143, longitude: 80.1548 },
  "ambattur o.t.": { latitude: 13.1143, longitude: 80.1548 },
  "raaki theatre": { latitude: 13.1182, longitude: 80.1508 },
  "rakki cinemas": { latitude: 13.1182, longitude: 80.1508 },
  "oragadam o.t.": { latitude: 13.1215, longitude: 80.1528 },
  "oragadam o.t": { latitude: 13.1215, longitude: 80.1528 },
  "oragadam": { latitude: 13.1274, longitude: 80.1538 },
  "pudur": { latitude: 13.1310, longitude: 80.1591 },
  "wireless company": { latitude: 13.1319, longitude: 80.1653 },

  "gudiyattam": { latitude: 12.9468, longitude: 78.8682 },
  "polytechnic koot road": { latitude: 12.9411, longitude: 78.8914 },
  "moovendar nagar": { latitude: 12.9150, longitude: 78.9180 },
  "sethuvalai": { latitude: 12.9038, longitude: 78.9377 },
  "pallikonda": { latitude: 12.8980, longitude: 78.9818 },
  "abdullapuram": { latitude: 12.8953, longitude: 79.0315 },
  "konavattam": { latitude: 12.9135, longitude: 79.0911 },
  "viruthampet": { latitude: 12.9329, longitude: 79.1278 },
  "thottapalayam": { latitude: 12.9234, longitude: 79.1320 },
  "vellore new busstand": { latitude: 12.9196, longitude: 79.1332 },
  "vellore new bus stand": { latitude: 12.9196, longitude: 79.1332 },

  "srinivasapuram": { latitude: 11.084867, longitude: 79.647295 },
  "saravana hospital": { latitude: 11.087405, longitude: 79.648112 },
  "eb (electricity board)": { latitude: 11.089552, longitude: 79.648340 },
  "subramaniyapuram": { latitude: 11.091446, longitude: 79.647914 },
  "kenikarri": { latitude: 11.093218, longitude: 79.648647 },
  "mayiladuthurai bus stand ": { latitude: 11.096350, longitude: 79.650820 },
  "mayiladuthurai bus stand": { latitude: 11.096350, longitude: 79.650820 },

  "egmore": { latitude: 13.078100, longitude: 80.259500 },
  "nehru park": { latitude: 13.078500, longitude: 80.251500 },
  "kilpauk": { latitude: 13.077500, longitude: 80.243100 },
  "pachaiyappa": { latitude: 13.075970, longitude: 80.233440 },
  "anna nagar": { latitude: 13.078000, longitude: 80.213500 },
  "thirumangalam": { latitude: 13.085194, longitude: 80.199950 },
  "koyambedu": { latitude: 13.067450, longitude: 80.205660 },
};

// ── GPS HELPERS ─────────────────────────────────────────────────────────────

function getDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
      Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function getBearing(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

function getNearestStop(busLocation, stops) {
  if (!busLocation || !stops || stops.length === 0) {
    return { nearestStop: null, nearestIndex: -1, nextStop: null, nextIndex: -1 };
  }

  let minDistance = Infinity;
  let nearestIndex = -1;

  stops.forEach((stop, index) => {
    if (stop.latitude !== null && stop.longitude !== null) {
      const dist = getDistance(
        busLocation.latitude,
        busLocation.longitude,
        stop.latitude,
        stop.longitude
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = index;
      }
    }
  });

  if (nearestIndex === -1) {
    return { nearestStop: null, nearestIndex: -1, nextStop: null, nextIndex: -1 };
  }

  const nearestStop = stops[nearestIndex];
  const nextIndex = nearestIndex < stops.length - 1 ? nearestIndex + 1 : -1;
  const nextStop = nextIndex !== -1 ? stops[nextIndex] : null;

  return { nearestStop, nearestIndex, nextStop, nextIndex, distanceToNearest: minDistance };
}

function calculateRemainingDistance(busLocation, stops) {
  if (!busLocation || !stops || stops.length === 0) return 0;

  const { nearestIndex, nextIndex } = getNearestStop(busLocation, stops);
  if (nearestIndex === -1) return 0;

  const targetIndex = nextIndex !== -1 ? nextIndex : nearestIndex;
  const targetStop = stops[targetIndex];
  
  let remaining = getDistance(
    busLocation.latitude,
    busLocation.longitude,
    targetStop.latitude,
    targetStop.longitude
  );

  for (let i = targetIndex; i < stops.length - 1; i++) {
    const current = stops[i];
    const next = stops[i + 1];
    remaining += getDistance(
      current.latitude,
      current.longitude,
      next.latitude,
      next.longitude
    );
  }

  return remaining; // in meters
}

// Decodes Google Maps Encoded Polyline
function decodePolyline(encoded) {
  const points = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push({ latitude: (lat / 1E5), longitude: (lng / 1E5) });
  }
  return points;
}

// Fetch street route from Google Maps Directions API
async function fetchGoogleRoute(points) {
  if (points.length < 2) return [];
  try {
    const origin = `${points[0].latitude},${points[0].longitude}`;
    const destination = `${points[points.length - 1].latitude},${points[points.length - 1].longitude}`;
    const waypoints = points.slice(1, -1)
      .map(p => `${p.latitude},${p.longitude}`)
      .join("|");

    let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_APIKEY}`;
    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    if (data.status === "OK" && data.routes && data.routes.length > 0) {
      return decodePolyline(data.routes[0].overview_polyline.points);
    } else {
      console.log("[LiveMap] Google Directions API status:", data.status);
    }
  } catch (err) {
    console.log("[LiveMap] Google Directions request failed (silent fallback):", err);
  }
  return [];
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function LiveMapPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const { bus } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [stops, setStops] = useState([]);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [busLocation, setBusLocation] = useState(null);
  const [busData, setBusData] = useState(null);
  const [busStatus, setBusStatus] = useState("loading");
  const [error, setError] = useState(null);

  const [bearing, setBearing] = useState(0);

  const [nearestStop, setNearestStop] = useState(null);
  const [nextStop, setNextStop] = useState(null);
  const [remainingDistance, setRemainingDistance] = useState(0);
  const [eta, setEta] = useState(0);

  const mapRef = useRef(null);
  const busMarkerRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const isInitialFitDone = useRef(false);
  const prevBusLocation = useRef(null);

  const routeId = bus?.routeId || bus?.id;

  useEffect(() => {
    if (!routeId) {
      setError("No route information provided.");
      setLoading(false);
      return;
    }

    const initializeData = async () => {
      try {
        setLoading(true);
        const [routeStops, allCoords, initialBusLoc] = await Promise.all([
          getCompleteRoute(routeId),
          getStopCoordinates(),
          getCurrentBusLocation(routeId),
        ]);

        const mappedStops = routeStops.map((stop) => {
          const nameKey = stop.name?.toLowerCase().trim();
          const dbCoords = allCoords[nameKey];
          const fallbackCoords = FALLBACK_STOP_COORDINATES[nameKey];
          return {
            ...stop,
            latitude: dbCoords?.latitude || fallbackCoords?.latitude || null,
            longitude: dbCoords?.longitude || fallbackCoords?.longitude || null,
          };
        });

        const validCoordsStops = mappedStops.filter(
          (s) => s.latitude !== null && s.longitude !== null
        );
        setStops(validCoordsStops);

        // Load route: check predefined offline first, then Google Maps Directions, then fallback
        if (PREDEFINED_ROAD_ROUTES[routeId]) {
          console.log(`[LiveMap] Using predefined road route for ${routeId}`);
          setRouteCoordinates(PREDEFINED_ROAD_ROUTES[routeId]);
        } else if (validCoordsStops.length >= 2) {
          console.log(`[LiveMap] Fetching Google Directions for ${routeId}`);
          const googleCoords = await fetchGoogleRoute(validCoordsStops);
          if (googleCoords.length > 0) {
            setRouteCoordinates(googleCoords);
          } else {
            setRouteCoordinates(validCoordsStops.map(s => ({ latitude: s.latitude, longitude: s.longitude })));
          }
        }

        if (initialBusLoc && initialBusLoc.location) {
          const loc = {
            latitude: initialBusLoc.location.latitude,
            longitude: initialBusLoc.location.longitude,
          };
          setBusLocation(loc);
          prevBusLocation.current = loc;
          setBusData(initialBusLoc);
          setBusStatus("active");

          performCalculations(loc, validCoordsStops, initialBusLoc.speed);
        } else {
          setBusStatus("inactive");
        }

        setLoading(false);
        startRealtimeTracking(validCoordsStops);

      } catch (err) {
        console.log("[LiveMap] Initialization error:", err);
        setError("Failed to load map data.");
        setLoading(false);
      }
    };

    initializeData();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [routeId]);

  useEffect(() => {
    if (stops.length > 0 && mapRef.current && !isInitialFitDone.current) {
      const coords = stops.map((s) => ({ latitude: s.latitude, longitude: s.longitude }));
      if (busLocation) {
        coords.push(busLocation);
      }

      setTimeout(() => {
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: { top: 80, right: 60, bottom: 220, left: 60 },
          animated: true,
        });
        isInitialFitDone.current = true;
      }, 500);
    }
  }, [stops, busLocation]);

  const performCalculations = (loc, routeStops, speedVal) => {
    const { nearestStop: near, nextStop: next } = getNearestStop(loc, routeStops);
    const remMeters = calculateRemainingDistance(loc, routeStops);
    const remKm = remMeters / 1000;

    setNearestStop(near);
    setNextStop(next);
    setRemainingDistance(remKm);

    const speedKmh = speedVal && speedVal > 3 ? speedVal : 25;
    const etaMinutes = Math.round((remKm / speedKmh) * 60);
    setEta(etaMinutes);
  };

  const startRealtimeTracking = (validStops) => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    unsubscribeRef.current = subscribeToBusLocationByRoute(
      routeId,
      (liveData) => {
        if (liveData.isActive && liveData.location) {
          const newLoc = {
            latitude: liveData.location.latitude,
            longitude: liveData.location.longitude,
          };

          if (prevBusLocation.current) {
            const angle = getBearing(
              prevBusLocation.current.latitude,
              prevBusLocation.current.longitude,
              newLoc.latitude,
              newLoc.longitude
            );
            if (angle !== 0 && Math.abs(angle - bearing) > 2) {
              setBearing(angle);
            }
          }

          setBusData(liveData);
          setBusStatus("active");
          prevBusLocation.current = newLoc;

          performCalculations(newLoc, validStops, liveData.speed);

          if (busMarkerRef.current) {
            if (Platform.OS === "android") {
              busMarkerRef.current.animateMarkerToCoordinate(newLoc, 1500);
            } else {
              setBusLocation(newLoc);
            }
          } else {
            setBusLocation(newLoc);
          }
        } else {
          setBusStatus("inactive");
        }
      },
      (errMsg) => {
        console.log("[LiveMap] Realtime error:", errMsg);
      }
    );
  };

  const handleCenterOnBus = () => {
    if (busLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...busLocation,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        1000
      );
    }
  };

  const getUpdatedTime = () => {
    if (!busData?.updatedAt) return "N/A";
    try {
      const date = busData.updatedAt.toDate
        ? busData.updatedAt.toDate()
        : new Date(busData.updatedAt);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Just now";
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loaderText}>Loading live map...</Text>
      </View>
    );
  }

  if (error || stops.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#ff4444" />
        <Text style={styles.errorText}>{error || "No route coordinates available."}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const startStop = stops[0];
  const endStop = stops[stops.length - 1];
  const intermediateStops = stops.slice(1, -1);

  const isBusMoving = busStatus === "active" && busData?.speed > 0;

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: busLocation?.latitude || startStop.latitude,
          longitude: busLocation?.longitude || startStop.longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
        showsCompass={false}
        showsMyLocationButton={false}
        pitchEnabled={true}
        rotateEnabled={true}
        zoomControlEnabled={false}
      >
        {/* Draw Route Polyline (Follows roads, predefined offline or Google Maps) */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#3b82f6"
            strokeWidth={6}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Start Point Marker (Green Map Pin with Icon) */}
        <Marker
          coordinate={{ latitude: startStop.latitude, longitude: startStop.longitude }}
          title={`Start: ${startStop.name}`}
          anchor={{ x: 0.5, y: 0.9 }}
        >
          <View style={styles.markerContainer}>
            <Ionicons name="location" size={36} color="#10B981" />
            <View style={styles.startBadge}>
              <Text style={styles.badgeText}>START</Text>
            </View>
          </View>
        </Marker>

        {/* End Point Marker (Red Map Pin with Icon) */}
        <Marker
          coordinate={{ latitude: endStop.latitude, longitude: endStop.longitude }}
          title={`Destination: ${endStop.name}`}
          anchor={{ x: 0.5, y: 0.9 }}
        >
          <View style={styles.markerContainer}>
            <Ionicons name="location" size={36} color="#EF4444" />
            <View style={styles.endBadge}>
              <Text style={styles.badgeText}>END</Text>
            </View>
          </View>
        </Marker>

        {/* Intermediate Stop Markers (Blue Circle with White Center and Tiny Bus Icon) */}
        {intermediateStops.map((stop, index) => (
          <Marker
            key={`stop-${index}`}
            coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
            title={stop.name}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.stopMarkerContainer}>
              <View style={styles.stopInnerCircle}>
                <Ionicons name="bus" size={10} color="#3b82f6" />
              </View>
            </View>
          </Marker>
        ))}

        {/* Live Bus Marker (Animated direction arrow + Bus Icon inside pulsing bubble) */}
        {busLocation && busStatus === "active" && (
          <Marker
            ref={busMarkerRef}
            coordinate={busLocation}
            title={bus?.busName || "Bus"}
            description={busData?.currentStopName ? `Near ${busData.currentStopName}` : ""}
            anchor={{ x: 0.5, y: 0.5 }}
            flat={true}
            rotation={bearing}
          >
            <View style={styles.busMarkerContainer}>
              <View
                style={[
                  styles.busPulseRing,
                  isBusMoving ? styles.busPulseRingMoving : styles.busPulseRingStopped,
                ]}
              />
              <View
                style={[
                  styles.busMarkerBubble,
                  isBusMoving ? styles.busMarkerMoving : styles.busMarkerStopped,
                ]}
              >
                <Ionicons name="bus" size={20} color="#fff" />
                {isBusMoving && (
                  <View style={styles.directionArrow}>
                    <Ionicons name="chevron-up" size={10} color="#fff" />
                  </View>
                )}
              </View>
            </View>
          </Marker>
        )}
      </MapView>

      {/* Floating Header & Top Info Card */}
      <View style={styles.topContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.circleButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Live Map</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <View style={styles.busBadge}>
              <Text style={styles.busBadgeText}>{bus?.busName || bus?.busNumber || "5A"}</Text>
            </View>
            <View style={styles.routeTextWrap}>
              <Text style={styles.routeNameText} numberOfLines={1}>
                {bus?.routeName || "Gudiyattam to Vellore"}
              </Text>
              <Text style={styles.routeDirectionText} numberOfLines={1}>
                {startStop.name} → {endStop.name}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.stopsStatusRow}>
            <View style={styles.stopCol}>
              <Text style={styles.stopLabel}>Nearest Stop</Text>
              <Text style={styles.stopValue} numberOfLines={1}>
                {nearestStop ? nearestStop.name : "Detecting..."}
              </Text>
            </View>
            <View style={styles.stopCol}>
              <Text style={styles.stopLabel}>Next Stop</Text>
              <Text style={styles.stopValue} numberOfLines={1}>
                {nextStop ? nextStop.name : "Terminus"}
              </Text>
            </View>
          </View>

          <View style={styles.updatedRow}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.updatedText}>Last updated: {getUpdatedTime()}</Text>
          </View>
        </View>
      </View>

      {/* Re-center Button */}
      {busLocation && busStatus === "active" && (
        <TouchableOpacity style={styles.centerButton} onPress={handleCenterOnBus}>
          <Ionicons name="locate" size={26} color="#3b82f6" />
        </TouchableOpacity>
      )}

      {/* Bottom Panel */}
      <View style={styles.bottomPanel}>
        <View style={styles.bottomPanelHeader}>
          <View>
            <Text style={styles.etaLabel}>Estimated Arrival</Text>
            <Text style={styles.etaValue}>
              {busStatus === "active" ? `${eta} mins` : "Inactive"}
            </Text>
          </View>
          {busStatus === "active" && (
            <View style={[styles.liveIndicator, isBusMoving ? styles.liveIndicatorMoving : styles.liveIndicatorStopped]}>
              <View style={[styles.liveDot, isBusMoving ? styles.liveDotMoving : styles.liveDotStopped]} />
              <Text style={[styles.liveIndicatorText, isBusMoving ? styles.liveTextMoving : styles.liveTextStopped]}>
                {isBusMoving ? "MOVING" : "STOPPED"}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="flag-outline" size={20} color="#3b82f6" />
            <Text style={styles.statLabel}>Remaining</Text>
            <Text style={styles.statValue}>
              {busStatus === "active" ? `${remainingDistance.toFixed(1)} km` : "—"}
            </Text>
          </View>

          <View style={styles.statBox}>
            <Ionicons name="speedometer-outline" size={20} color="#3b82f6" />
            <Text style={styles.statLabel}>Speed</Text>
            <Text style={styles.statValue}>
              {busStatus === "active" ? `${busData?.speed || 0} km/h` : "—"}
            </Text>
          </View>

          <View style={styles.statBox}>
            <Ionicons name="map-outline" size={20} color="#3b82f6" />
            <Text style={styles.statLabel}>Total Route</Text>
            <Text style={styles.statValue}>
              {bus?.distance ? `${bus.distance} km` : "—"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  map: {
    width: width,
    height: height,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "600",
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#ff4444",
    textAlign: "center",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  // Start/End Pin Markers
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  startBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    position: "absolute",
    top: -14,
    borderWidth: 1,
    borderColor: "#fff",
  },
  endBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    position: "absolute",
    top: -14,
    borderWidth: 1,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "900",
  },
  // Intermediate Bus Stop Markers
  stopMarkerContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  stopInnerCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  // Bus Marker
  busMarkerContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: 60,
  },
  busPulseRing: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
  },
  busPulseRingMoving: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderColor: "rgba(16, 185, 129, 0.4)",
  },
  busPulseRingStopped: {
    backgroundColor: "rgba(126, 87, 194, 0.15)",
    borderColor: "rgba(126, 87, 194, 0.3)",
  },
  busMarkerBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  busMarkerMoving: {
    backgroundColor: "#10B981",
  },
  busMarkerStopped: {
    backgroundColor: "#7e57c2",
  },
  directionArrow: {
    position: "absolute",
    top: -6,
    backgroundColor: "#10B981",
    borderRadius: 6,
    width: 12,
    height: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fff",
  },
  // Top Floating UI
  topContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    backgroundColor: "rgba(255,255,255,0.85)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: "hidden",
  },
  infoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 16,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  busBadge: {
    backgroundColor: "#e8f0fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#d2e3fc",
  },
  busBadgeText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a73e8",
  },
  routeTextWrap: {
    flex: 1,
  },
  routeNameText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  routeDirectionText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },
  stopsStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stopCol: {
    flex: 0.48,
  },
  stopLabel: {
    fontSize: 11,
    color: "#888",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  stopValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginTop: 4,
  },
  updatedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 4,
  },
  updatedText: {
    fontSize: 11,
    color: "#666",
  },
  centerButton: {
    position: "absolute",
    bottom: 230,
    right: 16,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 10,
  },
  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
  },
  bottomPanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  etaLabel: {
    fontSize: 13,
    color: "#777",
    fontWeight: "600",
  },
  etaValue: {
    fontSize: 26,
    fontWeight: "800",
    color: "#333",
    marginTop: 2,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  liveIndicatorMoving: {
    backgroundColor: "#d1fae5",
  },
  liveIndicatorStopped: {
    backgroundColor: "#f3e8ff",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveDotMoving: {
    backgroundColor: "#10b981",
  },
  liveDotStopped: {
    backgroundColor: "#7e57c2",
  },
  liveIndicatorText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  liveTextMoving: {
    color: "#047857",
  },
  liveTextStopped: {
    color: "#6b21a8",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statBox: {
    flex: 0.3,
    backgroundColor: "#f9f9fb",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1eff6",
  },
  statLabel: {
    fontSize: 11,
    color: "#888",
    marginTop: 6,
    textAlign: "center",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginTop: 4,
  },
});
