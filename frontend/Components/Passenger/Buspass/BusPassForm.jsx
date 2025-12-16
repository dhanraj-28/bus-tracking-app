import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";


export default function BusPassForm() {
  const [image, setImage] = useState(null);
  const [form, setForm] = useState({
    name: "",
    dob: "",
    gender: "",
    mobile: "",
    email: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 📅 Date Picker Handler
  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setForm({ ...form, dob: formattedDate });
    }
  };

  // 📸 Image Upload
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

  // ✅ Next Button
  const handleNext = () => {
    if (!form.name || !form.mobile || !form.email) {
      Alert.alert("Please fill all required fields");
      return;
    }
    Alert.alert("Proceed to next step");
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Bus Pass</Text>

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
          onValueChange={(itemValue) => setForm({ ...form, gender: itemValue })}
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

      <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
        <Text style={styles.btnText}>NEXT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const styles=StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
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
  },
  
})