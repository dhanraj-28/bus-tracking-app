// ============================================================
//  BusPassForm.jsx  —  Stage 5: Personal Information
//  CHANGES FROM YOUR ORIGINAL:
//   1. Added loading state while uploading + saving to Firestore
//   2. handleNext() now calls handlePersonalInfoNext() from controller
//      instead of just navigating directly
//   3. image (photoLocalUri) is passed to controller for Firebase Storage upload
//   4. Navigation to BuyBusPassScreen happens inside onSuccess callback
//      (only after Firestore write is confirmed)
//   Everything else (UI, styles, pickers, date picker) is UNCHANGED.
// ============================================================

import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  ActivityIndicator,   // ← NEW: spinner while saving
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// ── Controller import ────────────────────────────────────────
import { handlePersonalInfoNext } from "../../../src/controllers/busPassController";
// (adjust the path based on your folder structure)

export default function BusPassForm() {
  const navigation = useNavigation();
  const [image, setImage] = useState(null);
  const [form, setForm] = useState({
    name: "",
    dob: "",
    gender: "",
    mobile: "",
    email: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false); // ← NEW

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setForm({ ...form, dob: formattedDate });
    }
  };

  const handleImagePick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission denied", "Allow access to photos to upload.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // ── CHANGED: was just navigation.navigate(), now calls controller ──
  const handleNext = async () => {
    setLoading(true);

    await handlePersonalInfoNext(
      {
        name: form.name,
        dob: form.dob,           // ISO string "YYYY-MM-DD" from date picker
        gender: form.gender,
        mobileNo: form.mobile,   // note: your state key is "mobile", controller expects "mobileNo"
        email: form.email,
        photoLocalUri: image,    // local file:// URI from expo-image-picker
      },
      {
        // ✅ Firestore write done — navigate forward
        onSuccess: () => {
          setLoading(false);
          navigation.navigate("BuyBusPassScreen");
          // ─── NOTE ────────────────────────────────────────────────────────
          // We removed { formData: form, photo: image } from params because
          // BuyBusPassScreen doesn't need them anymore — it only collects
          // its own data (timePeriod, passType, fromDate) and the controller
          // handles passing docPassId internally between stages.
          // ─────────────────────────────────────────────────────────────────
        },
        // ❌ Something went wrong — show alert, stay on this screen
        onError: (msg) => {
          setLoading(false);
          Alert.alert("Error", msg);
        },
      }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* Back Arrow + Title — UNCHANGED */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.navigate("Dashboard")}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bus Pass</Text>
      </View>

      <Text style={styles.sectionTitle}>Personal information</Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={form.name}
        onChangeText={(t) => setForm({ ...form, name: t })}
      />

      <Text style={styles.label}>Date of Birth</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={{ color: form.dob ? "#000" : "#999" }}>
          {form.dob || "Select Date"}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChangeDate}
        />
      )}

      <Text style={styles.label}>Gender</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={form.gender}
          onValueChange={(itemValue) =>
            setForm({ ...form, gender: itemValue })
          }
        >
          <Picker.Item label="Select Gender" value="" />
          <Picker.Item label="Male" value="Male" />
          <Picker.Item label="Female" value="Female" />
          <Picker.Item label="Other" value="Other" />
        </Picker>
      </View>

      <Text style={styles.sectionTitle}>Contact information</Text>

      <Text style={styles.label}>Mobile No</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your mobile number"
        keyboardType="phone-pad"
        value={form.mobile}
        onChangeText={(t) => setForm({ ...form, mobile: t })}
      />

      <Text style={styles.label}>Email ID</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        keyboardType="email-address"
        value={form.email}
        onChangeText={(t) => setForm({ ...form, email: t })}
      />

      {image && <Image source={{ uri: image }} style={styles.image} />}

      <TouchableOpacity style={styles.uploadBtn} onPress={handleImagePick}>
        <Text style={styles.btnText}>UPLOAD PHOTOGRAPH</Text>
      </TouchableOpacity>

      {/* ── NEXT button — shows spinner while saving ── */}
      <TouchableOpacity
        style={[styles.nextBtn, loading && { opacity: 0.7 }]}
        onPress={handleNext}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>NEXT</Text>
        )}
      </TouchableOpacity>

    </ScrollView>
  );
}

// ── Styles — COMPLETELY UNCHANGED ────────────────────────────
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#6A5ACD",
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 8,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    marginBottom: 4,
    color: "#555",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  pickerContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
  },
  uploadBtn: {
    backgroundColor: "#6A5ACD",
    padding: 12,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
    marginVertical: 10,
    elevation: 3,
  },
  nextBtn: {
    backgroundColor: "#6A5ACD",
    padding: 12,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
    elevation: 3,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginVertical: 10,
    alignSelf: "center",
  },
});