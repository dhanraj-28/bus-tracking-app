import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";

// Bus data
const buses = [
  { id: "1", number: "18Ax", from: "Marina beach", to: "Central", arrival: "8:10 AM", expected: "8:45 AM" },
  { id: "2", number: "21A", from: "Marina beach", to: "Central", arrival: "8:30 AM", expected: "9:10 AM" },
  { id: "3", number: "3B", from: "Marina beach", to: "Central", arrival: "9:00 AM", expected: "9:35 AM" },
  { id: "4", number: "22C", from: "Marina beach", to: "Central", arrival: "9:15 AM", expected: "9:50 AM" },
  { id: "5", number: "27D", from: "Ambattur", to: "Central", arrival: "9:45 AM", expected: "10:20 AM" },
  { id: "6", number: "21G", from: "Tambaram", to: "Central", arrival: "7:15 AM", expected: "8:00 AM" },
  { id: "7", number: "11B", from: "Adyar", to: "Velachery", arrival: "8:00 AM", expected: "8:35 AM" },
  { id: "8", number: "29C", from: "Central", to: "Marina beach", arrival: "8:20 AM", expected: "8:55 AM" },
  { id: "9", number: "36A", from: "Marina beach", to: "Adyar", arrival: "8:50 AM", expected: "9:25 AM" },
  { id: "10", number: "38D", from: "Adyar", to: "Central", arrival: "9:10 AM", expected: "9:50 AM" },
  { id: "11", number: "48D", from: "Ambattur", to: "Madhavaram", arrival: "9:20 AM", expected: "9:50 AM" },
];

// Extract unique places from buses
const allPlaces = [...new Set(buses.flatMap(bus => [bus.from, bus.to]))];

export default function HomeScreen() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const router = useRouter();

  // Filter buses based on user input
  const filteredBuses = buses.filter(
    bus =>
      bus.from.toLowerCase().includes(from.toLowerCase()) &&
      bus.to.toLowerCase().includes(to.toLowerCase())
  );

  // Filter suggestions
  const filteredFromSuggestions = allPlaces.filter(place =>
    place.toLowerCase().includes(from.toLowerCase())
  );
  const filteredToSuggestions = allPlaces.filter(place =>
    place.toLowerCase().includes(to.toLowerCase())
  );

  return (
    <View style={styles.container}>
      
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Track Bus</Text>

        {/* From Input */}
        <View style={{ width: "100%", alignItems: "center" }}>
          <TextInput
            value={from}
            onChangeText={text => {
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

        {/* To Input */}
        <View style={{ width: "100%", alignItems: "center", zIndex: 2 }}>
          <TextInput
            value={to}
            onChangeText={text => {
              setTo(text);
              setShowToSuggestions(true);
            }}
            placeholder="To"
            placeholderTextColor="#999"
            style={styles.input}
            onFocus={() => setShowToSuggestions(true)}
            onSubmitEditing={() => setShowToSuggestions(false)}
          />

          {showToSuggestions && to.length > 0 && filteredToSuggestions.length > 0 && (
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

        <Text style={styles.headerText}>{"\n"}Distance: 10km</Text>
      </View>

      {/* Bus List */}
      {filteredBuses.length > 0 ? (
        <FlatList
          data={filteredBuses}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push({ pathname: "/trackbus", params: item })}
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
                  <Text>Arrival: {item.arrival}</Text>
                  <Text>Expected: {item.expected}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.noBusText}>No buses found for this route.</Text>
      )}
    </View>
  );
}

// Optional Bus Detail Screen
export function BusDetailScreen({ route }) {
  const { number, from, to, arrival, expected } = route.params;

  return (
    <View style={styles.detailContainer}>
      <Text style={styles.detailTitle}>Bus Number: {number}</Text>
      <Text style={styles.detailText}>From: {from}</Text>
      <Text style={styles.detailText}>To: {to}</Text>
      <Text style={styles.detailText}>Arrival: {arrival}</Text>
      <Text style={styles.detailText}>Expected: {expected}</Text>
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
  headerText: { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 8,
    width: 200,
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
  noBusText: { textAlign: "center", marginTop: 50, fontSize: 16, color: "#999" },
});