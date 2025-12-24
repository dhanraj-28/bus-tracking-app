import React, { useState } from "react";

import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";


import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

// 🚌 Average city bus speed (simulation)
const BUS_SPEED_KMPH = 22;

export default function Route() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromCoords, setFromCoords] = useState(null);
  const [toCoords, setToCoords] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);

  // 🌍 OpenStreetMap Geocoding
  const geocode = async (place) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          place
        )}`,
        {
          headers: {
            "User-Agent": "BusRouteSimulation/1.0 (student-project)",
          },
        }
      );

      const text = await res.text();
      if (!text.startsWith("[")) throw new Error("Invalid response");

      const data = JSON.parse(text);
      if (data.length === 0) return null;

      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    } catch (err) {
      Alert.alert("Error", "Location service blocked. Try again.");
      return null;
    }
  };

  // 🛣️ OSRM Routing (FREE & OPEN)
  const fetchRoute = async (start, end) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;

      const res = await fetch(url);
      const data = await res.json();

      const coords = data.routes[0].geometry.coordinates.map(
        ([lng, lat]) => ({
          latitude: lat,
          longitude: lng,
        })
      );

      const distanceKm = data.routes[0].distance / 1000;
      const busTimeMins = (distanceKm / BUS_SPEED_KMPH) * 60;

      setRouteCoords(coords);
      setDistance(distanceKm.toFixed(1) + " km");
      setDuration(Math.round(busTimeMins) + " mins (Estimated)");
      setLoading(false);
    } catch (err) {
      setLoading(false);
      Alert.alert("Error", "Route not available");
    }
  };

  const searchRoute = async () => {
    if (!from || !to) {
      Alert.alert("Error", "Enter both From and To locations");
      return;
    }

    setLoading(true);
    setRouteCoords([]);
    setDistance("");
    setDuration("");

    const fCoords = await geocode(from);
    const tCoords = await geocode(to);

    if (!fCoords || !tCoords) {
      setLoading(false);
      return;
    }

    setFromCoords(fCoords);
    setToCoords(tCoords);
    fetchRoute(fCoords, tCoords);
  };

  return (

    <View style={styles.container}>
      <View style={styles.card}>
  <View style={styles.header}>
    <Pressable onPress={() => navigation.goBack()}>
      <Ionicons name="arrow-back" size={28} color="#000" />
    </Pressable>

    <Text style={styles.title}>  Bus Route Simulation</Text>
  </View>
        <TextInput
          placeholder="From (e.g. Chennai Central)"
          value={from}
          onChangeText={setFrom}
          style={styles.input}
        />

        <TextInput
          placeholder="To (e.g. Marina Beach Chennai)"
          value={to}
          onChangeText={setTo}
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={searchRoute}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Find Bus Route</Text>
          )}
        </TouchableOpacity>

        {distance && (
          <View style={styles.infoBox}>
            <Text>📏 Distance: {distance}</Text>
            <Text>🚌 Estimated Bus Time: {duration}</Text>
          </View>
        )}
      </View>

      <MapView
        style={styles.map}
        region={
          fromCoords
            ? {
                latitude: fromCoords.latitude,
                longitude: fromCoords.longitude,
                latitudeDelta: 0.15,
                longitudeDelta: 0.15,
              }
            : {
                latitude: 13.0827,
                longitude: 80.2707,
                latitudeDelta: 0.15,
                longitudeDelta: 0.15,
              }
        }
      >
        {fromCoords && <Marker coordinate={fromCoords} title="From" />}
        {toCoords && <Marker coordinate={toCoords} title="To" />}

        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={5}
            strokeColor="#2196F3"
          />
        )}
      </MapView>

      <Text style={styles.disclaimer}>
        This is a simulated bus route using open-source maps. Times are estimates.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  card: { padding: 16, backgroundColor: "#fff", elevation: 4 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 11, bottom:0.1
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fafafa",
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  header: {
  flexDirection: "row",     // 👈 makes arrow & text side by side
  alignItems: "center",
  marginBottom: 11,
},

  buttonText: { color: "#fff", fontWeight: "bold" },
  infoBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#e3f2fd",
    borderRadius: 6,
  },
  map: { flex: 1 },
  disclaimer: {
    fontSize: 11,
    color: "#777",
    textAlign: "center",
    padding: 6,
  },
});
