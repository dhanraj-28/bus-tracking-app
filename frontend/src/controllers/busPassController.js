// ============================================================
//  busPassController.js  —  Bus Pass Orchestration
//  KEY CHANGE: Stage 5 now checks for an existing incomplete
//  pass (payment:false) before creating a new document.
//  If found → reuses same docPassId and updates it.
//  If not found → creates a new doc as before.
// ============================================================

import { auth } from "../config/firebase";
import {
  generatePassDocId,
  findExistingIncompletePass,
  savePersonalInfo,
  savePassDetails,
  saveIdentityAndFinalize,
} from "../services/busPassService";

// ─────────────────────────────────────────────
//  Module-level state
//  docPassId is set in Stage 5 (new or existing) and reused in 6 & 7
// ─────────────────────────────────────────────
let docPassId = null;

const getAuthenticatedUserId = () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("No authenticated user found. Please log in again.");
  }
  return currentUser.uid;
};


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  STAGE 5 CONTROLLER
//  NEW BEHAVIOUR:
//   1. Checks if user already has a pass with payment:false
//   2. YES → reuses that docPassId, updates the doc (no duplicate)
//   3. NO  → generates new docPassId, creates fresh doc
//   4. Returns existing pass data to frontend for prefilling
//
//  @param {object} personalData - form fields from Stage 5 screen
//  @param {object} callbacks
//    {
//      onSuccess: (prefillData) => void
//        prefillData: existing pass data to prefill Stage 6 form, or null
//      onError: (msg) => void
//    }
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const handlePersonalInfoNext = async (personalData, { onSuccess, onError }) => {
  try {
    const { name, dob, gender, mobileNo, email, photoLocalUri } = personalData;

    // ── Validation ───────────────────────────────────────────
    if (!name || !dob || !gender || !mobileNo || !email) {
      return onError("Please fill in all personal details before continuing.");
    }
    if (!photoLocalUri) {
      return onError("Please upload your photograph before continuing.");
    }

    const userId = getAuthenticatedUserId();

    // ── Check for existing incomplete pass ────────────────────
    // This is the key logic — query Firestore for payment:false pass
    const existing = await findExistingIncompletePass(userId);

    let isUpdate = false;

    if (existing) {
      // ── REUSE: found an incomplete pass → update it ──────────
      docPassId = existing.docPassId;
      isUpdate  = true;
      console.log(`[BusPass] Stage 5 ♻️  Reusing existing pass | docPassId: ${docPassId}`);
    } else {
      // ── CREATE: no incomplete pass found → create new doc ────
      docPassId = generatePassDocId(userId);
      isUpdate  = false;
      console.log(`[BusPass] Stage 5 ✨ Creating new pass | docPassId: ${docPassId}`);
    }

    // ── Save personal info (create or update) ────────────────
    await savePersonalInfo(docPassId, userId, personalData, isUpdate);

    console.log(`[BusPass] Stage 5 ✅ | docPassId: ${docPassId} | mode: ${isUpdate ? "UPDATE" : "CREATE"}`);

    // ── Pass existing data to frontend for prefilling Stage 6 ─
    // If reusing, Stage 6 can prefill timePeriod/passType/fromDate
    // that the user had already selected before going back
    onSuccess(existing?.passData || null);

  } catch (error) {
    console.error("[BusPass] Stage 5 ❌", error);
    onError("Failed to save personal information. Please try again.");
  }
};


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  STAGE 6 CONTROLLER — unchanged logic, same doc always updated
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const handlePassDetailsNext = async (passDetails, { onSuccess, onError }) => {
  try {
    if (!docPassId) {
      return onError("Session error. Please restart the pass application.");
    }

    const { timePeriod, passType, fromDate, amount } = passDetails;

    if (!timePeriod) return onError("Please select a time period.");
    if (!passType)   return onError("Please select a pass type.");
    if (!fromDate)   return onError("Please select a start date.");
    if (!amount || amount <= 0) return onError("Invalid amount. Please reselect your pass options.");

    await savePassDetails(docPassId, passDetails);

    console.log(`[BusPass] Stage 6 ✅ | docPassId: ${docPassId} | amount: ₹${amount}`);
    onSuccess();

  } catch (error) {
    console.error("[BusPass] Stage 6 ❌", error);
    onError("Failed to save pass details. Please try again.");
  }
};


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  STAGE 7 CONTROLLER — unchanged logic, same doc always updated
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const handleApplyPass = async (identityData, { onSuccess, onError }) => {
  try {
    if (!docPassId) {
      return onError("Session error. Please restart the pass application.");
    }

    const { identityProofType, identityProofNumber, identityPhotoLocalUri } = identityData;

    if (!identityProofType)                              return onError("Please select an identity proof type.");
    if (!identityProofNumber || !identityProofNumber.trim()) return onError("Please enter your identity proof number.");
    if (!identityPhotoLocalUri)                          return onError("Please upload your identity proof photo.");

    await saveIdentityAndFinalize(docPassId, identityData);

    console.log(`[BusPass] Stage 7 ✅ | docPassId: ${docPassId} | payment: false`);

    const finalPassId = docPassId;
    docPassId = null;           // reset for next application

    onSuccess(finalPassId);

  } catch (error) {
    console.error("[BusPass] Stage 7 ❌", error);
    onError("Failed to submit pass application. Please try again.");
  }
};


export const getCurrentPassDocId = () => docPassId;