

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function IdentityVerification() {
  const [selectedDoc, setSelectedDoc] = useState("");
  const [value, setValue] = useState("");
  const [file, setFile] = useState(null);



  const getPlaceholder = () => {
    if (selectedDoc === "aadhar") return "AADHAAR NUMBER";
    if (selectedDoc === "pan") return "PAN NUMBER";
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
      alert("Selected File: " + result.assets[0].name);
    }
  };

  const handleApplyPass = () => {
    if (!selectedDoc || !value || !file) {
      alert("Please fill all fields and upload proof");
      return;
    }
    alert("Pass Applied Successfully!");
  };

  return (
    <View style={styles.container}>

      {/* 🔙 Back Arrow + Title */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Identity verification</Text>
      </View>

      <View style={styles.formBox}>
        <Text style={styles.label}>Identity Proof</Text>

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

        <TouchableOpacity style={styles.button} onPress={handleUpload}>
          <Text style={styles.buttonText}>Upload Proof</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleApplyPass}>
          <Text style={styles.buttonText}>Apply Pass</Text>
        </TouchableOpacity>

        {file && (
          <Text style={styles.fileText}>Selected File: {file.name}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  /* Header */
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