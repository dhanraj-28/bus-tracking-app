// ============================================================
//  paymentService.js  —  Razorpay Payment Service
//  Handles all 3 Firestore writes after successful payment:
//   1. passes/{docPassId}         → payment: true
//   2. payments/{paymentId}       → full payment record
//   3. users/{uid}/notifications  → success notification
// ============================================================

import {
  doc,
  setDoc,
  updateDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

export const RAZORPAY_KEY_ID = "rzp_test_SukTZZvK8PgAfK"; // ← replace with your test key

// ─────────────────────────────────────────────
//  BUILD RAZORPAY OPTIONS
//  Amount must be in PAISE (rupees × 100)
// ─────────────────────────────────────────────
export const buildRazorpayOptions = (amountInRupees, docPassId, userInfo) => {
  return {
    description:  "Bus Pass Payment",
    image:        "",
    currency:     "INR",
    key:          RAZORPAY_KEY_ID,
    amount:       amountInRupees * 100,       // ₹120 → 12000 paise
    name:         "Where Is My Bus",
    prefill: {
      name:    userInfo.name     || "",
      email:   userInfo.email    || "",
      contact: userInfo.mobileNo || "",
    },
    theme: { color: "#4F46E5" },
    notes: { docPassId, appName: "WhereIsMyBus" },
  };
};

// ─────────────────────────────────────────────
//  ON PAYMENT SUCCESS — 3 Firestore writes
//  All writes happen together after Razorpay confirms payment.
// ─────────────────────────────────────────────
/**
 * @param {string} docPassId      - passes collection doc ID
 * @param {string} userId         - logged-in user's UID
 * @param {number} amount         - amount in rupees (e.g. 120)
 * @param {string} paymentMethod  - "UPI" | "Card" selected by user on PaymentScreen
 * @param {object} razorpayData   - { razorpay_payment_id, razorpay_order_id, razorpay_signature }
 */
export const handlePaymentSuccess = async (
  docPassId,
  userId,
  amount,
  paymentMethod,
  razorpayData
) => {
  const paymentId      = razorpayData.razorpay_payment_id;   // e.g. "pay_ABC123xyz"
  const transactionId  = razorpayData.razorpay_order_id || paymentId; // fallback to paymentId

  // ── Write 1: Update passes/{docPassId} ─────────────────────
  // Marks the pass as paid and approved
  const passRef = doc(db, "passes", docPassId);
  await updateDoc(passRef, {
    payment:           true,
    status:            "pending",
    paymentId,
    razorpaySignature: razorpayData.razorpay_signature || "",
    paidAt:            serverTimestamp(),
  });

  // ── Write 2: Create payments/{paymentId} ───────────────────
  // Full payment record as per your schema
  const paymentRef = doc(db, "payments", paymentId);
  await setDoc(paymentRef, {
    userId,
    docPassId,                      // link back to the pass — useful for admin queries
    amount,                         // number in rupees e.g. 120
    paymentMethod,                  // "UPI" | "Card"
    status:        "success",
    transactionId,                  // razorpay_order_id (or paymentId as fallback)
    paymentId,                      // razorpay_payment_id e.g. "pay_ABC123"
    paidAt:        serverTimestamp(),
  });

  // ── Write 3: Create users/{uid}/notifications/{notificationId} ──
  // Auto-generated ID for the notification doc
  const notifRef = doc(collection(db, "users", userId, "notifications"));
  await setDoc(notifRef, {
    title:     "Payment Successful 🎉",
    message:   "Thank you for applying for a bus pass! Your pass will be processed and delivered soon.",
    type:      "payment_success",
    read:      false,
    docPassId,                      // link to the pass for deep-link navigation later
    createdAt: serverTimestamp(),
  });
};

// ─────────────────────────────────────────────
//  ON PAYMENT FAILURE
//  Only updates passes doc — no payment or notification doc created
// ─────────────────────────────────────────────
/**
 * @param {string} docPassId  - passes collection doc ID
 * @param {string} errorCode  - Razorpay error code
 * @param {string} errorDesc  - Human-readable error
 */
export const handlePaymentFailure = async (docPassId, errorCode, errorDesc) => {
  const passRef = doc(db, "passes", docPassId);
  await updateDoc(passRef, {
    payment:          false,
    status:           "payment_failed",
    paymentErrorCode: errorCode || "UNKNOWN",
    paymentErrorDesc: errorDesc || "Payment was not completed",
    failedAt:         serverTimestamp(),
  });
};
