import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { LanguageContext, translations } from "../../../context/LanguageContext";

export default function LogoutScreen({ navigation }) {
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  const handleLogout = () => {
    Alert.alert(
      t.loggedOut,
      t.loggedOutMsg,
      [
        {
          text: "OK",
          onPress: () => navigation.replace("Menu"),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.logoutConfirm}</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>{t.logoutBtn}</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ✅ STYLES — THIS WAS MISSING */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 30,
    textAlign: "center",
  },

  button: {
    backgroundColor: "#E53935",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
