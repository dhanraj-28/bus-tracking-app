import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getAllRoutes, searchBusesController } from "../../src/controllers/trackController";

const TrackSearch = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [allBuses, setAllBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchAllBuses = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const routes = await getAllRoutes();
        setAllBuses(routes || []);
        setFilteredBuses(routes || []);
      } catch (error) {
        console.error("Error fetching all buses:", error);
        setErrorMsg(error.message || String(error));
      } finally {
        setLoading(false);
      }
    };
    fetchAllBuses();
  }, []);

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredBuses(allBuses);
      return;
    }
    await searchBusesController(text, setFilteredBuses, setLoading);
  };


const getStopsCount = (item) => {
  if (!item) return 0;
  const fields = ["STOPS", "stops", "stoppings", "Stoppings", "stopping"];
  for (const field of fields) {
    if (item[field]) {
      if (Array.isArray(item[field])) {
        return item[field].length;
      } else if (typeof item[field] === "object") {
        return Object.keys(item[field]).length;
      }
    }
  }
  return 0;
};

const renderBusCard = ({ item }) => {
  const stopsCount = getStopsCount(item);
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => navigation.navigate("LiveTrack", { bus: item })}
    >
      <Ionicons
        name="bus-outline"
        size={26}
        color="#6A5ACD"
        style={{ marginRight: 10 }}
      />

      <View style={styles.middleSection}>
        <Text style={styles.busNumber}>{item.busNumber || item.busName || "N/A"}</Text>
        <Text style={styles.routeName}>
          {item.routeName || "N/A"} ➜ {item.destination || item.endStop || "N/A"}
        </Text>
        {stopsCount > 0 && (
          <Text style={styles.stopsCount}>📍 {stopsCount} Stops</Text>
        )}
        <Text style={styles.time}>{item.time || ""}</Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={22}
        color="#6A5ACD"
      />
    </TouchableOpacity>
  );
};
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
    <TouchableOpacity onPress={() => navigation.navigate("Dashboard")}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Track Bus</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="ENTER BUS NUMBER OR BUS NAME"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <Ionicons name="search" size={22} color="#000" style={styles.searchIcon} />
      </View>

      {/* Bus List */}
      {errorMsg ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={50} color="#ff3b30" />
          <Text style={styles.errorText}>Permission Error</Text>
          <Text style={styles.errorHelp}>
            Firestore Security Rules are blocking access to your routes collection. Please update your rules in the Firebase Console.
          </Text>
        </View>
      ) : loading ? (
        <ActivityIndicator size="large" color="#6A5ACD" style={{ marginTop: 50 }} />
      ) : filteredBuses.length > 0 ? (
        <FlatList
          data={filteredBuses}
          keyExtractor={(item) => item.id}
          renderItem={renderBusCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      ) : (
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>No buses found 😞</Text>
          <Text style={styles.noBusText}>No buses found for this route.</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#6A5ACD",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 13,
    letterSpacing: 1,
    color: "#333",
  },
  searchIcon: {
    marginLeft: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  middleSection: {
    flex: 1,
    alignItems: "center",
  },
  busNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  routeName: {
    fontSize: 14,
    color: "#555",
    marginVertical: 4,
  },
  stopsCount: {
    fontSize: 13,
    color: "#6A5ACD",
    fontWeight: "600",
    marginVertical: 2,
  },
  time: {
    fontSize: 12,
    color: "#888",
  },
  notFoundContainer: {
    alignItems: "center",
    marginTop: 100,
  },
  notFoundText: {
    fontSize: 16,
    color: "#888",
  },
  noBusText: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 5,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ff3b30",
    marginTop: 10,
  },
  errorHelp: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
});

export default TrackSearch;