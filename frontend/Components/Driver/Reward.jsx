// Components/Driver/Reward.jsx

import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { handleFetchRewards } from "../../src/controllers/RewardController";

export default function RewardProgressPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const driverUniqueId = route?.params?.driverUniqueId;

  const [sessions, setSessions] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [earnedIncentive, setEarnedIncentive] = useState(0);
  const [pointsToNext, setPointsToNext] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!driverUniqueId) return;

    const loadRewards = async () => {
      setLoading(true);
      const result = await handleFetchRewards(driverUniqueId);
      if (result.success) {
        setSessions(result.sessions);
        setTotalPoints(result.totalPoints);
        setEarnedIncentive(result.earnedIncentive);
        setPointsToNext(result.pointsToNextIncentive);
      }
      setLoading(false);
    };

    loadRewards();
  }, [driverUniqueId]);

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("DriverDashboard", {
          driverUniqueId,
        })}>
          <Ionicons name="arrow-back-outline" size={30} color="#301ad4" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>REWARD PROGRESS</Text>
      </View>

      {/* Points Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: "#EEF0FF" }]}>
          <Text style={styles.summaryLabel}>Total Points</Text>
          <Text style={[styles.summaryValue, { color: "#301ad4" }]}>
            {totalPoints}
          </Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: "#FFF3E0" }]}>
          <Text style={styles.summaryLabel}>Incentive Earned</Text>
          <Text style={[styles.summaryValue, { color: "#FF8C00" }]}>
            ₹{earnedIncentive}
          </Text>
        </View>
      </View>

      {/* Progress bar to next incentive */}
      {pointsToNext > 0 && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>
            {pointsToNext} more points to earn ₹500 incentive
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, (totalPoints / 500) * 100)}%` },
              ]}
            />
          </View>
        </View>
      )}

      {/* Sessions Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>GPS Sessions</Text>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>Date</Text>
          <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Duration</Text>
          <Text style={[styles.tableHeaderText, { flex: 0.8, textAlign: "right" }]}>Points</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#301ad4" style={{ marginTop: 30 }} />
        ) : sessions.length === 0 ? (
          <Text style={styles.emptyText}>No sessions yet. Turn on GPS to earn points!</Text>
        ) : (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {sessions.map((item, index) => (
              <View key={index} style={styles.sessionRow}>
                <Text style={[styles.sessionText, { flex: 1.2 }]}>{item.date}</Text>
                <Text style={[styles.sessionText, { flex: 1.5 }]}>{item.duration}</Text>
                <Text style={[styles.pointsText, { flex: 0.8, textAlign: "right" }]}>
                  +{item.points}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Total row */}
        {!loading && sessions.length > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL EARNED POINTS:</Text>
            <Text style={styles.totalValue}>+{totalPoints}</Text>
          </View>
        )}
      </View>

      {/* Incentive Banner */}
      {earnedIncentive > 0 && (
        <View style={styles.incentiveBanner}>
          <Text style={styles.incentiveText}>
            🎉 CONGRATULATIONS! YOU EARNED AN INCENTIVE OF ₹{earnedIncentive} THIS MONTH
          </Text>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA", padding: 20 },
  header: {
    flexDirection: "row", alignItems: "center", marginTop: 40, marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22, fontWeight: "800", color: "#301ad4", marginLeft: 10,
  },
  summaryRow: {
    flexDirection: "row", justifyContent: "space-between", marginBottom: 16,
  },
  summaryCard: {
    flex: 1, borderRadius: 16, padding: 16, marginHorizontal: 4,
    alignItems: "center", elevation: 3,
  },
  summaryLabel: { fontSize: 12, color: "#666", fontWeight: "600", marginBottom: 6 },
  summaryValue: { fontSize: 28, fontWeight: "800" },
  progressContainer: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14,
    marginBottom: 16, elevation: 2,
  },
  progressLabel: { fontSize: 13, color: "#555", marginBottom: 8, fontWeight: "600" },
  progressBar: {
    height: 10, backgroundColor: "#E0E0E0", borderRadius: 5, overflow: "hidden",
  },
  progressFill: {
    height: "100%", backgroundColor: "#301ad4", borderRadius: 5,
  },
  card: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16,
    elevation: 4, flex: 1, marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#1A1A3F", marginBottom: 12 },
  tableHeader: {
    flexDirection: "row", paddingBottom: 8,
    borderBottomWidth: 2, borderBottomColor: "#EEF0FF", marginBottom: 4,
  },
  tableHeaderText: { fontSize: 13, fontWeight: "700", color: "#301ad4" },
  sessionRow: {
    flexDirection: "row", paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: "#F0F0F0",
  },
  sessionText: { fontSize: 13, color: "#444" },
  pointsText: { fontSize: 13, color: "#2ECC71", fontWeight: "700" },
  emptyText: {
    textAlign: "center", color: "#999", marginTop: 30,
    fontSize: 14, lineHeight: 22,
  },
  totalRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingTop: 12, borderTopWidth: 2, borderTopColor: "#EEF0FF", marginTop: 4,
  },
  totalLabel: { fontSize: 13, fontWeight: "700", color: "#1A1A3F" },
  totalValue: { fontSize: 14, fontWeight: "800", color: "#2ECC71" },
  incentiveBanner: {
    backgroundColor: "#FFF3E0", borderRadius: 12, padding: 14,
    borderLeftWidth: 4, borderLeftColor: "#FF8C00",
  },
  incentiveText: {
    color: "#FF8C00", fontSize: 13, fontWeight: "700", textAlign: "center", lineHeight: 20,
  },
});