import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  // Simulating API notification fetch
  useEffect(() => {
    const data = [
      {
        id: 1,
        title: "Bus Arriving in 20 minutes",
        message:
          "The bus for your journey from Mandi Gobindgarh to Rajpura will arrive in 20 minutes; you will be notified when it arrives.",
        button: "Check",
        icon: "bus-outline",
      },
      {
        id: 2,
        title: "Bus pass expiring in 3 days",
        message:
          "Your monthly bus pass for your daily journey from Mandi Gobindgarh to Rajpura will expire in 3 days; click Renew now to renew your pass.",
        button: "Renew",
        icon: "card-outline",
      },
      {
        id: 3,
        title: "Reward received",
        message:
          "Congratulations, you have received a reward for purchasing a digital ticket for your journey; open to claim your reward.",
        button: "Open",
        icon: "ribbon-outline",
      },
    ];
    setNotifications(data);
  }, []);

  // Action on each button
  const handleAction = (id) => {
    setNotifications(notifications.filter((item) => item.id !== id));
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffffff", paddingTop: 50 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          marginBottom: 10,
        }}
      >
        <Ionicons name="arrow-back" size={26} />
        <Text
          style={{
            fontSize: 22,
            fontWeight: "700",
            marginLeft: 20,
          }}
        >
          NOTIFICATIONS
        </Text>
      </View>

      {/* Notification List */}
      <ScrollView style={{ paddingHorizontal: 15 }}>
        {notifications.map((item) => (
          <View
            key={item.id}
            style={{
              backgroundColor: "#d3cae7ff",
              borderRadius: 12,
              padding: 15,
              marginBottom: 15,
              borderWidth: 1,
              borderColor: "#eee",
            }}
          >
            {/* Title Row */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name={item.icon} size={22} style={{ marginRight: 10 }} />
              <Text style={{ fontSize: 17, fontWeight: "600" }}>
                {item.title}
              </Text>
            </View>

            {/* Description */}
            <Text
              style={{
                fontSize: 14,
                marginTop: 8,
                color: "#555",
              }}
            >
              {item.message}
            </Text>

            {/* Button */}
            <TouchableOpacity
              onPress={() => handleAction(item.id)}
              style={{
                alignSelf: "flex-end",
                backgroundColor: "#7C77F7",
                paddingVertical: 8,
                paddingHorizontal: 22,
                borderRadius: 8,
                marginTop: 12,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
                {item.button}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
