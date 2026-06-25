import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  fetchStopSuggestionsController,
  searchBusesController,
} from "../../src/controllers/findBusRouteController";

const RECENT_SEARCHES_KEY = "@trackbus_recent_searches";
const MAX_RECENT_SEARCHES = 8;

const loadRecentSearches = async () => {
  try {
    const raw = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveRecentSearch = async (from, to, buses, distance) => {
  const entry = {
    id: `${from.toLowerCase()}-${to.toLowerCase()}`,
    from,
    to,
    buses,
    distance,
    searchedAt: Date.now(),
  };

  let history = await loadRecentSearches();
  history = history.filter(
    (item) =>
      item.from.toLowerCase() !== from.toLowerCase() ||
      item.to.toLowerCase() !== to.toLowerCase(),
  );
  history.unshift(entry);
  history = history.slice(0, MAX_RECENT_SEARCHES);

  await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(history));
  return history;
};

const getAllPreviousBuses = (history) => {
  const seen = new Set();
  const buses = [];

  history.forEach((search) => {
    search.buses?.forEach((bus) => {
      const key = bus.id || `${bus.routeId}-${bus.number}`;
      if (!seen.has(key)) {
        seen.add(key);
        buses.push(bus);
      }
    });
  });

  return buses;
};

export default function HomeScreen() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [startStops, setStartStops] = useState([]);
  const [endStops, setEndStops] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [distance, setDistance] = useState(null);
  const [error, setError] = useState(null);
  const [isPreviousView, setIsPreviousView] = useState(false);

  const navigation = useNavigation();

  const showPreviousSearches = useCallback((history) => {
    const previousBuses = getAllPreviousBuses(history);
    setFilteredBuses(previousBuses);
    setDistance(history[0]?.distance ?? null);
    setIsPreviousView(previousBuses.length > 0);
  }, []);

  useEffect(() => {
    const loadStops = async () => {
      const result = await fetchStopSuggestionsController();
      if (result.success) {
        setStartStops(result.startStops);
        setEndStops(result.endStops);
      } else {
        setError(result.error);
      }
      setLoading(false);
    };

    loadStops();
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadPrevious = async () => {
        setFrom("");
        setTo("");
        setShowFromSuggestions(false);
        setShowToSuggestions(false);
        setSearching(false);

        const history = await loadRecentSearches();
        if (!active) return;

        showPreviousSearches(history);
      };

      loadPrevious();
      return () => {
        active = false;
      };
    }, [showPreviousSearches]),
  );

  useEffect(() => {
    if (!from.trim() || !to.trim()) {
      return;
    }

    const searchBuses = async () => {
      setSearching(true);
      setError(null);
      setIsPreviousView(false);

      const result = await searchBusesController(from, to);

      if (result.success) {
        setFilteredBuses(result.buses);
        setDistance(result.buses[0]?.distance ?? null);

        if (result.buses.length > 0) {
          setError(null);
          await saveRecentSearch(
            from.trim(),
            to.trim(),
            result.buses,
            result.buses[0]?.distance ?? null,
          );
        } else {
          setError(
            result.message ||
              `No bus found for "${from.trim()}" to "${to.trim()}". Use exact stop names.`,
          );
        }
      } else {
        setFilteredBuses([]);
        setDistance(null);
        setError(result.error || "Could not fetch buses from database.");
      }

      setSearching(false);
    };

    const timer = setTimeout(searchBuses, 400);
    return () => clearTimeout(timer);
  }, [from, to]);

  const filteredFromSuggestions = startStops.filter((place) =>
    place.toLowerCase().includes(from.toLowerCase()),
  );
  const filteredToSuggestions = endStops.filter((place) =>
    place.toLowerCase().includes(to.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={() => navigation.navigate("Dashboard")}>
            <Ionicons name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Find Bus Route</Text>
          <View style={{ width: 26 }} />
        </View>

        <View style={{ width: "100%", alignItems: "center" }}>
          <TextInput
            value={from}
            onChangeText={(text) => {
              setFrom(text);
              setShowFromSuggestions(true);
            }}
            placeholder="From"
            placeholderTextColor="#999"
            style={styles.input}
          />

          {showFromSuggestions && from.length > 0 && (
            <FlatList
              style={styles.suggestionList}
              data={filteredFromSuggestions}
              keyExtractor={(item, index) => index.toString()}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => {
                    setFrom(item);
                    setShowFromSuggestions(false);
                  }}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        <Text style={styles.arrow}>⇄</Text>

        <View style={{ width: "100%", alignItems: "center", zIndex: 2 }}>
          <TextInput
            value={to}
            onChangeText={(text) => {
              setTo(text);
              setShowToSuggestions(true);
            }}
            placeholder="To"
            placeholderTextColor="#999"
            style={styles.input}
            onFocus={() => setShowToSuggestions(true)}
            onSubmitEditing={() => setShowToSuggestions(false)}
          />

          {showToSuggestions &&
            to.length > 0 &&
            filteredToSuggestions.length > 0 && (
              <FlatList
                style={[styles.suggestionList, { zIndex: 5 }]}
                data={filteredToSuggestions}
                keyExtractor={(item, index) => index.toString()}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => {
                      setTo(item);
                      setShowToSuggestions(false);
                    }}
                  >
                    <Text>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
        </View>

        <Text style={styles.headerText}>
          {"\n"}
          {distance != null ? `Distance: ${distance} km` : "Distance: —"}
        </Text>
      </View>

      {loading && (
        <ActivityIndicator
          size="large"
          color="#7A73D1"
          style={{ marginTop: 24 }}
        />
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.listWrapper}>
        {searching && !loading && (
          <ActivityIndicator
            size="small"
            color="#7A73D1"
            style={{ marginTop: 12 }}
          />
        )}

        {!loading && filteredBuses.length > 0 ? (
          <FlatList
            data={filteredBuses}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            style={styles.busList}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                // AFTER
                onPress={() =>
                  navigation.navigate("LiveTrack", {
                    bus: {
                      ...item,
                      // Safety net: covers stale AsyncStorage entries saved before the service fix
                      busName:
                        item.busName ||
                        item.number ||
                        item.busNumber ||
                        item.routeName ||
                        item.routeId ||
                        "Bus",
                    },
                  })
                }
              >
                <Text style={styles.busNumber}>Bus Number: {item.number}</Text>
                <View style={styles.routeRow}>
                  <View style={styles.routeIndicator}>
                    <Text>●</Text>
                    <View style={{ height: 12 }} />
                    <Text>●</Text>
                  </View>
                  <View style={styles.routeText}>
                    <Text>{item.from}</Text>
                    <Text>{item.to}</Text>
                  </View>
                  <View style={styles.timing}>
                    {item.distance != null && (
                      <Text style={styles.timingText}>{item.distance} km</Text>
                    )}
                    {item.routeName ? (
                      <Text style={styles.timingSub}>{item.routeName}</Text>
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : !loading &&
          from.trim() &&
          to.trim() &&
          !isPreviousView &&
          !error ? (
          <Text style={styles.noBusText}>No buses found for this route.</Text>
        ) : null}
      </View>
    </View>
  );
}

export function BusDetailScreen({ route }) {
  const { number, busNumber, routeName, from, to, distance } = route.params;

  return (
    <View style={styles.detailContainer}>
      <Text style={styles.detailTitle}>Bus Number: {number}</Text>
      {busNumber ? (
        <Text style={styles.detailText}>Plate: {busNumber}</Text>
      ) : null}
      {routeName ? (
        <Text style={styles.detailText}>Route: {routeName}</Text>
      ) : null}
      <Text style={styles.detailText}>From: {from}</Text>
      <Text style={styles.detailText}>To: {to}</Text>
      {distance != null ? (
        <Text style={styles.detailText}>Distance: {distance} km</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#7A73D1",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    padding: 30,
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 8,
    width: 195,
    textAlign: "center",
    fontSize: 16,
    marginVertical: 5,
  },
  arrow: { color: "#fff", fontSize: 22, fontWeight: "bold", marginVertical: 5 },
  suggestionList: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: 200,
    maxHeight: 120,
    elevation: 5,
    position: "absolute",
    top: 45,
    zIndex: 10,
  },
  suggestionItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  topHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    marginTop: 20,
  },
  listWrapper: { flex: 1 },
  busList: { flex: 1 },
  listContent: { paddingBottom: 24 },
  card: {
    backgroundColor: "#fff",
    margin: 10,
    borderRadius: 12,
    elevation: 4,
    padding: 15,
  },
  busNumber: { fontWeight: "bold", fontSize: 16, marginBottom: 10 },
  routeRow: { flexDirection: "row", alignItems: "center" },
  routeIndicator: { alignItems: "center", marginRight: 10 },
  routeText: { flex: 1, fontSize: 15 },
  timing: { alignItems: "flex-end" },
  timingText: { fontSize: 14, fontWeight: "600" },
  timingSub: { fontSize: 12, color: "#666", marginTop: 4 },
  detailContainer: { flex: 1, padding: 24 },
  detailTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  detailText: { fontSize: 16, marginBottom: 8, color: "#333" },
  noBusText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#999",
  },
  errorText: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 14,
    color: "#c00",
  },
});
