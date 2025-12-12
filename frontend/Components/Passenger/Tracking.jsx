import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  BackHandler,
  Animated,
  Dimensions,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";

// Screen height
const { height } = Dimensions.get("window");

// Mock API: replace with your real bus API
const fetchBusLocation = async () => {
  // Random movement for demo
  return {
    latitude: 13.0827 + Math.random() * 0.002,
    longitude: 80.2707 - Math.random() * 0.002,
  };
};

// Haversine distance
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function LiveMapPage({ navigation }) {
  const [busLocation, setBusLocation] = useState({ latitude: 13.0827, longitude: 80.2707 });
  const [expanded, setExpanded] = useState(false);

  const animation = useRef(new Animated.Value(0)).current; // 0 = collapsed, 1 = expanded

  const startLocation = { latitude: 13.0827, longitude: 80.2707 };
  const stopLocation = { latitude: 13.075, longitude: 80.240 };
  const destination = { latitude: 13.071, longitude: 80.217 };

  // Calculate distance & ETA
  const distance = getDistance(
    busLocation.latitude,
    busLocation.longitude,
    destination.latitude,
    destination.longitude
  );
  const etaMinutes = Math.round((distance / 30) * 60);

  // Fetch bus location every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const location = await fetchBusLocation();
      setBusLocation(location);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      if (expanded) {
        toggleExpand(false);
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [expanded]);

  const toggleExpand = (value) => {
    setExpanded(value);
    Animated.timing(animation, {
      toValue: value ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const mapHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [height * 0.6, height], // collapsed -> expanded
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      {!expanded && (
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 40, marginBottom: 10, paddingHorizontal: 16 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={{ fontSize: 26, fontWeight: "bold", marginLeft: 12 }}>Live Map</Text>
        </View>
      )}

      {/* Bus Info Card */}
      {!expanded && (
        <View style={{ marginHorizontal: 16, borderWidth: 1, borderRadius: 10, padding: 16, marginBottom: 10 }}>
          <Text style={{ fontSize: 28, fontWeight: "bold" }}>5 E</Text>
          <Text style={{ color: "#555", marginTop: 4 }}>To Koyambedu bus stand</Text>
          <Text style={{ marginTop: 8, fontWeight: "bold" }}>Distance: {distance.toFixed(2)} km</Text>
          <Text style={{ fontWeight: "bold" }}>ETA: {etaMinutes} min</Text>
        </View>
      )}

      {/* Map */}
      <Animated.View
        style={{
          height: mapHeight,
          borderRadius: expanded ? 0 : 10,
          overflow: "hidden",
          marginHorizontal: expanded ? 0 : 16,
          marginVertical: expanded ? 0 : 56,
        }}
      >
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: 13.08,
            longitude: 80.24,
            latitudeDelta: 0.07,
            longitudeDelta: 0.07,
          }}
          provider="google"
        >
          {/* Route Line */}
          <Polyline
            coordinates={[startLocation, stopLocation, destination]}
            strokeColor="#1E90FF"
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />

          {/* Markers */}
          <Marker coordinate={startLocation}>
            <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/25/25694.png" }} style={{ width: 24, height: 24 }} />
          </Marker>
          <Marker coordinate={busLocation}>
            <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/61/61212.png" }} style={{ width: 40, height: 40 }} />
          </Marker>
          <Marker coordinate={stopLocation}>
            <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/684/684908.png" }} style={{ width: 24, height: 24 }} />
          </Marker>
          <Marker coordinate={destination}>
            <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/25/25694.png" }} style={{ width: 24, height: 24 }} />
          </Marker>
        </MapView>

        {/* Expand / Collapse Button */}
        <TouchableOpacity
          onPress={() => toggleExpand(!expanded)}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            backgroundColor: "rgba(255,255,255,0.9)",
            padding: 10,
            borderRadius: 30,
            elevation: 5,
          }}
        >
          <Ionicons name={expanded ? "arrow-down" : "arrow-up"} size={24} color="#000" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
