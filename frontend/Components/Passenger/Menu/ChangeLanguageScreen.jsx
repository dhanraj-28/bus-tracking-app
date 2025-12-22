import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { LanguageContext, translations } from "../../../context/LanguageContext";

export default function ChangeLanguageScreen({ navigation }) {
  const { language, setLanguage } = useContext(LanguageContext);
  const [searchText, setSearchText] = useState("");

  const t = translations[language];

  const languages = [
    { key: "en", label: "English" },
    { key: "ta", label: "தமிழ் (Tamil)" },
    { key: "te", label: "తెలుగు (Telugu)" },
    { key: "hi", label: "हिंदी (Hindi)" },
    { key: "kn", label: "ಕನ್ನಡ (Kannada)" },
    { key: "ml", label: "മലയാളം (Malayalam)" },
    { key: "bn", label: "বাংলা (Bengali)" },
    { key: "mr", label: "मराठी (Marathi)" },
    { key: "ur", label: "اردو (Urdu)" },
    { key: "fr", label: "Français (French)" },
    { key: "es", label: "Español (Spanish)" },
  ];

  const filteredLanguages = languages.filter((item) =>
    item.label.toLowerCase().includes(searchText.toLowerCase())
  );

  /* 🔍 SEARCH HEADER */
  const SearchHeader = () => (
    <View>
      <Text style={styles.title}>{t.languageTitle}</Text>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#777" />
        <TextInput
          style={styles.searchInput}
          placeholder={t.search}
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredLanguages}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={SearchHeader}   // ✅ IMPORTANT
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.languageItem}
            onPress={() => {
              setLanguage(item.key);
              navigation.goBack();
            }}
          >
            <Text style={styles.languageText}>{item.label}</Text>

            {language === item.key && (
              <Ionicons name="checkmark" size={22} color="green" />
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingLeft: 8,
    fontSize: 15,
  },

  languageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },

  languageText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
