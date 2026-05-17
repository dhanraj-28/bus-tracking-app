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
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";

import { useRef } from "react";

import { auth } from "../../src/config/firebase";

import { sendOtpController } from "../../src/controllers/authController";

export default function PhoneInput() {
  const recaptchaVerifier = useRef(null);
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
const handleSendOtp = async () => {
  try {
    setLoading(true);

    const fullPhoneNumber =
      selectedCountry.code + phone;

    const response = await sendOtpController(
      fullPhoneNumber,
      recaptchaVerifier.current
    );

    if (response.success) {

      Alert.alert(
        "Success",
        "OTP Sent Successfully"
      );

      navigation.navigate("OTPScreen", {
        verificationId: response.verificationId,
        phoneNumber: fullPhoneNumber,
      });

    } else {

      Alert.alert(
        "Error",
        response.error
      );

    }

  } catch (error) {

    Alert.alert(
      "Error",
      error.message
    );

  } finally {

    setLoading(false);

  }
};


  return (
    <SafeAreaView style={styles.container}>
      <FirebaseRecaptchaVerifierModal
  ref={recaptchaVerifier}
  firebaseConfig={auth.app.options}
/>

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
        onPress={handleSendOtp}
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
