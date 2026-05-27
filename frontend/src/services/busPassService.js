// ============================================================
//  busPassService.js  —  Expo + Firebase JS SDK (modular v9+)
//  IMAGE UPLOAD: temporarily disabled (Firebase Storage is paid)
//  TO ENABLE LATER: search "ENABLE_LATER" comments below
// ============================================================

import {
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

// ── ENABLE_LATER: uncomment these 3 lines when Storage is ready ──
// import {
//   ref,
//   uploadBytes,
//   getDownloadURL,
// } from "firebase/storage";

import { db } from "../config/firebase";

// ── ENABLE_LATER: also uncomment `storage` in the import above ──
// import { db, storage } from "../config/firebase";


// ─────────────────────────────────────────────
//  HELPER: Upload image to Firebase Storage
//  STATUS: disabled — Storage requires paid plan
//
//  TO ENABLE LATER:
//   1. Upgrade Firebase project to Blaze (pay-as-you-go)
//   2. Uncomment the storage imports at the top of this file
//   3. Uncomment the `storage` import from "../config/firebase"
//   4. Uncomment this entire function body (delete the return line)
//   5. In savePersonalInfo()     → uncomment the photoProofUrl block
//   6. In saveIdentityAndFinalize() → uncomment the identityPhotoUrl block
// ─────────────────────────────────────────────
export const uploadImageToStorage = async (localUri, storagePath) => {
  // ── ENABLE_LATER: delete this return line when enabling ──
  return "";

  // ── ENABLE_LATER: uncomment the block below ──────────────
  // const response = await fetch(localUri);          // convert local URI → blob
  // const blob = await response.blob();
  // const storageRef = ref(storage, storagePath);    // e.g. "passes/pass-uid-123/profile_photo.jpg"
  // await uploadBytes(storageRef, blob);             // upload to Firebase Storage
  // const downloadURL = await getDownloadURL(storageRef); // get public URL
  // return downloadURL;
};


// ─────────────────────────────────────────────
//  HELPER: Generate structured document ID
//  Format: pass-{userId}-{timestamp}
// ─────────────────────────────────────────────
export const generatePassDocId = (userId) => {
  const timestamp = Date.now();
  return `pass-${userId}-${timestamp}`;
};


// ─────────────────────────────────────────────
//  STAGE 5 — Save Personal Info
//  Creates the Firestore document for the first time.
//  Called when user presses NEXT on the Personal Info screen.
// ─────────────────────────────────────────────
export const savePersonalInfo = async (docPassId, userId, personalData) => {
  const { name, dob, gender, mobileNo, email, photoLocalUri } = personalData;

  // ── ENABLE_LATER: uncomment to upload profile photo ──────
  // const photoStoragePath = `passes/${docPassId}/profile_photo.jpg`;
  // const photoProofUrl = await uploadImageToStorage(photoLocalUri, photoStoragePath);

  // ── Temporary: empty string until Storage is enabled ─────
  const photoProofUrl = "";

  const passRef = doc(db, "passes", docPassId);
  await setDoc(passRef, {
    userId,
    name,
    dob: Timestamp.fromDate(new Date(dob)),
    gender,
    mobileNo,
    email,
    photoProofUrl,           // "" for now, will be Storage URL when enabled
    // Placeholders for stages 6 & 7
    timePeriod: "",
    passType: "",
    fromDate: null,
    toDate: null,
    expiryDate: null,
    identityProofType: "",
    identityPhotoUrl: "",    // "" for now, will be Storage URL when enabled
    aadharNumber: "",
    panNumber: "",
    voterNumber: "",
    status: "pending",
    appliedAt: serverTimestamp(),
    payment: false,
    amount: 0,               // placeholder — filled in Stage 6 with actual amount
  });
};


// ─────────────────────────────────────────────
//  STAGE 6 — Save Pass Details
//  Updates the same document with pass type, dates, and amount.
//  Called when user presses NEXT on the Buy Bus Pass screen.
// ─────────────────────────────────────────────
export const savePassDetails = async (docPassId, passDetails) => {
  const { timePeriod, passType, fromDate, amount } = passDetails; // ← amount added

  const from = new Date(fromDate);
  const expiry = calculateExpiryDate(from, timePeriod);

  const passRef = doc(db, "passes", docPassId);
  await updateDoc(passRef, {
    timePeriod,
    passType,
    fromDate:    Timestamp.fromDate(from),
    toDate:      Timestamp.fromDate(expiry),
    expiryDate:  Timestamp.fromDate(expiry),
    amount,                  // ← number e.g. 120 (rupees, no ₹ symbol — cleaner for payment flow)
  });
};


// ─────────────────────────────────────────────
//  STAGE 7 — Save Identity + Finalize
//  Updates the same document with identity proof.
//  Sets payment: false (payment flow handled separately).
//  Called when user presses APPLY PASS on Identity Verification screen.
// ─────────────────────────────────────────────
export const saveIdentityAndFinalize = async (docPassId, identityData) => {
  const { identityProofType, identityProofNumber, identityPhotoLocalUri } = identityData;

  // ── ENABLE_LATER: uncomment to upload identity proof photo ──
  // const identityStoragePath = `passes/${docPassId}/identity_proof.jpg`;
  // const identityPhotoUrl = await uploadImageToStorage(identityPhotoLocalUri, identityStoragePath);

  // ── Temporary: empty string until Storage is enabled ──────
  const identityPhotoUrl = "";

  const proofNumberFields = resolveProofNumberFields(identityProofType, identityProofNumber);

  const passRef = doc(db, "passes", docPassId);
  await updateDoc(passRef, {
    identityProofType,
    identityPhotoUrl,        // "" for now, will be Storage URL when enabled
    payment: false,
    ...proofNumberFields,    // spreads aadharNumber / panNumber / voterNumber
  });
};


// ─────────────────────────────────────────────
//  INTERNAL HELPER: Calculate expiry date
//  from start date + selected time period string
// ─────────────────────────────────────────────
const calculateExpiryDate = (fromDate, timePeriod) => {
  const expiry = new Date(fromDate);
  switch (timePeriod) {
    case "1 Day":   expiry.setDate(expiry.getDate() + 1);          break;
    case "1 Month": expiry.setMonth(expiry.getMonth() + 1);        break;
    case "3 Month": expiry.setMonth(expiry.getMonth() + 3);        break;
    case "6 Month": expiry.setMonth(expiry.getMonth() + 6);        break;
    case "1 Year":  expiry.setFullYear(expiry.getFullYear() + 1);  break;
    default:        expiry.setMonth(expiry.getMonth() + 1);
  }
  return expiry;
};


// ─────────────────────────────────────────────
//  INTERNAL HELPER: Resolve which ID number field to store
//  Only the relevant field gets populated — others stay ""
// ─────────────────────────────────────────────
const resolveProofNumberFields = (proofType, proofNumber) => {
  const fields = { aadharNumber: "", panNumber: "", voterNumber: "" };
  switch (proofType) {
    case "Aadhaar":  fields.aadharNumber = proofNumber; break;
    case "PAN":      fields.panNumber    = proofNumber; break;
    case "Voter ID": fields.voterNumber  = proofNumber; break;
  }
  return fields;
};