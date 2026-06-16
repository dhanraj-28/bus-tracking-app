import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  FlatList,
  Linking,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import {
  getDocs
} from "firebase/firestore";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db, auth } from "../../src/config/firebase";

async function sendSOSMessage(numbers, textMessage) {
  const body = encodeURIComponent(textMessage);
  const recipients = numbers.join(",");
  const url =
    Platform.OS === "ios"
      ? `sms:${recipients}&body=${body}`
      : `sms:${recipients}?body=${body}`;

  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    throw new Error("SMS not available on this device");
  }
  await Linking.openURL(url);
}

const SOSScreen = () => {
  const navigation = useNavigation();

  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [contacts, setContacts] = useState([]);

  // Add contact locally
  const handleAddContact = () => {
    if (!phone) {
      Alert.alert("Error", "Enter phone number");
      return;
    }

    const newContact = {
      id: Date.now().toString(),
      phone,
    };

    setContacts([...contacts, newContact]);

    setPhone("");

    Alert.alert("Success", "Contact Added");
  };

  // Save all contacts to Firestore
  const handleSave = async () => {
    try {
      const uid = auth.currentUser.uid;

      if (contacts.length === 0) {
        Alert.alert("Error", "Add at least one contact");
        return;
      }

      // save each contact
      for (const contact of contacts) {
        await addDoc(
          collection(db, "users", uid, "sosContacts"),
          {
            phone: contact.phone,
            message: message,
            createdAt: serverTimestamp(),
          }
        );
      }

      Alert.alert(
        "Success",
        "SOS Contacts stored in Firestore"
      );

      setContacts([]);
      setMessage("");

    } catch (error) {
      console.log(error);

      Alert.alert(
        "Error",
        error.message
      );
    }
  };
  const triggerSOS = async () => {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    // 1. Ask location permission
    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission denied", "Location required for SOS");
      return;
    }

    // 2. Get current location
    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    // 3. Google Maps link
    const locationLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

    // 4. Fetch saved contacts
    const snapshot = await getDocs(
      collection(db, "users", uid, "sosContacts")
    );

    const numbers = snapshot.docs.map((doc) => doc.data().phone);

    if (numbers.length === 0) {
      Alert.alert("Error", "No SOS contacts found");
      return;
    }

    // 5. Create message
    const textMessage =
      `🚨 EMERGENCY SOS ALERT 🚨\n\n` +
      `I need help immediately!\n` +
      `My location: ${locationLink}`;

    // 6. Open SMS app with message and contacts
    await sendSOSMessage(numbers, textMessage);

    Alert.alert("Success", "SMS app opened — tap Send to alert your contacts");
  } catch (error) {
    console.log(error);
    Alert.alert("Error", error.message);
  }
};
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons
            style={styles.backIcon}
            name="arrow-back"
            size={26}
            color="#000"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>sos</Text>
      </View>

      {/* Info */}
      <Text style={styles.infoText}>
        SMS will be automatically send to these
        contacts whenever an alert is triggered.
        Regular SMS charges will apply.
      </Text>

      {/* Message */}
      <Text style={styles.sectionTitle}>
        Message
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Type SOS message"
        placeholderTextColor="#999"
        value={message}
        onChangeText={setMessage}
      />

      {/* Phone Number */}
      <Text style={styles.sectionTitle}>
        Contact Number
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter phone number"
        placeholderTextColor="#999"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      {/* Add Contact Button */}
      <TouchableOpacity
        style={styles.addContactBtn}
        onPress={handleAddContact}
      >
        <Text style={styles.addContactText}>
          + Add Contact
        </Text>
      </TouchableOpacity>

      {/* Contact List */}
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 20 }}
        renderItem={({ item }) => (
          <View style={styles.contactCard}>
            <Text style={styles.contactText}>
              {item.phone}
            </Text>
          </View>
        )}
      />
      <TouchableOpacity
  style={{
    backgroundColor: "red",
    padding: 16,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  }}
  onPress={triggerSOS}
>
  <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
    🚨 TRIGGER SOS
  </Text>
</TouchableOpacity>
      {/* Save Button */}
      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleSave}
      >
        <Text style={styles.saveText}>
          save
        </Text>
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

  headerTitle: {
    fontSize: 40,
    fontWeight: "700",
    textTransform: "lowercase",
    marginLeft: 10,
  },

  infoText: {
    marginTop: 16,
    fontSize: 18,
    color: "#555",
    lineHeight: 24,
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

  contactCard: {
    backgroundColor: "#F1F1F1",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  contactText: {
    fontSize: 15,
    color: "#000",
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