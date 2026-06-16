// ============================================================
//  IdentityVerification.jsx  —  Stage 7: Identity Verification
//  CHANGES FROM YOUR ORIGINAL:
//   1. Added loading state while uploading + saving to Firestore
//   2. handleApplyPass() now calls handleApplyPass() from controller
//      instead of just navigating to PaymentScreen
//   3. file.uri is passed as identityPhotoLocalUri for Firebase Storage upload
//      (DocumentPicker returns result.assets[0].uri — perfect for putFile())
//   4. identityProofType is normalized to "Aadhaar" | "PAN" | "Voter ID"
//      (your Picker values are "aadhar"/"pan"/"voterid" — we map them)
//   5. identityProofNumber field name aligned with controller expectations
//   6. Navigation to PaymentScreen happens in onSuccess with docPassId param
//   Everything else (UI, styles, picker, document picker) is UNCHANGED.
// ============================================================

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,   // ← NEW
  Alert,               // ← NEW (replaces bare alert())
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// ── Controller import ────────────────────────────────────────
import { handleApplyPass } from "../../../src/controllers/busPassController";

export default function IdentityVerification() {
  const navigation = useNavigation();
  const [selectedDoc, setSelectedDoc] = useState("");
  const [value, setValue] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false); // ← NEW

  const getPlaceholder = () => {
    if (selectedDoc === "aadhar")  return "AADHAAR NUMBER";
    if (selectedDoc === "pan")     return "PAN NUMBER";
    if (selectedDoc === "voterid") return "VOTER ID NUMBER";
    return "";
  };

  const handleInputChange = (text) => {
    if (selectedDoc === "aadhar") {
      setValue(text.replace(/[^0-9]/g, ""));
    } else {
      setValue(text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase());
    }
  };

  const handleUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
    });
    if (!result.canceled) {
      setFile(result.assets[0]);
      Alert.alert("File Selected", result.assets[0].name);
    }
  };

  // ── NEW: Map your Picker values → clean proof type strings ──
  // Picker values: "aadhar" | "pan" | "voterid"
  // Controller expects: "Aadhaar" | "PAN" | "Voter ID"
  const normalizeProofType = (pickerValue) => {
    switch (pickerValue) {
      case "aadhar":  return "Aadhaar";
      case "pan":     return "PAN";
      case "voterid": return "Voter ID";
      default:        return "";
    }
  };

  // ── CHANGED: was just navigation.navigate(), now calls controller ──
  const handleApplyPassPress = async () => {
    if (!selectedDoc || !value || !file) {
      Alert.alert("Missing Fields", "Please fill all fields and upload proof");
      return;
    }

    setLoading(true);

    await handleApplyPass(
      {
        identityProofType: normalizeProofType(selectedDoc),  // "Aadhaar" | "PAN" | "Voter ID"
        identityProofNumber: value,                           // the number entered
        identityPhotoLocalUri: file.uri,                     // local file URI for Storage upload
        // ─── NOTE ────────────────────────────────────────────────────────
        // DocumentPicker returns result.assets[0].uri which is a local
        // file:// URI — this is what Firebase Storage's putFile() needs.
        // ─────────────────────────────────────────────────────────────────
      },
      {
        // ✅ Firestore finalized, payment:false set — navigate to Payment
        onSuccess: (docPassId) => {
          setLoading(false);
          navigation.navigate("PaymentScreen", {
            docPassId, // ← pass this to PaymentScreen for the payment flow later
          });
        },
        // ❌ Something went wrong
        onError: (msg) => {
          setLoading(false);
          Alert.alert("Error", msg);
        },
      }
    );
  };

  return (
    <View style={styles.container}>

      {/* Back Arrow + Title — UNCHANGED */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Identity verification</Text>
      </View>

      <View style={styles.formBox}>
        <Text style={styles.label}>Identity Proof</Text>

        {/* Picker — UNCHANGED */}
        <View style={styles.pickerBox}>
          <Picker
            selectedValue={selectedDoc}
            onValueChange={(val) => {
              setSelectedDoc(val);
              setValue("");
            }}
          >
            <Picker.Item label="Select Document" value="" />
            <Picker.Item label="Aadhaar" value="aadhar" />
            <Picker.Item label="PAN" value="pan" />
            <Picker.Item label="Voter ID" value="voterid" />
          </Picker>
        </View>

        {/* Number Input — UNCHANGED */}
        {selectedDoc !== "" && (
          <TextInput
            style={styles.input}
            placeholder={getPlaceholder()}
            value={value}
            onChangeText={handleInputChange}
            keyboardType={selectedDoc === "aadhar" ? "numeric" : "default"}
          />
        )}

        <Text style={styles.label}>Upload ID Proof</Text>

        {/* Upload Proof button — UNCHANGED */}
        <TouchableOpacity style={styles.button} onPress={handleUpload}>
          <Text style={styles.buttonText}>Upload Proof</Text>
        </TouchableOpacity>

        {/* Apply Pass button — shows spinner while saving */}
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleApplyPassPress}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Apply Pass</Text>
          )}
        </TouchableOpacity>

        {file && (
          <Text style={styles.fileText}>Selected File: {file.name}</Text>
        )}
      </View>
    </View>
  );
}

// ── Styles — COMPLETELY UNCHANGED ────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  headerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  formBox: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#5A3EF5",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  fileText: {
    marginTop: 15,
    textAlign: "center",
    color: "green",
  },
});