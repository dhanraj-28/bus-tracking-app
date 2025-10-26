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
import Icon from "react-native-vector-icons/Ionicons"; // npm i react-native-vector-icons

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
      <View style={styles.leftSection}>
        <Icon name="bus-outline" size={20} color="#000" />
        <Text style={styles.busNumber}>{item.busNumber}</Text>
        <Text style={styles.routeName}>{item.routeName}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>

      <Icon name="arrow-forward" size={20} color="#000" style={{ marginHorizontal: 15 }} />

      <View style={styles.rightSection}>
        <Text style={styles.destination}>{item.destination}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Icon name="arrow-back" size={25} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>track bus</Text>
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
        <Icon name="search" size={22} color="#000" style={styles.searchIcon} />
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
    textTransform: "lowercase",
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
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leftSection: {
    flex: 1,
  },
  rightSection: {
    flex: 1,
    alignItems: "flex-end",
  },
  busNumber: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  routeName: {
    fontSize: 14,
    textTransform: "uppercase",
    color: "#333",
  },
  destination: {
    fontSize: 16,
    fontWeight: "700",
  },
  time: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
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