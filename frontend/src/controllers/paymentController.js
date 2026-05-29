// ============================================================
//  paymentController.js  —  SIMULATED Payment (Expo Go compatible)
//  Razorpay SDK is replaced with a simulation that:
//   - Writes real data to all 3 Firestore collections
//   - Works perfectly in Expo Go
//   - Looks identical to real payment in your demo
//
//  TO SWITCH TO REAL RAZORPAY LATER:
//   Search "ENABLE_RAZORPAY" comments and follow instructions
// ============================================================

import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../config/firebase";

// ── ENABLE_RAZORPAY: uncomment this when you have a dev build ──
// import RazorpayCheckout from "react-native-razorpay";

import {
  buildRazorpayOptions,
  handlePaymentSuccess,
  handlePaymentFailure,
} from "../services/paymentService";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  MAIN PAYMENT HANDLER
//  Call from PaymentScreen's "Pay Securely" button.
//
//  @param {string} docPassId      - from route.params (passed from Stage 7)
//  @param {string} paymentMethod  - "UPI" | "Card"
//  @param {object} callbacks
//    {
//      onSuccess: (docPassId) => void
//      onError:   (msg) => void
//      onCancel:  () => void
//    }
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const initiatePayment = async (
  docPassId,
  paymentMethod,
  { onSuccess, onError, onCancel }
) => {
  try {
    // ── Guard: docPassId required ─────────────────────────────
    if (!docPassId) {
      return onError("Pass reference missing. Please restart the application.");
    }

    // ── Guard: user must be logged in ────────────────────────
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return onError("Session expired. Please log in again.");
    }
    const userId = currentUser.uid;

    // ── Step 1: Fetch pass doc from Firestore ─────────────────
    const passSnap = await getDoc(doc(db, "passes", docPassId));
    if (!passSnap.exists()) {
      return onError("Pass not found. Please restart the application.");
    }

    const passData = passSnap.data();
    const { amount, name, email, mobileNo } = passData;

    // ── Guard: prevent double payment ────────────────────────
    if (passData.payment === true) {
      return onError("This pass has already been paid for.");
    }

    console.log(`[Payment] Initiating | docPassId: ${docPassId} | amount: ₹${amount}`);

    // ════════════════════════════════════════════════════════
    //  SIMULATED PAYMENT BLOCK
    //  Generates realistic-looking Razorpay IDs for demo.
    //  All 3 Firestore writes happen exactly as in real flow.
    //
    //  ENABLE_RAZORPAY: delete this entire block and
    //  uncomment the RazorpayCheckout block below it
    // ════════════════════════════════════════════════════════
    const simulatedRazorpayData = {
      razorpay_payment_id: `pay_demo_${Date.now()}`,        // e.g. pay_demo_1716000000000
      razorpay_order_id:   `order_demo_${Date.now()}`,      // e.g. order_demo_1716000000000
      razorpay_signature:  `sig_demo_${userId.slice(0, 8)}`, // e.g. sig_demo_y8JoMJgu
    };

    try {
      await handlePaymentSuccess(
        docPassId,
        userId,
        amount,
        paymentMethod,
        simulatedRazorpayData
      );
      console.log(`[Payment] ✅ Simulated success | All 3 Firestore writes complete`);
      onSuccess(docPassId);
    } catch (writeError) {
      console.error("[Payment] ❌ Firestore write failed:", writeError);
      onError("Payment processed but could not save details. Please contact support.");
    }
    // ════════════════════════════════════════════════════════
    //  END SIMULATION BLOCK
    // ════════════════════════════════════════════════════════


    // ── ENABLE_RAZORPAY: uncomment this block when switching to real Razorpay ──
    // const options = buildRazorpayOptions(amount, docPassId, { name, email, mobileNo });
    // RazorpayCheckout.open(options)
    //   .then(async (razorpayData) => {
    //     try {
    //       await handlePaymentSuccess(docPassId, userId, amount, paymentMethod, razorpayData);
    //       onSuccess(docPassId);
    //     } catch (writeError) {
    //       console.error("[Payment] ⚠️ Razorpay success but Firestore write failed:", writeError);
    //       onSuccess(docPassId); // money taken — still show success
    //     }
    //   })
    //   .catch(async (error) => {
    //     const code = error?.code?.toString() || "UNKNOWN";
    //     const desc = error?.description || "Payment was not completed";
    //     if (code === "0") { onCancel(); return; }
    //     await handlePaymentFailure(docPassId, code, desc);
    //     onError(`Payment failed: ${desc}`);
    //   });

  } catch (error) {
    console.error("[Payment] Unexpected error ❌", error);
    onError("Something went wrong. Please try again.");
  }
};
