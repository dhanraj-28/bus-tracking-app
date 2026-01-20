import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

/* ---------------- BUS STOP DATA (STATIC JSON) ---------------- */
const BUS_STOPS = [
  {
    id: "1",
    name: "Gudiyatham Bus Stand",
    latitude: 12.9469,
    longitude: 78.8736,
  },
  {
    id: "2",
    name: "Gandhi Nagar Bus Stop",
    latitude: 12.9498,
    longitude: 78.8792,
  },
  {
    id: "3",
    name: "Mill Road Bus Stop",
    latitude: 12.9435,
    longitude: 78.8701,
  },
];

/* ---------------- DISTANCE CALCULATION ---------------- */
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lat2 - lat1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function BusStopsNearMe({ navigation }) {
  const [location, setLocation] = useState(null);
  const [nearbyStops, setNearbyStops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);

      const filteredStops = BUS_STOPS.filter((stop) => {
        const distance = getDistance(
          loc.coords.latitude,
          loc.coords.longitude,
          stop.latitude,
          stop.longitude
        );
        return distance <= 2;
      });

      setNearbyStops(filteredStops);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Finding nearby bus stops...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* 🚌 TOP HALF */}
      <View style={styles.list}>

        {/* HEADER WITH BACK ARROW */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} />
          </TouchableOpacity>
          <Text style={styles.heading}>Nearby Bus Stops</Text>
        </View>

        {nearbyStops.length === 0 ? (
          <Text>No bus stops found nearby</Text>
        ) : (
          <FlatList
            data={nearbyStops}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.stopName}>{item.name}</Text>
              </View>
            )}
          />
        )}
      </View>

      {/* 🗺 MAP */}
      <View style={styles.mapContainer}>
        <MapView
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          <Marker
            coordinate={location}
            title="You are here"
            pinColor="blue"
          />

          {nearbyStops.map((stop) => (
            <Marker
              key={stop.id}
              coordinate={{
                latitude: stop.latitude,
                longitude: stop.longitude,
              }}
              title={stop.name}
              pinColor="green"
            />
          ))}
        </MapView>
      </View>
    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  list: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 12,
  },

  card: {
    padding: 14,
    backgroundColor: "#F1F1F1",
    borderRadius: 12,
    marginBottom: 10,
  },

  stopName: {
    fontSize: 16,
  },

  mapContainer: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
