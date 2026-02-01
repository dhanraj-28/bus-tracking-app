import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
/* ---------------- DISTANCE FUNCTION ---------------- */
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function BusStopsNearMe() {
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [nearbyStops, setNearbyStops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);

      /* ---- MOCK BUS STOPS AROUND USER LOCATION ---- */
      const dynamicBusStops = [
        {
          id: "1",
          name: "kavaraipettai bus stand",
          latitude: loc.coords.latitude + 0.002,
          longitude: loc.coords.longitude + 0.001,
        },
        {
          id: "2",
          name: "thachchur bus stand",
          latitude: loc.coords.latitude - 0.002,
          longitude: loc.coords.longitude - 0.001,
        },
        {
          id: "3",
          name: "minjur bus stand",
          latitude: loc.coords.latitude + 0.0015,
          longitude: loc.coords.longitude - 0.002,
        },
        {
          id: "4",
          name: "ponneri bus stand",
          latitude: loc.coords.latitude - 0.001,
          longitude: loc.coords.longitude + 0.002,
        },
      ];

      const filteredStops = dynamicBusStops.filter((stop) => {
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

      {/* LIST */}
      <View style={styles.list}>
        <View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Ionicons name="arrow-back" size={24} color="#000" />
  </TouchableOpacity>

  <Text style={styles.heading}>Nearby Bus Stops</Text>
</View>

        <FlatList
          data={nearbyStops}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.stopName}>{item.name}</Text>
            </View>
          )}
        />
      </View>

      {/* MAP */}
      <View style={styles.mapContainer}>
        <MapView
          style={StyleSheet.absoluteFillObject}
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          {/* USER */}
          <Marker
            coordinate={location}
            title="You are here"
            pinColor="blue"
          />

          {/* BUS STOPS */}
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
  },
  list: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
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
  header: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 12,
},
heading: {
  fontSize: 20,
  fontWeight: "bold",
  marginLeft: 10, // space between icon & text
},

});
