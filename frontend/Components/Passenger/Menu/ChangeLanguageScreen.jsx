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

export default function ChangeLanguageScreen({ navigation }) {
  const [selectedLanguage, setSelectedLanguage] = useState("English (UK)");
  const [searchText, setSearchText] = useState("");

  const languages = [
    "English (UK)",
    "United States",
    "Tamil",
    "Telugu",
    "Malayalam",
    "Kannada",
    "Hindi",
    "Marathi",
  ];

  const filteredLanguages = languages.filter((lang) =>
    lang.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.headerRow}>
        <Ionicons
          name="arrow-back"
          size={28}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerText}>Language</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
        <TextInput
          placeholder="Search"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
      </View>

      {/* Language list */}
      <View style={styles.listCard}>
        <FlatList
          data={filteredLanguages}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.languageRow}
              onPress={() => setSelectedLanguage(item)}
            >
              <Text style={styles.languageText}>{item}</Text>

              {selectedLanguage === item && (
                <Ionicons name="checkmark" size={22} />
              )}
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

/* ========== Styles ========== */
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
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
  },

  searchIcon: {
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
  },

  listCard: {
    backgroundColor: "#FAFAF8",
    marginTop: 25,
    borderRadius: 18,
    elevation: 2,
  },

  languageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },

  languageText: {
    fontSize: 17,
  },
});
