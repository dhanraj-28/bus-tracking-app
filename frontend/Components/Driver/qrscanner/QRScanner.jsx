// Components/Driver/qrscanner/QRScanner.jsx

import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, Platform, Pressable,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";

export default function QRScanner({ route, navigation }) {

  if (Platform.OS === "web") {
    return (
      <View style={styles.webContainer}>
        <Text style={{ fontSize: 18, textAlign: "center" }}>
          QR Scanner is not supported on Web.
        </Text>
      </View>
    );
  }

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const driverUniqueId = route?.params?.driverUniqueId;
  const driver = route?.params?.driver; // 👈 also carry driver object

  const handleScan = ({ data }) => {
    if (scanned) return;
    setScanned(true);
    setIsScanning(false);

    console.log("RAW QR DATA:", data);

    try {
      const parsedData = JSON.parse(data);
      console.log("PARSED DATA:", parsedData);

      navigation.replace("BusDetailsScreen", {
        busData: parsedData,
        driverUniqueId: driverUniqueId,
        driver: driver, // 👈 pass driver forward
      });
    } catch (error) {
      console.log("PARSE ERROR:", error);
      Alert.alert("Invalid QR Code", "QR does not contain valid bus data");
    }
  };

  if (!permission) return <Text>Checking camera permission...</Text>;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={{ textAlign: "center", marginBottom: 10 }}>
          Camera permission is required
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>GRANT PERMISSION</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Pressable onPress={() => { setScanned(false); setIsScanning(false); }}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </Pressable>
        <Text style={styles.title}>SCAN QR CODE</Text>
      </View>

      <View style={styles.qrFrame}>
        {isScanning && (
  <View
    style={[
      StyleSheet.absoluteFillObject,
      {
        backgroundColor: "red",
        justifyContent: "center",
        alignItems: "center",
      },
    ]}
  >
    <Text>Camera Disabled</Text>
  </View>
)}
      </View>

      {!isScanning && !scanned && (
        <TouchableOpacity style={styles.button} onPress={() => setIsScanning(true)}>
          <Text style={styles.buttonText}>START SCAN</Text>
        </TouchableOpacity>
      )}

      {scanned && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => { setScanned(false); setIsScanning(false); }}
        >
          <Text style={styles.buttonText}>SCAN AGAIN</Text>
        </TouchableOpacity>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 50 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, marginBottom: 30 },
  title: { fontSize: 24, fontWeight: "bold", color: "#2C2C7C", marginLeft: 20 },
  permissionContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  qrFrame: {
    alignSelf: "center", width: 260, height: 260,
    overflow: "hidden", borderRadius: 20, borderWidth: 3, borderColor: "#000",
  },
  button: {
    alignSelf: "center", marginTop: 40, backgroundColor: "#4834D4",
    paddingVertical: 14, paddingHorizontal: 50, borderRadius: 30, elevation: 5,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
});