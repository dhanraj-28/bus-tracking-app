import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function  DashBoard() {
  const buttons = [
    { title: "Track bus", icon: "bus", color: "#5E60CE" },
    { title: "Find bus route", icon: "map", color: "#5E60CE" },
    { title: "Bus pass", icon: "clipboard-list", color: "#5E60CE" },
    { title: "Bus stop near me", icon: "location-arrow", color: "#5E60CE" },
    { title: "Feedback & Rating", icon: "headset", color: "#5E60CE" },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
     <View style={styles.headerRow}>
        <TouchableOpacity>
          <FontAwesome5 name="bars" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.header}>Where is my bus?</Text>
      </View>

      <View style={styles.grid}>
        {buttons.map((btn, index) => (
          <TouchableOpacity key={index} style={styles.card} activeOpacity={0.8}>
            {/* You can customize icons as per need */}
            <FontAwesome5 name={btn.icon} size={30} color="white" />
     
            <Text style={styles.label}>{btn.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 60,
    paddingTop: 40,
    
    backgroundColor: "#f9f9f9",
    flexGrow: 1,
    
  },
  headerRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: 15,
  marginBottom: 30,
},

header: {
  fontSize: 22,
  fontWeight: "700",
  lineHeight: 26, // keeps text vertically centered
  marginLeft: -5 , // more left
  marginRight: 8


},

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 30,
    
  },
  card: {
    width: 140,
    height: 140,
    borderRadius: 25,
    backgroundColor: "#5E60CE",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  label: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
  },
});