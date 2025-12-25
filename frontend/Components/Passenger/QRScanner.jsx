import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Pressable,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";

export default function QRScanner({ navigation }) {

  // 🔥 WEB HANDLING
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

  const handleScan = ({ data }) => {
    setScanned(true);
    setIsScanning(false);

    try {
      const parsedData = JSON.parse(data);

      navigation.replace("BusDetailsScreen", {
        busData: parsedData,
      });
    } catch (error) {
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

      {/* 🔙 HEADER WITH BACK ARROW */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </Pressable>

                 <Text style={styles.title}>         SCAN QR CODE</Text>
      </View>

      <View style={styles.qrFrame}>
        {isScanning && (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={!scanned ? handleScan : undefined}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          />
        )}
      </View>

      {!isScanning && !scanned && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => setIsScanning(true)}
        >
          <Text style={styles.buttonText}>START SCAN</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 30,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C2C7C",
    marginLeft: 12,
  },

  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  qrFrame: {
    alignSelf: "center",
    width: 260,
    height: 260,
    overflow: "hidden",
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#000",
  },

  button: {
    alignSelf: "center",
    marginTop: 40,
    backgroundColor: "#4834D4",
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 30,
    elevation: 5,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
