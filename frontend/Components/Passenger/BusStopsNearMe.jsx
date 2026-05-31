import React, { useEffect, useState, useRef } from "react";



import {

  View,

  Text,

  StyleSheet,

  FlatList,

  ActivityIndicator,

  TouchableOpacity,

  Linking,

  Platform,

  Alert,

} from "react-native";



import MapView, { Marker } from "react-native-maps";



import * as Location from "expo-location";



import { useNavigation } from "@react-navigation/native";



import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";



import { fetchNearbyBusStops } from "../../services/nearbyBusStops";



function coordsChanged(a, b) {

  if (!a || !b) return true;

  const dLat = Math.abs(a.latitude - b.latitude);

  const dLng = Math.abs(a.longitude - b.longitude);

  return dLat > 0.002 || dLng > 0.002;

}



export default function BusStopsNearMe() {

  const navigation = useNavigation();

  const fetchIdRef = useRef(0);



  const [location, setLocation] = useState(null);

  const [nearbyStops, setNearbyStops] = useState([]);

  const [loadingStops, setLoadingStops] = useState(true);

  const [error, setError] = useState(null);

  const [selectedStop, setSelectedStop] = useState(null);



  const openInGoogleMaps = async (stop = null) => {

    const target = stop || selectedStop;

    const lat = target?.latitude ?? location?.latitude;

    const lng = target?.longitude ?? location?.longitude;



    if (lat == null || lng == null) {

      Alert.alert("Location unavailable", "Could not open Google Maps.");

      return;

    }



    const label = encodeURIComponent(target?.name || "Bus stops near me");



    const urls = Platform.select({

      ios: [

        target

          ? `comgooglemaps://?daddr=${lat},${lng}&directionsmode=walking`

          : `comgooglemaps://?q=${label}&center=${lat},${lng}&zoom=15`,

        target

          ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`

          : `https://www.google.com/maps/search/bus+stops/@${lat},${lng},15z`,

      ],

      android: [

        target

          ? `google.navigation:q=${lat},${lng}`

          : `geo:${lat},${lng}?q=${lat},${lng}(${label})`,

        target

          ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`

          : `https://www.google.com/maps/search/bus+stops/@${lat},${lng},15z`,

      ],

      default: [

        target

          ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`

          : `https://www.google.com/maps/search/bus+stops/@${lat},${lng},15z`,

      ],

    });



    for (const url of urls) {

      try {

        await Linking.openURL(url);

        return;

      } catch {

        // try next URL

      }

    }



    Alert.alert(

      "Could not open Google Maps",

      "Install Google Maps or try again."

    );

  };



  const loadStopsForCoords = async (coords) => {

    const fetchId = ++fetchIdRef.current;

    const lat = coords.latitude;

    const lng = coords.longitude;



    const stops = await fetchNearbyBusStops(lat, lng, {

      onResults: (partialStops) => {

        if (fetchId !== fetchIdRef.current) return;

        setNearbyStops(partialStops);

        setLoadingStops(false);

        setError(null);

        setSelectedStop((prev) => prev || partialStops[0] || null);

      },

    });



    if (fetchId !== fetchIdRef.current) return stops;



    setNearbyStops(stops);

    setLoadingStops(false);

    if (stops.length > 0) {

      setSelectedStop((prev) => prev || stops[0]);

      setError(null);

    } else {

      setError("No bus stops found within 5 km.");

    }

    return stops;

  };



  const loadNearbyStops = async () => {

    setLoadingStops(true);

    setError(null);

    setNearbyStops([]);

    try {

      const { status } =

        await Location.requestForegroundPermissionsAsync();



      if (status !== "granted") {

        setError("Location permission is required to find nearby bus stops.");

        setLoadingStops(false);

        return;

      }



      const lastKnown =

        await Location.getLastKnownPositionAsync();



      if (lastKnown) {

        setLocation(lastKnown.coords);

        loadStopsForCoords(lastKnown.coords).catch((err) => {

          console.log(err);

          setError(err?.message || "Could not load bus stops. Tap Retry.");

          setLoadingStops(false);

        });

      }



      const current = await Location.getCurrentPositionAsync({

        accuracy: Location.Accuracy.Low,

        maximumAge: 120000,

      });



      setLocation(current.coords);



      if (

        !lastKnown ||

        coordsChanged(lastKnown.coords, current.coords)

      ) {

        await loadStopsForCoords(current.coords);

      }

    } catch (err) {

      console.log(err);

      setError(

        err?.message || "Could not load bus stops. Tap Retry to try again."

      );

      setNearbyStops([]);

      setLoadingStops(false);

    }

  };



  useEffect(() => {

    loadNearbyStops();

  }, []);



  if (!location && loadingStops) {

    return (

      <View style={styles.center}>

        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>

          Getting your location...

        </Text>

      </View>

    );

  }



  return (

    <View style={styles.container}>



      <View style={styles.list}>



        <View style={styles.header}>

          <TouchableOpacity

            onPress={() => navigation.navigate("Dashboard")}

          >

            <Ionicons name="arrow-back" size={24} color="black" />

          </TouchableOpacity>



          <Text style={styles.heading}>

            Nearby Bus Stops

          </Text>

        </View>

        {nearbyStops.length > 0 ? (
          <Text style={styles.stopCount}>
            {nearbyStops.length} bus stops within 5 km
          </Text>
        ) : null}

        {loadingStops && nearbyStops.length === 0 ? (

          <View style={styles.loadingRow}>

            <ActivityIndicator size="small" color="#5E60CE" />

            <Text style={styles.loadingText}>

              Finding bus stops near you...

            </Text>

          </View>

        ) : null}



        {loadingStops && nearbyStops.length > 0 ? (

          <Text style={styles.updatingText}>

            Updating results...

          </Text>

        ) : null}



        {error ? (

          <View style={styles.errorBox}>

            <Text style={styles.errorText}>{error}</Text>

            <TouchableOpacity

              style={styles.retryButton}

              onPress={loadNearbyStops}

            >

              <Text style={styles.retryText}>Retry</Text>

            </TouchableOpacity>

          </View>

        ) : null}



        <FlatList

          data={nearbyStops}

          keyExtractor={(item) => item.id}

          ListEmptyComponent={

            !loadingStops && !error ? (

              <Text>

                No nearby bus stops found within 5 km

              </Text>

            ) : null

          }

          renderItem={({ item }) => (

            <TouchableOpacity

              style={[

                styles.card,

                selectedStop?.id === item.id && styles.cardSelected,

              ]}

              onPress={() => setSelectedStop(item)}

            >

              <Text style={styles.stopName}>{item.name}</Text>

              <Text style={styles.stopDistance}>

                {item.distance} m away

              </Text>

            </TouchableOpacity>

          )}

        />



      </View>



      <View style={styles.mapContainer}>



        {location && (

          <>

            <TouchableOpacity

              style={styles.googleMapsButton}

              onPress={() => openInGoogleMaps()}

              activeOpacity={0.85}

            >

              <MaterialCommunityIcons

                name="google-maps"

                size={28}

                color="#4285F4"

              />

              <Text style={styles.googleMapsLabel}>

                Open in Google Maps

              </Text>

              {selectedStop ? (

                <Text style={styles.googleMapsSub} numberOfLines={1}>

                  → {selectedStop.name}

                </Text>

              ) : null}

            </TouchableOpacity>



            <MapView

              style={styles.map}

              region={{

                latitude: location.latitude,

                longitude: location.longitude,

                latitudeDelta: 0.06,

                longitudeDelta: 0.06,

              }}

            >

              <Marker

                coordinate={{

                  latitude: location.latitude,

                  longitude: location.longitude,

                }}

                title="You are here"

                pinColor="red"

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

                  onPress={() => setSelectedStop(stop)}

                />

              ))}

            </MapView>

          </>

        )}



      </View>



    </View>

  );

}



const styles = StyleSheet.create({

  container: {

    flex: 1,

  },



  list: {

    height: "42%",

    paddingTop: 50,

    paddingHorizontal: 16,

    backgroundColor: "#fff",

  },



  mapContainer: {

    height: "58%",

    backgroundColor: "#e8e8e8",

  },



  googleMapsButton: {

    flexDirection: "row",

    alignItems: "center",

    flexWrap: "wrap",

    backgroundColor: "#fff",

    paddingVertical: 12,

    paddingHorizontal: 16,

    borderBottomWidth: 1,

    borderBottomColor: "#e0e0e0",

    shadowColor: "#000",

    shadowOffset: { width: 0, height: 1 },

    shadowOpacity: 0.12,

    shadowRadius: 3,

    elevation: 4,

    zIndex: 10,

  },



  googleMapsLabel: {

    fontSize: 15,

    fontWeight: "700",

    color: "#333",

    marginLeft: 10,

    flex: 1,

  },



  googleMapsSub: {

    width: "100%",

    fontSize: 12,

    color: "#5E60CE",

    marginTop: 4,

    marginLeft: 38,

  },



  map: {

    flex: 1,

  },



  cardSelected: {

    backgroundColor: "#E8EAF6",

    borderWidth: 1,

    borderColor: "#5E60CE",

  },



  header: {

    flexDirection: "row",

    alignItems: "center",

    marginBottom: 12,

  },



  heading: {

    fontSize: 20,

    fontWeight: "bold",

    marginLeft: 10,

  },

  stopCount: {
    fontSize: 13,
    color: "#5E60CE",
    fontWeight: "600",
    marginBottom: 10,
  },



  card: {

    padding: 14,

    backgroundColor: "#F1F1F1",

    borderRadius: 12,

    marginBottom: 10,

  },



  stopName: {

    fontSize: 16,

    fontWeight: "600",

  },



  stopDistance: {

    fontSize: 13,

    color: "#666",

    marginTop: 4,

  },



  loadingRow: {

    flexDirection: "row",

    alignItems: "center",

    marginBottom: 10,

  },



  loadingText: {

    marginLeft: 10,

    color: "#555",

    fontSize: 14,

  },



  updatingText: {

    fontSize: 12,

    color: "#5E60CE",

    marginBottom: 8,

    fontStyle: "italic",

  },



  errorBox: {

    marginBottom: 12,

  },



  errorText: {

    color: "#c62828",

    marginBottom: 8,

  },



  retryButton: {

    alignSelf: "flex-start",

    backgroundColor: "#5E60CE",

    paddingVertical: 8,

    paddingHorizontal: 16,

    borderRadius: 8,

  },



  retryText: {

    color: "#fff",

    fontWeight: "600",

  },



  center: {

    flex: 1,

    justifyContent: "center",

    alignItems: "center",

  },

});


