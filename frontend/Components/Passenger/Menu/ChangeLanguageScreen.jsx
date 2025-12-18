import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

/* ========= TRANSLATIONS ========= */
const translations = {
  en: {
    title: "Language",
    search: "Search",
  },
  ta: {
    title: "மொழி",
    search: "தேடல்",
  },
  te: {
    title: "భాష",
    search: "వెతకండి",
  },
  ml: {
    title: "ഭാഷ",
    search: "തിരയുക",
  },
  kn: {
    title: "ಭಾಷೆ",
    search: "ಹುಡುಕು",
  },
  hi: {
    title: "भाषा",
    search: "खोजें",
  },
  mr: {
    title: "भाषा",
    search: "शोधा",
  },
};

/* ========= LANGUAGE LIST ========= */
const languageList = [
  { key: "en", label: "English" },
  { key: "ta", label: "தமிழ்" },
  { key: "te", label: "తెలుగు" },
  { key: "ml", label: "മലയാളം" },
  { key: "kn", label: "ಕನ್ನಡ" },
  { key: "hi", label: "हिंदी" },
  { key: "mr", label: "मराठी" },
];

export default function ChangeLanguageScreen({ navigation }) {
  const [selectedLang, setSelectedLang] = useState("en");
  const [searchText, setSearchText] = useState("");

  const currentLang = translations[selectedLang];

  const filteredLanguages = languageList.filter((item) =>
    item.label.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Ionicons
          name="arrow-back"
          size={26}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerText}>{currentLang.title}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="gray" />
        <TextInput
          placeholder={currentLang.search}
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
      </View>

      {/* Language List */}
      <View style={styles.listCard}>
        <FlatList
          data={filteredLanguages}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.languageRow}
              onPress={() => setSelectedLang(item.key)}
            >
              <Text
                style={[
                  styles.languageText,
                  selectedLang === item.key && styles.selectedText,
                ]}
              >
                {item.label}
              </Text>

              {selectedLang === item.key && (
                <Ionicons name="checkmark" size={22} />
              )}
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

/* ========= STYLES ========= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFEFEF",
    padding: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  listCard: {
    backgroundColor: "#FFFFFF",
    marginTop: 25,
    borderRadius: 18,
  },
  languageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  languageText: {
    fontSize: 17,
  },
  selectedText: {
    fontWeight: "700",
  },
});
