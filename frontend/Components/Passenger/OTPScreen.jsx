import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function OtpScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { phone } = route.params || {};

 const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const inputs = useRef([]);

  const handleChange = (text, index) => {
    if (text.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputs.current[index + 1].focus();
    }
  };
const verifyOTP = async () => {
  const enteredOtp = otp.join("");

  if (enteredOtp.length !== 6) {
    alert("Please enter complete OTP");
    return;
  }

  try {
    const response = await fetch("http://192.168.1.102:5000/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: phone,
        otp: enteredOtp,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("OTP Verified ✅");
      navigation.navigate("Dashboard");
    } else {
      alert(data.message || "Invalid OTP");
    }
  } catch (error) {
    alert("Server error. Check backend.");
  }
};
  return (
    <SafeAreaView style={styles.container}>
      
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.navigate("MobileOTP")}>
        <Ionicons name="arrow-back" size={28} />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>
        Enter the 6 digit OTP sent to
      </Text>

      <Text style={styles.phone}>{phone}</Text>

      {/* OTP Boxes */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref)}
            style={styles.otpBox}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
          />
        ))}
      </View>

      {/* Resend */}
      <Text style={styles.resendText}>
        Didn’t receive OTP?{" "}
        <Text style={styles.resend}>Resend</Text>
      </Text>

      {/* Proceed Button */}
      <TouchableOpacity  onPress={() => navigation.navigate("Dashboard")} style={styles.button}>
        <Text style={styles.buttonText}>Proceed</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 50,
  },
  phone: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 10,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  otpBox: {
    width: 65,
    height: 65,
    borderWidth: 3,
    borderColor: "#4B5CC4",
    borderRadius: 18,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    backgroundColor: "#fff",
  },
  resendText: {
    marginTop: 30,
    fontSize: 16,
    color: "#3B2B2B",
  },
  resend: {
    fontWeight: "700",
    color: "#3B2B2B",
  },
  button: {
    marginTop: "auto",
    backgroundColor: "#3F2CA3",
    paddingVertical: 18,
    borderRadius: 35,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
});
