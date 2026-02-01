import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from "@react-navigation/native";


export default function  DashBoard() {
   const navigation = useNavigation();
  const buttons = [
    { title: "Track bus", icon: "bus", color: "#5E60CE" },
    { title: "Find bus route", icon: "map", color: "#5E60CE" },
    { title: "Bus pass", icon: "clipboard-list", color: "#5E60CE" },
    { title: "Bus stop near me", icon: "stop", color: "#5E60CE" },
    { title: "Feedback & Rating", icon: "headset", color: "#5E60CE" },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
  {/* Back Arrow */}
  <TouchableOpacity onPress={() => navigation.navigate("Landing")}>
    <Ionicons name="arrow-back" size={26} color="#000" />
  </TouchableOpacity>

  {/* Title */}
  <Text style={styles.headerTitle}>Where is my bus?</Text>

  {/* Menu Button */}
  <TouchableOpacity onPress={() => console.log("Menu clicked")}>
    <Ionicons name="menu" size={28} color="#000" />
  </TouchableOpacity>
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
    padding: 20,
    paddingTop: 80,
    
    backgroundColor: "#f9f9f9",
    flexGrow: 1,
    
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginVertical: 20,
    paddingBottom :40
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
  headerContainer: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 40,
},

headerTitle: {
  fontSize: 22,
  fontWeight: "700",
},

});