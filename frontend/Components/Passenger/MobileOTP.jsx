import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PhoneInput() {
  const navigation = useNavigation();

  const [selectedCountry, setSelectedCountry] = useState({
    name: "India",
    code: "+91",
    flag: "🇮🇳",
  });

  const countries = [
    { name: "India", code: "+91", flag: "🇮🇳" },
  ];

  const [modalVisible, setModalVisible] = useState(false);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOTP = async () => {
    const cleanPhone = phone.replace(/\D/g, "");

    if (!cleanPhone || cleanPhone.length !== 10) {
      Alert.alert("Error", "Please enter valid 10 digit mobile number");
      return;
    }

    const fullPhone = selectedCountry.code + cleanPhone;

    try {
      setLoading(true);

      const response = await fetch("http://192.168.1.102:5000/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: fullPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message || "Failed to send OTP");
        setLoading(false);
        return;
      }

      Alert.alert("Success", "OTP sent successfully ✅");

      navigation.navigate("OTPScreen", { phone: fullPhone });

    } catch (error) {
      console.log("OTP Error:", error);
      Alert.alert("Error", "Server not reachable. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.navigate("Landing")}>
        <Ionicons name="arrow-back" size={29} />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>
        Enter your mobile number to{"\n"}get OTP
      </Text>

      {/* Input Row */}
      <View style={styles.inputRow}>

        {/* Country Picker */}
        <TouchableOpacity
          style={styles.countryButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.countryText}>
            {selectedCountry.flag} {selectedCountry.code}
          </Text>
        </TouchableOpacity>

        {/* Phone Input */}
        <TextInput
          style={styles.input}
          placeholder="Enter mobile number"
          keyboardType="phone-pad"
          maxLength={10}
          value={phone}
          onChangeText={(text) =>
            setPhone(text.replace(/\D/g, "").slice(0, 10))
          }
        />
      </View>

      {/* Get OTP Button */}
      <TouchableOpacity
        onPress={sendOTP}
        style={styles.button}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Sending..." : "Get OTP"}
        </Text>
      </TouchableOpacity>

      {/* Country Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <FlatList
            data={countries}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.countryItem}
                onPress={() => {
                  setSelectedCountry(item);
                  setModalVisible(false);
                }}
              >
                <Text style={{ fontSize: 18 }}>
                  {item.flag} {item.name} ({item.code})
                </Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    marginVertical: 30,
    fontWeight: "900",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#6A5ACD",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  countryButton: {
    paddingRight: 10,
    borderRightWidth: 1,
    borderColor: "#ccc",
  },
  countryText: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#6A5ACD",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 40,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  countryItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
});
