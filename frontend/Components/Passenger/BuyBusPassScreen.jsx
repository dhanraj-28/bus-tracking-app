// ============================================================
//  BuyBusPassScreen.jsx  —  Stage 6: Pass Details
//  CHANGES FROM PREVIOUS VERSION:
//   1. Added PRICING_MATRIX — 2D lookup [timePeriod][passType] → amount
//   2. timeOptions now shows dynamic price based on selected passType
//   3. Amount is displayed next to each time period option (live update)
//   4. Amount displayed below selected pass type card
//   5. handleNext() now passes `amount` to controller
//   Everything else (UI, styles, date picker, radio logic) is UNCHANGED.
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { handlePassDetailsNext } from "../../src/controllers/busPassController";

// ─────────────────────────────────────────────
//  PRICING MATRIX
//  PRICING_MATRIX[timePeriodKey][passType] = amount in rupees (number)
//  timePeriodKey: "1 DAY" | "1 MONTH" | "3 MONTH" | "6 MONTH" | "1 YEAR"
//  passType:      "General Pass" | "Student" | "Senior Citizen" | "Disabled"
// ─────────────────────────────────────────────
const PRICING_MATRIX = {
  "1 DAY": {
    "General Pass":   40,
    "Student":        25,
    "Senior Citizen": 20,
    "Disabled":       15,
  },
  "1 MONTH": {
    "General Pass":   120,
    "Student":        80,
    "Senior Citizen": 60,
    "Disabled":       45,
  },
  "3 MONTH": {
    "General Pass":   360,
    "Student":        220,
    "Senior Citizen": 160,
    "Disabled":       120,
  },
  "6 MONTH": {
    "General Pass":   720,
    "Student":        400,
    "Senior Citizen": 300,
    "Disabled":       220,
  },
  "1 YEAR": {
    "General Pass":   1440,
    "Student":        750,
    "Senior Citizen": 550,
    "Disabled":       400,
  },
};

// Period keys in order (used for radio rendering)
const TIME_PERIOD_KEYS = ["1 DAY", "1 MONTH", "3 MONTH", "6 MONTH", "1 YEAR"];
const PASS_OPTIONS = ["General Pass", "Student", "Senior Citizen", "Disabled"];

const BuyBusPassScreen = () => {
  const navigation = useNavigation();
  const [timePeriod, setTimePeriod] = useState("1 DAY");
  const [passType, setPassType]     = useState("General Pass");
  const [startDate, setStartDate]   = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading]       = useState(false);

  // ── Derive current amount from selected period + pass type ──
  const currentAmount = PRICING_MATRIX[timePeriod][passType];

  // ── Valid Till Date — UNCHANGED logic ───────────────────────
  const validTillDate = useMemo(() => {
    const base = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    switch (timePeriod) {
      case "1 DAY":   base.setDate(base.getDate() + 1);         break;
      case "1 MONTH": base.setMonth(base.getMonth() + 1);       break;
      case "3 MONTH": base.setMonth(base.getMonth() + 3);       break;
      case "6 MONTH": base.setMonth(base.getMonth() + 6);       break;
      case "1 YEAR":  base.setFullYear(base.getFullYear() + 1); break;
    }
    return base;
  }, [startDate, timePeriod]);

  const formatDate = (date) => date.toLocaleDateString("en-GB");

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (event?.type === "dismissed") return;
    if (selectedDate) setStartDate(selectedDate);
  };

  // ── Normalize timePeriod key → controller format ─────────────
  // "1 DAY" → "1 Day" | "3 MONTH" → "3 Month" | "1 YEAR" → "1 Year"
  const normalizeTimePeriod = (key) => {
    const parts = key.split(" ");
    const num  = parts[0];
    const unit = parts[1].charAt(0) + parts[1].slice(1).toLowerCase();
    return `${num} ${unit}`;
  };

  // ── NEXT button handler ───────────────────────────────────────
  const handleNext = async () => {
    setLoading(true);
    await handlePassDetailsNext(
      {
        timePeriod: normalizeTimePeriod(timePeriod), // "1 Day", "3 Month" etc.
        passType,                                     // "General Pass", "Student" etc.
        fromDate: startDate,                          // JS Date object
        amount: currentAmount,                        // ← NEW: number e.g. 120
      },
      {
        onSuccess: () => {
          setLoading(false);
          navigation.navigate("IdentityVerification");
        },
        onError: (msg) => {
          setLoading(false);
          Alert.alert("Error", msg);
        },
      }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>

        {/* Header — UNCHANGED */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={26} color="#000" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Buy Bus Pass</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* ── Time Period (with dynamic prices) ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SELECT TIME PERIOD</Text>
          {TIME_PERIOD_KEYS.map((key) => {
            const price = PRICING_MATRIX[key][passType]; // price changes with passType
            return (
              <Pressable
                key={key}
                style={styles.radioRow}
                onPress={() => setTimePeriod(key)}
              >
                <View style={styles.radioOuter}>
                  {timePeriod === key && <View style={styles.radioInner} />}
                </View>
                {/* Period label on the left, dynamic price on the right */}
                <View style={styles.periodLabelRow}>
                  <Text style={styles.radioText}>{key}</Text>
                  <Text style={[
                    styles.priceText,
                    timePeriod === key && styles.priceTextSelected,
                  ]}>
                    ₹{price}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* ── Start Date — UNCHANGED ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SELECT START DATE</Text>
          {Platform.OS === "web" ? (
            <input
              type="date"
              value={startDate.toISOString().split("T")[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              style={styles.webDate}
            />
          ) : (
            <>
              <View style={styles.dateRow}>
                <Text style={styles.dateText}>{formatDate(startDate)}</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <MaterialIcons name="date-range" size={26} color="#4F46E5" />
                </TouchableOpacity>
              </View>
              {showDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display={Platform.OS === "android" ? "calendar" : "spinner"}
                  onChange={onDateChange}
                  minimumDate={new Date()}
                />
              )}
            </>
          )}
          <Text style={styles.validText}>VALID TILL:</Text>
          <Text style={styles.validDate}>{formatDate(validTillDate)}</Text>
        </View>

        {/* ── Pass Type (with amount badge on selected card) ── */}
        <Text style={styles.sectionTitle}>Select Pass</Text>
        {PASS_OPTIONS.map((item) => (
          <Pressable
            key={item}
            style={[styles.passCard, passType === item && styles.passCardSelected]}
            onPress={() => setPassType(item)}
          >
            <View style={styles.radioOuter}>
              {passType === item && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.passText}>{item}</Text>
            {/* Show the amount for this pass type at selected time period */}
            <Text style={[
              styles.passAmountText,
              passType === item && styles.passAmountTextSelected,
            ]}>
              ₹{PRICING_MATRIX[timePeriod][item]}
            </Text>
          </Pressable>
        ))}

        {/* ── Amount Summary Banner ── */}
        <View style={styles.amountBanner}>
          <Text style={styles.amountBannerLabel}>Total Amount Payable</Text>
          <Text style={styles.amountBannerValue}>₹{currentAmount}</Text>
        </View>

        {/* ── NEXT button ── */}
        <TouchableOpacity
          style={[styles.nextButton, loading && { opacity: 0.7 }]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextText}>NEXT</Text>
          )}
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
};

export default BuyBusPassScreen;

// ── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── UNCHANGED styles ────────────────────────────────────────
  container: {
    flexGrow: 1,
    backgroundColor: "#F4F4F4",
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 10,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4F46E5",
  },
  webDate: {
    padding: 8,
    fontSize: 14,
    borderRadius: 6,
    border: "1px solid #ccc",
    width: "60%",
  },
  validText: { fontSize: 11, marginTop: 6 },
  validDate: { color: "red", fontSize: 12 },
  sectionTitle: { fontWeight: "600", marginBottom: 8 },
  passCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  passText: { flex: 1, marginLeft: 10, fontSize: 14 },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 46,
    borderRadius: 6,
    width: "60%",
    backgroundColor: "#fff",
  },
  dateText: { fontSize: 14, color: "#000" },
  nextButton: {
    backgroundColor: "#4F46E5",
    padding: 14,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 10,
  },
  nextText: { color: "#fff", fontWeight: "600" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    marginBottom: 16,
  },
  headerLeft:   { width: 40, justifyContent: "center", alignItems: "flex-start" },
  headerCenter: { flex: 1, alignItems: "center" },
  headerRight:  { width: 40 },
  headerTitle:  { fontSize: 18, fontWeight: "600" },

  // ── NEW styles ───────────────────────────────────────────────
  periodLabelRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceText: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500",
  },
  priceTextSelected: {
    color: "#4F46E5",
    fontWeight: "700",
  },
  passCardSelected: {
    borderWidth: 1.5,
    borderColor: "#4F46E5",
  },
  passAmountText: {
    fontSize: 13,
    color: "#888",
    fontWeight: "500",
  },
  passAmountTextSelected: {
    color: "#4F46E5",
    fontWeight: "700",
  },
  amountBanner: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 4,
  },
  amountBannerLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  amountBannerValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
});