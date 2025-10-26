import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // ✅ use Expo vector icons

const BusData = [
  { id: "1", busNumber: "5E", routeName: "Avadi", destination: "Adayar", time: "8:10 AM" },
  { id: "2", busNumber: "231B", routeName: "Tambaram", destination: "Guindy", time: "8:30 AM" },
  { id: "3", busNumber: "24A", routeName: "Velachery", destination: "T Nagar", time: "8:45 AM" },
  { id: "4", busNumber: "70", routeName: "Perambur", destination: "Ambattur", time: "9:00 AM" },
  { id: "5", busNumber: "15D", routeName: "Anna Nagar", destination: "Avadi", time: "9:15 AM" },
];

const TrackBusScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBuses, setFilteredBuses] = useState(BusData);

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = BusData.filter(
      (bus) =>
        bus.busNumber.toLowerCase().includes(text.toLowerCase()) ||
        bus.routeName.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredBuses(filtered);
  };

  const renderBusCard = ({ item }) => (
    <View style={styles.card}>
      {/* Left Bus Icon */}
      <Ionicons name="bus-outline" size={26} color="#6A5ACD" style={{ marginRight: 10 }} />

      {/* Route Info */}
      <View style={styles.middleSection}>
        <Text style={styles.busNumber}>{item.busNumber}</Text>
        <Text style={styles.routeName}>{item.routeName} ➜ {item.destination}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>

      {/* Right Bus Icon */}
      <Ionicons name="bus-outline" size={26} color="#6A5ACD" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={25} color="#000" />
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
      {filteredBuses.length > 0 ? (
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
    borderColor: "#6A5ACD", // purple
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
});

export default TrackBusScreen;
