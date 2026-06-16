import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getPaymentDetail,
  subscribePaymentDetail,
} from "../../src/controllers/paymentHistoryController";

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} selectable>
        {value}
      </Text>
    </View>
  );
}

export default function PaymentDetailScreen({ navigation, route }) {
  const initial = route.params?.payment;
  const paymentId = route.params?.paymentId || initial?.id;

  const [payment, setPayment] = useState(initial || null);
  const [loading, setLoading] = useState(!initial);

  useEffect(() => {
    if (!paymentId) return undefined;

    const unsubscribe = subscribePaymentDetail(
      paymentId,
      (live) => {
        if (live) setPayment(live);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsubscribe();
  }, [paymentId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#5E60CE" />
      </View>
    );
  }

  if (!payment) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Payment not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isSuccess = payment.status === "success";
  const statusColor = isSuccess
    ? "#2E7D32"
    : payment.status === "failed"
      ? "#C62828"
      : "#F57C00";

  const headerTitle = isSuccess ? "Paid" : payment.statusLabel;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBlock}>
          <View
            style={[
              styles.statusCircle,
              { backgroundColor: isSuccess ? "#E8F5E9" : "#FFF3E0" },
            ]}
          >
            <Ionicons
              name={isSuccess ? "checkmark-circle" : "alert-circle"}
              size={36}
              color={statusColor}
            />
          </View>
          <View style={styles.topText}>
            <Text style={styles.paidAmount}>
              {headerTitle} ₹ {payment.amount}
            </Text>
            <Text style={styles.paidDate}>{payment.paidAtDetail}</Text>
          </View>
          <Ionicons name="chevron-down" size={20} color="#999" />
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsBlock}>
          <DetailRow label="Transaction ID" value={payment.transactionId} />
          <DetailRow label="Payment ID" value={payment.paymentId} />
          <DetailRow label="Payment method" value={payment.paymentMethod} />
          <DetailRow label="Payment type" value={payment.paymentType} />
          <DetailRow label="Status" value={payment.statusLabel} />
          <DetailRow label="Bus pass / Document ID" value={payment.docPassId} />
          <DetailRow label="Amount" value={`₹ ${payment.amount}`} />
        </View>

        <Text style={styles.note}>
          Payments may take up to 3 working days to be reflected in your account.
          Check your bank statement for the latest status of your transaction.
        </Text>

        <Text style={styles.learnMore}>Learn more</Text>

        <View style={styles.brandRow}>
          <Ionicons name="bus" size={22} color="#5E60CE" />
          <Text style={styles.brandText}>Bus Tracking</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  topBlock: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  statusCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  topText: { flex: 1, marginLeft: 14 },
  paidAmount: { fontSize: 20, fontWeight: "700", color: "#111" },
  paidDate: { fontSize: 14, color: "#666", marginTop: 4 },
  divider: { height: 1, backgroundColor: "#E8E8E8", marginVertical: 8 },
  detailsBlock: { paddingTop: 8 },
  detailRow: { paddingVertical: 14 },
  detailLabel: { fontSize: 13, color: "#888", marginBottom: 6 },
  detailValue: { fontSize: 17, color: "#111", fontWeight: "500" },
  note: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 28,
    paddingHorizontal: 8,
  },
  learnMore: {
    textAlign: "center",
    color: "#1A73E8",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },
  brandText: {
    fontSize: 15,
    color: "#5E60CE",
    fontWeight: "700",
    marginLeft: 8,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFound: { fontSize: 16, color: "#666" },
  backLink: { color: "#5E60CE", marginTop: 14, fontWeight: "600" },
});
