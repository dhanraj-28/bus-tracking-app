// ============================================================
//  BusPassForm.jsx  —  Stage 5: Personal Information
//  CHANGES:
//   1. On mount: checks Firestore for existing incomplete pass
//      and prefills the form if found (so user sees their old data)
//   2. handleNext() onSuccess now receives prefillData for Stage 6
//      and passes it via navigation params to BuyBusPassScreen
//   3. Added loading state for initial fetch + saving
//   Everything else (UI, styles) is UNCHANGED.
// ============================================================

import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useState, useEffect } from "react";
import {
  Alert,
  ActivityIndicator,
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

import { handlePersonalInfoNext } from "../../../src/controllers/busPassController";
import { findExistingIncompletePass } from "../../../src/services/busPassService";
import { auth } from "../../../src/config/firebase";

export default function BusPassForm() {
  const navigation = useNavigation();
  const [image, setImage]   = useState(null);
  const [form, setForm]     = useState({
    name: "", dob: "", gender: "", mobile: "", email: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [prefilling, setPrefilling] = useState(true); // spinner while checking Firestore on mount

  // ── On mount: check for existing incomplete pass & prefill form ──
  useEffect(() => {
    const prefillFromExistingPass = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const existing = await findExistingIncompletePass(userId);

        if (existing?.passData) {
          const d = existing.passData;

          // Prefill form fields from stored data
          setForm({
            name:   d.name    || "",
            dob:    d.dob     ? d.dob.toDate().toISOString().split("T")[0] : "",
            // ↑ Firestore Timestamp → ISO string "YYYY-MM-DD"
            gender: d.gender  || "",
            mobile: d.mobileNo || "",
            email:  d.email   || "",
          });

          // Note: we don't prefill the photo (local URIs don't persist between sessions)
          // photoProofUrl is "" anyway since Storage is disabled

          console.log("[BusPassForm] Prefilled from existing pass:", existing.docPassId);
        }
      } catch (e) {
        // Silently fail — just show empty form if prefill fails
        console.warn("[BusPassForm] Prefill check failed:", e);
      } finally {
        setPrefilling(false);
      }
    };

    prefillFromExistingPass();
  }, []);

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setForm({ ...form, dob: formattedDate });
    }
  };

  const handleImagePick = async () => {
    // ── Step 1: Request permission ────────────────────────────
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission denied", "Allow access to photos to upload.");
      return;
    }

    // ── Step 2: Open image picker ─────────────────────────────
    // Using MediaTypeOptions.Images for broad Expo SDK compatibility.
    // (MediaType.Images is newer API — causes silent failure on some versions)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // ← safe for all Expo SDK versions
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,          // slightly compressed — faster upload later
    });

    // ── Step 3: Set image URI if user didn't cancel ───────────
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleNext = async () => {
    setLoading(true);

    await handlePersonalInfoNext(
      {
        name:         form.name,
        dob:          form.dob,
        gender:       form.gender,
        mobileNo:     form.mobile,
        email:        form.email,
        photoLocalUri: image,
      },
      {
        // onSuccess now receives prefillData (existing pass fields or null)
        onSuccess: (prefillData) => {
          setLoading(false);
          navigation.navigate("BuyBusPassScreen", {
            prefillData, // ← Stage 6 uses this to prefill its own fields
          });
        },
        onError: (msg) => {
          setLoading(false);
          Alert.alert("Error", msg);
        },
      }
    );
  };

  // ── Show spinner while checking Firestore on mount ───────────
  if (prefilling) {
    return (
      <View style={styles.prefillLoader}>
        <ActivityIndicator size="large" color="#6A5ACD" />
        <Text style={styles.prefillLoaderText}>Loading your details...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>

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
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text style={{ color: form.dob ? "#000" : "#999" }}>
          {form.dob || "Select Date"}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={form.dob ? new Date(form.dob) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChangeDate}
        />
      )}

      <Text style={styles.label}>Gender</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={form.gender}
          onValueChange={(v) => setForm({ ...form, gender: v })}
        >
          <Picker.Item label="Select Gender" value="" />
          <Picker.Item label="Male"   value="Male" />
          <Picker.Item label="Female" value="Female" />
          <Picker.Item label="Other"  value="Other" />
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

      <TouchableOpacity
        style={[styles.nextBtn, loading && { opacity: 0.7 }]}
        onPress={handleNext}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>NEXT</Text>}
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:       { flexGrow: 1, padding: 20, paddingTop: 60, backgroundColor: "#fff" },
  prefillLoader:   { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  prefillLoaderText: { marginTop: 12, fontSize: 14, color: "#6B7280" },
  headerRow:       { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  headerTitle:     { fontSize: 22, fontWeight: "700", marginLeft: 10 },
  sectionTitle:    { fontSize: 16, color: "#6A5ACD", fontWeight: "bold", marginTop: 10, marginBottom: 8 },
  label:           { alignSelf: "flex-start", fontSize: 14, marginBottom: 4, color: "#555" },
  input:           { width: "100%", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 12 },
  pickerContainer: { width: "100%", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 12 },
  uploadBtn:       { backgroundColor: "#6A5ACD", padding: 12, borderRadius: 25, width: "100%", alignItems: "center", marginVertical: 10, elevation: 3 },
  nextBtn:         { backgroundColor: "#6A5ACD", padding: 12, borderRadius: 25, width: "100%", alignItems: "center", elevation: 3 },
  btnText:         { color: "#fff", fontWeight: "bold" },
  image:           { width: 100, height: 100, borderRadius: 50, marginVertical: 10, alignSelf: "center" },
});