// ============================================================
//  busPassController.js
//  Orchestration layer — ties Auth, Service calls, and navigation.
//  Your React Native screen components call these functions directly.
//
//  IMPORTANT: This file holds the docPassId in a module-level
//  variable so all 3 stages share the SAME document ID without
//  passing it through navigation params (though you can do that
//  too — see the note below).
// ============================================================

import { auth } from "../config/firebase";
import {
  generatePassDocId,
  savePersonalInfo,
  savePassDetails,
  saveIdentityAndFinalize,
} from "../services/busPassService"
// ─────────────────────────────────────────────
//  Module-level state
//  docPassId is generated once in Stage 5 and reused in 6 & 7.
//
//  NOTE: If you use React Navigation and prefer passing state via
//  route.params instead of module scope, you can return docPassId
//  from handlePersonalInfoNext() and store it in your navigation
//  params. Both approaches work — module scope is simpler for now.
// ─────────────────────────────────────────────
let docPassId = null; // set in Stage 5, reused in 6 & 7

// ─────────────────────────────────────────────
//  HELPER: Get the currently logged-in user's UID
//  Throws if no user is authenticated (safety guard)
// ─────────────────────────────────────────────
const getAuthenticatedUserId = () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("No authenticated user found. Please log in again.");
  }
  return currentUser.uid;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  STAGE 5 CONTROLLER
//  Call this from your PersonalInformation screen's NEXT button handler.
//
//  What it does:
//   1. Gets the logged-in user's UID from Firebase Auth
//   2. Generates a structured doc ID  →  pass-{uid}-{timestamp}
//   3. Uploads the profile photo to Firebase Storage
//   4. Creates the Firestore document under passes/{docPassId}
//   5. Calls onSuccess() so your screen can navigate to Stage 6
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * @param {object} personalData - Data collected on Screen 1 (Personal Info)
 *   {
 *     name: string,
 *     dob: Date | string,        <- JS Date or ISO string from your date picker
 *     gender: string,            <- "Male" | "Female" | "Other"
 *     mobileNo: string,
 *     email: string,
 *     photoLocalUri: string      <- file URI from image picker e.g. file:///data/...
 *   }
 *
 * @param {object} callbacks
 *   {
 *     onSuccess: () => void,     <- called when Firestore write is done (navigate forward)
 *     onError: (msg) => void     <- called with error message string on failure
 *   }
 *
 * USAGE in your Screen component:
 *   import { handlePersonalInfoNext } from '../controllers/busPassController';
 *
 *   const onNextPress = () => {
 *     handlePersonalInfoNext(
 *       { name, dob, gender, mobileNo, email, photoLocalUri },
 *       {
 *         onSuccess: () => navigation.navigate('BuyBusPass'),
 *         onError: (msg) => Alert.alert('Error', msg),
 *       }
 *     );
 *   };
 */
export const handlePersonalInfoNext = async (personalData, { onSuccess, onError }) => {
  try {
    // ── Validation (basic) ──────────────────────────────────
    const { name, dob, gender, mobileNo, email, photoLocalUri } = personalData;

    if (!name || !dob || !gender || !mobileNo || !email) {
      return onError("Please fill in all personal details before continuing.");
    }
    if (!photoLocalUri) {
      return onError("Please upload your photograph before continuing.");
    }

    // ── Get authenticated user ──────────────────────────────
    const userId = getAuthenticatedUserId();

    // ── Generate doc ID (once, stored in module scope) ─────
    docPassId = generatePassDocId(userId);

    // ── Call service to upload photo + write to Firestore ──
    await savePersonalInfo(docPassId, userId, personalData);

    console.log(`[BusPass] Stage 5 ✅ | docPassId: ${docPassId}`);

    // ── Navigate to Stage 6 ────────────────────────────────
    onSuccess();
  } catch (error) {
    console.error("[BusPass] Stage 5 ❌", error);
    onError("Failed to save personal information. Please try again.");
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  STAGE 6 CONTROLLER
//  Call this from your BuyBusPass screen's NEXT button handler.
//
//  What it does:
//   1. Validates Stage 6 inputs
//   2. Calculates the expiry date from the selected period
//   3. Updates the SAME Firestore doc (uses docPassId from Stage 5)
//   4. Calls onSuccess() to navigate to Stage 7
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * @param {object} passDetails - Data collected on Screen 2 (Buy Bus Pass)
 *   {
 *     timePeriod: string,   <- "1 Day" | "1 Month" | "3 Month" | "6 Month" | "1 Year"
 *     passType: string,     <- "General" | "Student" | "Senior Citizen" | "Disabled"
 *     fromDate: Date        <- selected start date from the date picker
 *   }
 *
 * @param {object} callbacks
 *   {
 *     onSuccess: () => void,
 *     onError: (msg) => void
 *   }
 *
 * USAGE in your Screen component:
 *   import { handlePassDetailsNext } from '../controllers/busPassController';
 *
 *   const onNextPress = () => {
 *     handlePassDetailsNext(
 *       { timePeriod, passType, fromDate },
 *       {
 *         onSuccess: () => navigation.navigate('IdentityVerification'),
 *         onError: (msg) => Alert.alert('Error', msg),
 *       }
 *     );
 *   };
 */
export const handlePassDetailsNext = async (passDetails, { onSuccess, onError }) => {
  try {
    // ── Guard: docPassId must exist from Stage 5 ────────────
    if (!docPassId) {
      return onError("Session error. Please restart the pass application.");
    }

    const { timePeriod, passType, fromDate, amount } = passDetails; // ← amount added

    // ── Validation ──────────────────────────────────────────
    if (!timePeriod) {
      return onError("Please select a time period.");
    }
    if (!passType) {
      return onError("Please select a pass type.");
    }
    if (!fromDate) {
      return onError("Please select a start date.");
    }
    if (!amount || amount <= 0) {
      return onError("Invalid amount. Please reselect your pass options.");
    }

    // ── Call service to update Firestore ────────────────────
    await savePassDetails(docPassId, passDetails);

    console.log(`[BusPass] Stage 6 ✅ | docPassId: ${docPassId} | amount: ₹${amount}`);

    // ── Navigate to Stage 7 ────────────────────────────────
    onSuccess();
  } catch (error) {
    console.error("[BusPass] Stage 6 ❌", error);
    onError("Failed to save pass details. Please try again.");
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  STAGE 7 CONTROLLER
//  Call this from your IdentityVerification screen's APPLY PASS button.
//
//  What it does:
//   1. Validates Stage 7 inputs
//   2. Uploads the identity proof image to Firebase Storage
//   3. Updates the SAME Firestore doc with identity fields
//   4. Sets payment: false (payment not done yet)
//   5. Calls onSuccess() to navigate to Payment screen
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * @param {object} identityData - Data collected on Screen 3 (Identity Verification)
 *   {
 *     identityProofType: string,     <- "Aadhaar" | "PAN" | "Voter ID"
 *     identityProofNumber: string,   <- the number entered
 *     identityPhotoLocalUri: string  <- file URI of the uploaded proof image
 *   }
 *
 * @param {object} callbacks
 *   {
 *     onSuccess: (docPassId) => void,  <- receives docPassId for the Payment screen
 *     onError: (msg) => void
 *   }
 *
 * USAGE in your Screen component:
 *   import { handleApplyPass } from '../controllers/busPassController';
 *
 *   const onApplyPress = () => {
 *     handleApplyPass(
 *       { identityProofType, identityProofNumber, identityPhotoLocalUri },
 *       {
 *         onSuccess: (passId) => navigation.navigate('Payment', { docPassId: passId }),
 *         onError: (msg) => Alert.alert('Error', msg),
 *       }
 *     );
 *   };
 */
export const handleApplyPass = async (identityData, { onSuccess, onError }) => {
  try {
    // ── Guard: docPassId must exist from Stage 5 ────────────
    if (!docPassId) {
      return onError("Session error. Please restart the pass application.");
    }

    const { identityProofType, identityProofNumber, identityPhotoLocalUri } =
      identityData;

    // ── Validation ──────────────────────────────────────────
    if (!identityProofType) {
      return onError("Please select an identity proof type.");
    }
    if (!identityProofNumber || identityProofNumber.trim() === "") {
      return onError("Please enter your identity proof number.");
    }
    if (!identityPhotoLocalUri) {
      return onError("Please upload your identity proof photo.");
    }

    // ── Call service to upload ID photo + finalize Firestore doc ──
    await saveIdentityAndFinalize(docPassId, identityData);

    console.log(`[BusPass] Stage 7 ✅ | docPassId: ${docPassId} | payment: false`);

    // ── Capture docPassId before clearing module state ─────
    const finalPassId = docPassId;

    // ── Reset module state (new application next time) ─────
    docPassId = null;

    // ── Navigate to Payment screen, passing the doc ID ─────
    //    Your payment flow will use this to update payment:true later
    onSuccess(finalPassId);
  } catch (error) {
    console.error("[BusPass] Stage 7 ❌", error);
    onError("Failed to submit pass application. Please try again.");
  }
};

// ─────────────────────────────────────────────
//  UTILITY EXPORT
//  Lets any screen read the current docPassId if needed
//  (e.g. for displaying a reference number to the user)
// ─────────────────────────────────────────────
export const getCurrentPassDocId = () => docPassId;