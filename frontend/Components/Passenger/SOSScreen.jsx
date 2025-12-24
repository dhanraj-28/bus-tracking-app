import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from "react-native";

const SOSScreen = () => {
  const [message, setMessage] = useState("");
  const [contacts, setContacts] = useState([]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.backArrow}>←</Text>
        <Text style={styles.headerTitle}>sos</Text>
      </View>

      {/* Info text */}
      <Text style={styles.infoText}>
        SMS will be automatically send to these contacts whenever an alert is
        triggered. Regular SMS charges will apply.
      </Text>

      {/* Message Section */}
      <Text style={styles.sectionTitle}>Messages</Text>
      <TextInput
        style={styles.input}
        placeholder="Type a message"
        placeholderTextColor="#999"
        value={message}
        onChangeText={setMessage}
      />

      {/* Contacts Section */}
      <Text style={styles.sectionTitle}>Contacts</Text>
      <TouchableOpacity style={styles.addContactBtn}>
        <Text style={styles.addContactText}>+ Add contact</Text>
      </TouchableOpacity>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveBtn}>
        <Text style={styles.saveText}>save</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default SOSScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 50,
  },

  backArrow: {
    fontSize: 40,
    marginRight: 10,
    fontWeight: "600"
  },

  headerTitle: {
    fontSize: 40,
    fontWeight: "700",
    textTransform: "lowercase",
  },

  infoText: {
    marginTop: 16,
    fontSize: 18,
    color: "#555",
    lineHeight: 20,
  },

  sectionTitle: {
    marginTop: 28,
    fontSize: 16,
    fontWeight: "700",
  },

  input: {
    marginTop: 10,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#F1F1F1",
    paddingHorizontal: 14,
    fontSize: 14,
  },

  addContactBtn: {
    marginTop: 12,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#F1F1F1",
    justifyContent: "center",
    alignItems: "center",
  },

  addContactText: {
    color: "#3F3CC9",
    fontSize: 15,
    fontWeight: "600",
  },

  saveBtn: {
    position: "absolute",
    bottom: 60,
    left: 20,
    right: 20,
    height: 52,
    borderRadius: 10,
    backgroundColor: "#4B45B7",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },

  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textTransform: "lowercase",
  },
});
