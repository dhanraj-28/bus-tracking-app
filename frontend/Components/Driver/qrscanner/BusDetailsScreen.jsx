// Components/Driver/BusDetailsScreen.jsx

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { handleProceed } from "../../../src/controllers/BusDetailController";

export default function BusDetailsScreen({ route, navigation }) {
  const { busData, driverUniqueId } = route.params;
  const [loading, setLoading] = useState(false);

  const onProceed = async () => {
    setLoading(true);

    const result = await handleProceed(driverUniqueId, busData);

    setLoading(false);

    if (result.success) {
      navigation.navigate("DriverDashboard", {
        driverUniqueId,
        busData,
      });
    } else {
      Alert.alert("Error", result.error);
    }
  };

  return (
    <View style={styles.container}>

      {/* Back Arrow */}
      <Pressable
        style={styles.backButton}
        onPress={() => navigation.replace("QRScanner")}
      >
        <Ionicons name="arrow-back" size={28} color="#000" />
      </Pressable>

      <Text style={styles.header}>BUS DETAILS</Text>

      <Text style={styles.label}>BUS NAME</Text>
      <TextInput
        style={styles.input}
        value={busData.busName}
        editable={false}
      />

      <Text style={styles.label}>ROUTE DATE</Text>
      <TextInput
        style={styles.input}
        value={busData.routeDate}
        editable={false}
      />

      <Text style={styles.label}>ROUTE NUMBER</Text>
      <TextInput
        style={styles.input}
        value={busData.routeNumber}
        editable={false}
      />

      <Text style={styles.label}>ROUTE NAME</Text>
      <TextInput
        style={styles.input}
        value={busData.routeName}
        editable={false}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={onProceed}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>PROCEED</Text>
        }
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 15,
    zIndex: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#2C2C7C",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#F2F2F2",
  },
  button: {
    marginTop: 30,
    backgroundColor: "#4834D4",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});