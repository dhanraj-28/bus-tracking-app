import React from "react";
import { View, Text, ScrollView, TouchableOpacity, BackHandler } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function RewardProgressPage() {
  
  const driverName = "Driver Name";
  const isOnline = true;

  const gpsSessions = Array(20).fill({
    date: "20/08/2025",
    duration: "00:12:45",
    points: 60,
  });

  const totalPoints = gpsSessions.reduce((a, b) => a + b.points, 0);
  const incentive = 500;

  // Back button action without navigation
  const handleBack = () => {
    BackHandler.exitApp();         // CLOSES SCREEN / APP
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 20 }}>

      {/* Header with Back Icon (No navigation) */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 40,
        }}
      >
        <TouchableOpacity
          onPress={handleBack}
          style={{ paddingRight: 0 }}
        >
          <Ionicons name="arrow-back-outline" size={30} color="#301ad4" />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: "#301ad4",
            marginLeft: 10,
          }}
        >
          REWARD PROGRESS
        </Text>
      </View>

      {/* Driver Name + Online Status */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 40,
        }}
      >
        <Text style={{ fontSize: 23, fontWeight: "600" }}>{driverName}</Text>

        <View
          style={{
            marginLeft: 170,
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: isOnline ? "#32CD32" : "#B0B0B0",
          }}
        />

        <Text
          style={{
            marginLeft: 4,
            color: isOnline ? "#32CD32" : "#B0B0B0",
            fontWeight: "600",
          }}
        >
          {isOnline ? "ONLINE" : "OFFLINE"}
        </Text>
      </View>

      {/* Card with internal scroll */}
      <View
        style={{
          marginTop: 40,
          backgroundColor: "#fff",
          borderRadius: 12,
          padding: 20,
          elevation: 8,
          height: 620,
        }}
      >
        <Text style={{ fontWeight: "700", marginBottom: 8 }}>Earned points:</Text>

        <View style={{ flexDirection: "row", marginBottom: 10 }}>
          <Text style={{ flex: 1, fontWeight: "600" }}>Gps turned on date:</Text>
          <Text style={{ flex: 1, fontWeight: "600" }}>Total Time & points earned:</Text>
        </View>

        <ScrollView style={{ flex: 1 }}>
          {gpsSessions.map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: "#E0E0E0",
              }}
            >
              <Text style={{ flex: 1 }}>{item.date}</Text>

              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text>{item.duration}</Text>
                <Text style={{ color: "#32CD32", fontWeight: "700" }}>
                  +{item.points}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Total Points */}
        <View
          style={{
            flexDirection: "row",
            paddingVertical: 15,
            borderTopWidth: 1,
            borderTopColor: "#E0E0E0",
          }}
        >
          <Text style={{ flex: 1, fontWeight: "700" }}>TOTAL EARNED POINTS:</Text>
          <Text style={{ color: "#32CD32", fontWeight: "700" }}>+{totalPoints}</Text>
        </View>
      </View>

      {/* Incentive text */}
      <Text
        style={{
          marginTop: 20,
          color: "#FF8C00",
          fontSize: 16,
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        CONGRATULATIONS YOU EARNED AN INCENTIVE OF {incentive} RS THIS MONTH
      </Text>
    </View>
  );
}
