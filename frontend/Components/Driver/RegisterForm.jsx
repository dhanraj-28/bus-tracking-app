import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

export default function RegisterForm() {
  const [form, setForm] = useState({
    name: "",
    uid: "",
    password: "",
  });

  const handleRegister = () => {
    if (!form.name || !form.uid || !form.password) {
      alert("Please fill all fields");
      return;
    }
    alert("Registered Successfully!");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>REGISTER FORM</Text>

      <View style={styles.formBox}>
        <Text style={styles.label}>NAME</Text>
        <TextInput
          style={styles.input}
          value={form.name}
          onChangeText={(t) => setForm({ ...form, name: t })}
        />

        <Text style={styles.label}>UNIQUE ID</Text>
        <TextInput
          style={styles.input}
          value={form.uid}
          onChangeText={(t) => setForm({ ...form, uid: t })}
        />

        <Text style={styles.label}>PASSWORD</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={form.password}
          onChangeText={(t) => setForm({ ...form, password: t })}
        />

        <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
          <Text style={styles.registerText}>REGISTER</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 80,   // 👈 NOT center, NOT top corner
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A3F",
    marginBottom: 30,
    textAlign: "center",
  },

  formBox: {
    width: "100%",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A3F",
    marginBottom: 5,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
  },

  registerBtn: {
    backgroundColor: "#4B3CCD",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },

  registerText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
