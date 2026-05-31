// ============================================================
//  BuyBusPassScreen.jsx  —  Stage 6: Pass Details
//  CHANGES:
//   1. Reads route.params.prefillData from Stage 5
//   2. If user came back and had already selected pass options,
//      those values are prefilled from the existing Firestore doc
//   3. useEffect prefills timePeriod, passType, startDate on mount
//   Everything else (UI, pricing matrix, styles) is UNCHANGED.
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Pressable,
  Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from "@react-navigation/native";
import { handlePassDetailsNext } from "../../src/controllers/busPassController";

const PRICING_MATRIX = {
  "1 DAY":   { "General Pass": 40,  "Student": 25,  "Senior Citizen": 20,  "Disabled": 15  },
  "1 MONTH": { "General Pass": 120, "Student": 80,  "Senior Citizen": 60,  "Disabled": 45  },
  "3 MONTH": { "General Pass": 360, "Student": 220, "Senior Citizen": 160, "Disabled": 120 },
  "6 MONTH": { "General Pass": 720, "Student": 400, "Senior Citizen": 300, "Disabled": 220 },
  "1 YEAR":  { "General Pass": 1440,"Student": 750, "Senior Citizen": 550, "Disabled": 400 },
};

// Maps Firestore stored timePeriod ("1 Day") → UI key ("1 DAY")
const NORMALIZE_REVERSE = {
  "1 Day": "1 DAY", "1 Month": "1 MONTH",
  "3 Month": "3 MONTH", "6 Month": "6 MONTH", "1 Year": "1 YEAR",
};

const TIME_PERIOD_KEYS = ["1 DAY", "1 MONTH", "3 MONTH", "6 MONTH", "1 YEAR"];
const PASS_OPTIONS     = ["General Pass", "Student", "Senior Citizen", "Disabled"];

const BuyBusPassScreen = () => {
  const navigation = useNavigation();
  const route      = useRoute();

  // prefillData from Stage 5 — existing Firestore pass doc fields or null
  const prefillData = route.params?.prefillData || null;

  const [timePeriod, setTimePeriod] = useState("1 DAY");
  const [passType, setPassType]     = useState("General Pass");
  const [startDate, setStartDate]   = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading]       = useState(false);

  // ── Prefill from existing pass when returning user ────────
  useEffect(() => {
    if (!prefillData) return;

    // timePeriod stored as "1 Day" → convert back to UI key "1 DAY"
    if (prefillData.timePeriod && NORMALIZE_REVERSE[prefillData.timePeriod]) {
      setTimePeriod(NORMALIZE_REVERSE[prefillData.timePeriod]);
    }

    // passType stored as "General Pass" | "Student" etc. — use directly
    if (prefillData.passType && PASS_OPTIONS.includes(prefillData.passType)) {
      setPassType(prefillData.passType);
    }

    // fromDate stored as Firestore Timestamp → convert to JS Date
    if (prefillData.fromDate?.toDate) {
      setStartDate(prefillData.fromDate.toDate());
    }

    console.log("[BuyBusPass] Prefilled from existing pass data");
  }, []);

  const currentAmount = PRICING_MATRIX[timePeriod][passType];

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

  const normalizeTimePeriod = (key) => {
    const parts = key.split(" ");
    return `${parts[0]} ${parts[1].charAt(0) + parts[1].slice(1).toLowerCase()}`;
  };

  const handleNext = async () => {
    setLoading(true);
    await handlePassDetailsNext(
      {
        timePeriod: normalizeTimePeriod(timePeriod),
        passType,
        fromDate: startDate,
        amount: currentAmount,
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

        {/* Time Period */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SELECT TIME PERIOD</Text>
          {TIME_PERIOD_KEYS.map((key) => (
            <Pressable key={key} style={styles.radioRow} onPress={() => setTimePeriod(key)}>
              <View style={styles.radioOuter}>
                {timePeriod === key && <View style={styles.radioInner} />}
              </View>
              <View style={styles.periodLabelRow}>
                <Text style={styles.radioText}>{key}</Text>
                <Text style={[styles.priceText, timePeriod === key && styles.priceTextSelected]}>
                  ₹{PRICING_MATRIX[key][passType]}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Start Date */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SELECT START DATE</Text>
          {Platform.OS === "web" ? (
            <input type="date" value={startDate.toISOString().split("T")[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))} style={styles.webDate} />
          ) : (
            <>
              <View style={styles.dateRow}>
                <Text style={styles.dateText}>{formatDate(startDate)}</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <MaterialIcons name="date-range" size={26} color="#4F46E5" />
                </TouchableOpacity>
              </View>
              {showDatePicker && (
                <DateTimePicker value={startDate} mode="date"
                  display={Platform.OS === "android" ? "calendar" : "spinner"}
                  onChange={onDateChange} minimumDate={new Date()} />
              )}
            </>
          )}
          <Text style={styles.validText}>VALID TILL:</Text>
          <Text style={styles.validDate}>{formatDate(validTillDate)}</Text>
        </View>

        {/* Pass Type */}
        <Text style={styles.sectionTitle}>Select Pass</Text>
        {PASS_OPTIONS.map((item) => (
          <Pressable key={item}
            style={[styles.passCard, passType === item && styles.passCardSelected]}
            onPress={() => setPassType(item)}
          >
            <View style={styles.radioOuter}>
              {passType === item && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.passText}>{item}</Text>
            <Text style={[styles.passAmountText, passType === item && styles.passAmountTextSelected]}>
              ₹{PRICING_MATRIX[timePeriod][item]}
            </Text>
          </Pressable>
        ))}

        {/* Amount Banner */}
        <View style={styles.amountBanner}>
          <Text style={styles.amountBannerLabel}>Total Amount Payable</Text>
          <Text style={styles.amountBannerValue}>₹{currentAmount}</Text>
        </View>

        <TouchableOpacity
          style={[styles.nextButton, loading && { opacity: 0.7 }]}
          onPress={handleNext} disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.nextText}>NEXT</Text>}
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
};

export default BuyBusPassScreen;

const styles = StyleSheet.create({
  container:      { flexGrow: 1, backgroundColor: "#F4F4F4", padding: 16, paddingBottom: 40 },
  card:           { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 14 },
  cardTitle:      { fontSize: 12, fontWeight: "600", marginBottom: 10 },
  radioRow:       { flexDirection: "row", alignItems: "center", marginVertical: 6 },
  radioOuter:     { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: "#4F46E5", justifyContent: "center", alignItems: "center", marginRight: 10 },
  radioInner:     { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4F46E5" },
  periodLabelRow: { flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  priceText:      { fontSize: 14, color: "#888", fontWeight: "500" },
  priceTextSelected: { color: "#4F46E5", fontWeight: "700" },
  webDate:        { padding: 8, fontSize: 14, borderRadius: 6, border: "1px solid #ccc", width: "60%" },
  validText:      { fontSize: 11, marginTop: 6 },
  validDate:      { color: "red", fontSize: 12 },
  sectionTitle:   { fontWeight: "600", marginBottom: 8 },
  passCard:       { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 10 },
  passCardSelected: { borderWidth: 1.5, borderColor: "#4F46E5" },
  passText:       { flex: 1, marginLeft: 10, fontSize: 14 },
  passAmountText: { fontSize: 13, color: "#888", fontWeight: "500" },
  passAmountTextSelected: { color: "#4F46E5", fontWeight: "700" },
  dateRow:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: "#ccc", paddingHorizontal: 12, paddingVertical: 10, height: 46, borderRadius: 6, width: "60%", backgroundColor: "#fff" },
  dateText:       { fontSize: 14, color: "#000" },
  nextButton:     { backgroundColor: "#4F46E5", padding: 14, borderRadius: 24, alignItems: "center", marginTop: 16, marginBottom: 10 },
  nextText:       { color: "#fff", fontWeight: "600" },
  headerRow:      { flexDirection: "row", alignItems: "center", height: 48, marginBottom: 16 },
  headerLeft:     { width: 40, justifyContent: "center", alignItems: "flex-start" },
  headerCenter:   { flex: 1, alignItems: "center" },
  headerRight:    { width: 40 },
  headerTitle:    { fontSize: 18, fontWeight: "600" },
  amountBanner:   { backgroundColor: "#4F46E5", borderRadius: 12, padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6, marginBottom: 4 },
  amountBannerLabel: { color: "#fff", fontSize: 14, fontWeight: "600" },
  amountBannerValue: { color: "#fff", fontSize: 20, fontWeight: "800" },
});