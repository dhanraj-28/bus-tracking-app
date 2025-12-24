import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";

import { LanguageContext, translations } from "../../../context/LanguageContext";

export default function MenuScreen({ navigation }) {
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.headerRow}>
        <Ionicons
          name="arrow-back"
          size={26}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerText}>{t.menu}</Text>
      </View>

      {/* Profile */}
      <View style={styles.profileCard}>
        <FontAwesome5 name="user" size={22} />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.profileName}>Harini B</Text>
          <Text style={styles.profileNumber}>9677659119</Text>
        </View>
      </View>

      {/* Menu Options */}
      <View style={styles.optionsCard}>

        <MenuItem
          icon={<MaterialIcons name="language" size={22} />}
          label={t.changeLanguage}
          onPress={() => navigation.navigate("ChangeLanguageScreen")}
        />

        <MenuItem
          icon={<FontAwesome5 name="exclamation-circle" size={22} />}
          label={t.sos}
        />

        <MenuItem
          icon={<Ionicons name="notifications-outline" size={22} />}
          label={t.notification}
        />

        <MenuItem
          icon={<FontAwesome5 name="paypal" size={22} />}
          label={t.payments}
        />

        <MenuItem
          icon={<Ionicons name="log-out-outline" size={22} />}
          label={t.logout}
          onPress={() => navigation.navigate("LogoutScreen")}
        />

      </View>
    </View>
  );
}

/* ===== MENU ITEM COMPONENT ===== */
const MenuItem = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    {icon}
    <Text style={styles.menuLabel}>{label}</Text>
  </TouchableOpacity>
);

/* ===== STYLES (THIS WAS MISSING / BROKEN) ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
    padding: 20,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  headerText: {
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 10,
  },

  profileCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 20,
    marginTop: 25,
    borderRadius: 20,
    alignItems: "center",
    elevation: 4,
  },

  profileName: {
    fontSize: 18,
    fontWeight: "600",
  },

  profileNumber: {
    fontSize: 14,
    color: "gray",
    marginTop: 3,
  },

  optionsCard: {
    backgroundColor: "#fff",
    marginTop: 25,
    borderRadius: 20,
    elevation: 4,
    overflow: "hidden",
  },

  menuItem: {
    flexDirection: "row",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    alignItems: "center",
  },

  menuLabel: {
    fontSize: 16,
    marginLeft: 15,
    fontWeight: "500",
  },
});
