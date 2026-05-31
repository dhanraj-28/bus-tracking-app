// ============================================================
//  PaymentScreen.jsx  —  Payment Screen
//  CHANGES FROM YOUR ORIGINAL:
//   1. Receives docPassId from route.params (passed from Stage 7)
//   2. Fetches real amount from Firestore on mount (replaces hardcoded '150.00')
//   3. handlePay() now calls initiatePayment() from controller
//   4. Added loading states — fetching amount + paying
//   5. Pay button shows real amount fetched from Firestore
//   6. On success → navigates to PassSuccess screen with docPassId
//   Everything else (UI, styles, card section, UPI grid) is UNCHANGED.
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Linking,
  Image,
  Alert,
  ActivityIndicator,   // ← NEW
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from "@react-navigation/native";  // ← useRoute added

// ── Firebase import to fetch amount ─────────────────────────
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../src/config/firebase";

// ── Controller import ────────────────────────────────────────
import { initiatePayment } from "../../src/controllers/paymentController";

const PaymentScreen = () => {
  const navigation = useNavigation();
  const route      = useRoute();                          // ← NEW

  // ── docPassId received from IdentityVerification via onSuccess(finalPassId) ──
  const { docPassId } = route.params;                     // ← NEW

  const [method, setMethod]           = useState('card');
  const [cardType, setCardType]       = useState('debit');
  const [selectedCard, setSelectedCard] = useState(null);
  const [cvv, setCvv]                 = useState('');

  // ── CHANGED: amount now fetched from Firestore, not hardcoded ──
  const [amount, setAmount]           = useState(null);   // ← was '150.00'
  const [passType, setPassType]       = useState('');
  const [fetchingAmount, setFetchingAmount] = useState(true); // ← NEW
  const [paying, setPaying]           = useState(false);  // ← NEW

  // ── Fetch real amount from Firestore on mount ─────────────
  useEffect(() => {
    const fetchPassData = async () => {
      try {
        const passSnap = await getDoc(doc(db, "passes", docPassId));
        if (passSnap.exists()) {
          const data = passSnap.data();
          setAmount(data.amount);       // real amount e.g. 120
          setPassType(data.passType || "");
        } else {
          Alert.alert("Error", "Pass not found. Please go back and try again.");
        }
      } catch (e) {
        Alert.alert("Error", "Could not load pass details.");
      } finally {
        setFetchingAmount(false);
      }
    };
    fetchPassData();
  }, [docPassId]);

  // ── UNCHANGED: saved cards (demo data) ──────────────────────
  const savedCards = [
    { id: 1, bank: 'Axis Bank',  number: '**** **** **** 7259', expiry: '12/26' },
    { id: 2, bank: 'HDFC Bank',  number: '**** **** **** 8342', expiry: '09/25' },
  ];

  // ── UNCHANGED: UPI apps ──────────────────────────────────────
  const upiApps = [
    { id: 'gpay',    name: 'Google Pay',  icon: require('../../assets/upi/gpay.png'),      url: `tez://upi/pay` },
    { id: 'phonepe', name: 'PhonePe',     icon: require('../../assets/upi/phonepe.png'),   url: `phonepe://upi/pay` },
    { id: 'paytm',   name: 'Paytm',       icon: require('../../assets/upi/paytm.png'),     url: `paytmmp://upi/pay` },
    { id: 'amazon',  name: 'Amazon Pay',  icon: require('../../assets/upi/amazonpay.png'), url: `upi://pay?pa=test@upi&pn=BusTicket&am=${amount}&cu=INR` },
  ];

  // ── CHANGED: handlePay now calls the controller ───────────
  const handlePay = async () => {
    // ── Your original validations — UNCHANGED ────────────────
    if (method === 'card' && !selectedCard) {
      Alert.alert('Select Card', 'Please select a card');
      return;
    }
    if (method === 'card' && cvv.length !== 3) {
      Alert.alert('Invalid CVV', 'Enter a valid CVV');
      return;
    }

    // ── NEW: call controller ─────────────────────────────────
    setPaying(true);

    // paymentMethod: your state is 'card'|'upi', controller expects 'Card'|'UPI'
    const paymentMethod = method === 'card' ? 'Card' : 'UPI';

    await initiatePayment(
      docPassId,
      paymentMethod,
      {
        // ✅ All 3 Firestore writes done — navigate to success
        onSuccess: (id) => {
          setPaying(false);
          navigation.navigate('PassSuccess', { docPassId: id });
          // ── Create a PassSuccessScreen that shows pass details
          // ── and a "View My Pass" button
        },
        // ❌ Payment failed
        onError: (msg) => {
          setPaying(false);
          Alert.alert('Payment Failed', msg);
        },
        // 🚫 User cancelled (only fires with real Razorpay, not simulation)
        onCancel: () => {
          setPaying(false);
          Alert.alert('Cancelled', 'Payment was cancelled. You can try again.');
        },
      }
    );
  };

  return (
    <View style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header — UNCHANGED */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons style={styles.backIcon} name="arrow-back" size={26} color="#000" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Payment</Text>
          </View>
        </View>

        {/* ── Amount Summary — NEW (replaces hardcoded amount) ── */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount to Pay</Text>
          {fetchingAmount ? (
            <ActivityIndicator color="#1e90ff" style={{ marginTop: 8 }} />
          ) : (
            <>
              <Text style={styles.amountValue}>₹{amount}</Text>
              <Text style={styles.passTypeLabel}>{passType} Pass</Text>
            </>
          )}
        </View>

        {/* MAIN METHOD — UNCHANGED */}
        <Text style={styles.sectionTitle}>Choose Payment Method</Text>

        <TouchableOpacity
          style={[styles.methodBox, method === 'card' && styles.active]}
          onPress={() => setMethod('card')}
        >
          <Text style={styles.methodText}>💳 Card</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.methodBox, method === 'upi' && styles.active]}
          onPress={() => setMethod('upi')}
        >
          <Text style={styles.methodText}>📱 UPI</Text>
        </TouchableOpacity>

        {/* CARD SECTION — UNCHANGED */}
        {method === 'card' && (
          <>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleButton, cardType === 'credit' && styles.activeToggle]}
                onPress={() => setCardType('credit')}
              >
                <Text>Credit Card</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, cardType === 'debit' && styles.activeToggle]}
                onPress={() => setCardType('debit')}
              >
                <Text>Debit Card</Text>
              </TouchableOpacity>
            </View>

            {savedCards.map(card => (
              <TouchableOpacity
                key={card.id}
                style={[styles.cardBox, selectedCard?.id === card.id && styles.selected]}
                onPress={() => setSelectedCard(card)}
              >
                <Text style={styles.bank}>{card.bank}</Text>
                <Text>{card.number} | {card.expiry}</Text>
                {selectedCard?.id === card.id && (
                  <TextInput
                    placeholder="CVV"
                    keyboardType="number-pad"
                    maxLength={3}
                    style={styles.cvv}
                    value={cvv}
                    onChangeText={setCvv}
                  />
                )}
              </TouchableOpacity>
            ))}

            <Text style={styles.sectionTitle}>Add New Card</Text>
            <TextInput placeholder="Card Number" style={styles.input} />
            <TextInput placeholder="MM / YY" style={styles.input} />
            <TextInput placeholder="Cardholder Name" style={styles.input} />
            <TextInput placeholder="CVV" style={styles.input} keyboardType="number-pad" />
          </>
        )}

        {/* UPI SECTION — UNCHANGED */}
        {method === 'upi' && (
          <View style={styles.upiGrid}>
            {upiApps.map(app => (
              <TouchableOpacity
                key={app.id}
                style={styles.upiBox}
                onPress={() => Linking.openURL(app.url)}
              >
                <Image source={app.icon} style={styles.upiIcon} />
                <Text>{app.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

      </ScrollView>

      {/* FIXED PAY BUTTON — shows spinner + real amount while paying */}
      <TouchableOpacity
        style={[styles.payButton, (paying || fetchingAmount) && { opacity: 0.7 }]}
        onPress={handlePay}
        disabled={paying || fetchingAmount}
      >
        {paying ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.payText}>
            Pay Securely {amount ? `₹${amount}` : ''}
          </Text>
        )}
      </TouchableOpacity>

    </View>
  );
};

export default PaymentScreen;

// ── Styles — COMPLETELY UNCHANGED ────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 11,
  },
  headerCenter: {
    flex: 2,
    alignItems: 'flex-start',
    marginTop: 12,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 180,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerLeft: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 14,
  },
  methodBox: {
    backgroundColor: '#f3f3f3',
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
  },
  methodText: {
    fontSize: 16,
    fontWeight: '500',
  },
  active: {
    borderWidth: 2,
    borderColor: '#1e90ff',
    backgroundColor: '#eef6ff',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  toggleButton: {
    width: '48%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
  activeToggle: {
    backgroundColor: '#d6ebff',
    borderWidth: 1.5,
    borderColor: '#1e90ff',
  },
  cardBox: {
    backgroundColor: '#f7f7f7',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  selected: {
    borderWidth: 2,
    borderColor: '#1e90ff',
  },
  bank: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  cvv: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    width: '50%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  upiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  upiBox: {
    width: '48%',
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 14,
  },
  upiIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  payButton: {
    position: 'absolute',
    bottom: 55,
    left: 16,
    right: 16,
    backgroundColor: '#1e90ff',
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5,
  },
  payText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  // ── NEW styles for amount card ──
  amountCard: {
    backgroundColor: '#eef6ff',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#b3d9ff',
  },
  amountLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 38,
    fontWeight: '800',
    color: '#1e90ff',
    marginTop: 4,
  },
  passTypeLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
});