// ============================================================
//  PassSuccessScreen.jsx  —  Payment Success + Pass Summary
//  Shown after successful payment.
//  Fetches the complete pass document from Firestore and
//  displays all pass details in a clean card layout.
//
//  Receives: route.params.docPassId  (from PaymentScreen onSuccess)
// ============================================================

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../src/config/firebase";

export default function PassSuccessScreen() {
  const navigation = useNavigation();
  const route      = useRoute();
  const { docPassId } = route.params;

  const [passData, setPassData] = useState(null);
  const [loading, setLoading]   = useState(true);

  // ── Fetch pass document from Firestore ───────────────────────
  useEffect(() => {
    const fetchPass = async () => {
      try {
        const passSnap = await getDoc(doc(db, "passes", docPassId));
        if (passSnap.exists()) {
          setPassData(passSnap.data());
        } else {
          Alert.alert("Error", "Pass details not found.");
        }
      } catch (e) {
        Alert.alert("Error", "Could not load pass details.");
      } finally {
        setLoading(false);
      }
    };
    fetchPass();
  }, [docPassId]);

  // ── Format Firestore Timestamp → readable date string ────────
  const formatDate = (timestamp) => {
    if (!timestamp) return "—";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      day:   "2-digit",
      month: "short",
      year:  "numeric",
    }); // e.g. "25 May 2026"
  };

  // ── Loading state ─────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading your pass...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Success Banner ── */}
      <View style={styles.successBanner}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={40} color="#fff" />
        </View>
        <Text style={styles.successTitle}>Payment Successful!</Text>
        <Text style={styles.successSubtitle}>
          Your bus pass has been applied.{"\n"}You will receive it soon.
        </Text>
        <View style={styles.amountBadge}>
          <Text style={styles.amountBadgeText}>₹{passData?.amount} Paid</Text>
        </View>
      </View>

      {/* ── Pass Reference ── */}
      <View style={styles.referenceBox}>
        <Text style={styles.referenceLabel}>Pass Reference ID</Text>
        <Text style={styles.referenceValue} numberOfLines={1} ellipsizeMode="middle">
          {docPassId}
        </Text>
      </View>

      {/* ── Pass Details Card ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pass Details</Text>

        <DetailRow icon="person"        label="Name"        value={passData?.name} />
        <DetailRow icon="badge"         label="Pass Type"   value={passData?.passType} />
        <DetailRow icon="schedule"      label="Duration"    value={passData?.timePeriod} />
        <DetailRow icon="today"         label="Start Date"  value={formatDate(passData?.fromDate)} />
        <DetailRow icon="event"         label="Valid Till"  value={formatDate(passData?.expiryDate)} />
        <DetailRow icon="payments"      label="Amount Paid" value={`₹${passData?.amount}`} />

        {/* Status badge */}
        <View style={styles.statusRow}>
          <MaterialIcons name="info" size={18} color="#6B7280" />
          <Text style={styles.statusLabel}>Status</Text>
          <View style={[
            styles.statusBadge,
            passData?.status === "approved"
              ? styles.statusApproved
              : styles.statusPending,
          ]}>
            <Text style={styles.statusBadgeText}>
              {passData?.status === "approved" ? "✅ Approved" : "⏳ Pending"}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Personal Info Card ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Personal Information</Text>
        <DetailRow icon="phone"    label="Mobile"  value={passData?.mobileNo} />
        <DetailRow icon="email"    label="Email"   value={passData?.email} />
        <DetailRow icon="wc"       label="Gender"  value={passData?.gender} />
        <DetailRow icon="cake"     label="DOB"     value={formatDate(passData?.dob)} />
      </View>

      {/* ── Payment Info Card ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Payment Information</Text>
        <DetailRow icon="receipt"       label="Payment ID"  value={passData?.paymentId || "—"} />
        <DetailRow icon="calendar-today" label="Paid On"   value={formatDate(passData?.paidAt)} />
        <DetailRow icon="payment"       label="Method"      value={passData?.paymentMethod || "—"} />
      </View>

      {/* ── Action Buttons ── */}
      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigation.navigate("Dashboard")}
      >
        <Text style={styles.homeButtonText}>Go to Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.viewPassesButton}
        onPress={() => navigation.navigate("MyPasses")}
        // ── Create a MyPasses screen later to list all user passes
      >
        <Text style={styles.viewPassesText}>View My Passes</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

// ── Reusable row component used inside cards ──────────────────
const DetailRow = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <MaterialIcons name={icon} size={18} color="#6B7280" style={styles.detailIcon} />
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">
      {value || "—"}
    </Text>
  </View>
);

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: "#F4F4F6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F4F6",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },

  // ── Success banner ──
  successBanner: {
    backgroundColor: "#4F46E5",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    marginBottom: 16,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 13,
    color: "#C7D2FE",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  amountBadge: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  amountBadgeText: {
    color: "#4F46E5",
    fontWeight: "800",
    fontSize: 16,
  },

  // ── Reference box ──
  referenceBox: {
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
  referenceLabel: {
    fontSize: 11,
    color: "#92400E",
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  referenceValue: {
    fontSize: 13,
    color: "#78350F",
    fontWeight: "500",
  },

  // ── Info cards ──
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 8,
  },

  // ── Detail rows inside cards ──
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  detailIcon: {
    marginRight: 10,
    width: 22,
  },
  detailLabel: {
    flex: 1,
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  detailValue: {
    flex: 2,
    fontSize: 13,
    color: "#111827",
    fontWeight: "600",
    textAlign: "right",
  },

  // ── Status badge ──
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  statusLabel: {
    flex: 1,
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
    marginLeft: 10,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusApproved: {
    backgroundColor: "#DCFCE7",
  },
  statusPending: {
    backgroundColor: "#FEF9C3",
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },

  // ── Buttons ──
  homeButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginBottom: 10,
  },
  homeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  viewPassesButton: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#4F46E5",
    marginBottom: 20,
  },
  viewPassesText: {
    color: "#4F46E5",
    fontSize: 16,
    fontWeight: "700",
  },
});
