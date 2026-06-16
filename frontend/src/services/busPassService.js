// ============================================================
//  busPassService.js  —  Expo + Firebase JS SDK (modular v9+)
//  IMAGE UPLOAD: temporarily disabled (Firebase Storage is paid)
//  TO ENABLE LATER: search "ENABLE_LATER" comments below
// ============================================================

import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import { db } from "../config/firebase";

// ── ENABLE_LATER: uncomment these + storage import when Storage is ready ──
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { db, storage } from "../config/firebase";


// ─────────────────────────────────────────────
//  HELPER: Upload image to Firebase Storage
//  STATUS: disabled — Storage requires paid plan
//  ENABLE_LATER: see comments inside
// ─────────────────────────────────────────────
export const uploadImageToStorage = async (localUri, storagePath) => {
  return ""; // ── ENABLE_LATER: delete this line
  // const response = await fetch(localUri);
  // const blob = await response.blob();
  // const storageRef = ref(storage, storagePath);
  // await uploadBytes(storageRef, blob);
  // return await getDownloadURL(storageRef);
};


// ─────────────────────────────────────────────
//  HELPER: Generate structured document ID
//  Format: pass-{userId}-{timestamp}
// ─────────────────────────────────────────────
export const generatePassDocId = (userId) => {
  return `pass-${userId}-${Date.now()}`;
};


// ─────────────────────────────────────────────
//  NEW HELPER: Find existing incomplete pass for this user
//  "Incomplete" = payment: false (user hasn't paid yet)
//
//  Returns: { docPassId, passData } if found
//           null if not found (user has no pending pass)
//
//  This is the core of the "no duplicate pass" feature.
//  Called in Stage 5 before deciding to create or update.
// ─────────────────────────────────────────────
export const findExistingIncompletePass = async (userId) => {
  // Query passes collection: find docs where userId matches AND payment is false
  const passesQuery = query(
    collection(db, "passes"),
    where("userId", "==", userId),
    where("payment", "==", false),
    limit(1)                          // we only need one — stop after first match
  );

  const querySnapshot = await getDocs(passesQuery);

  if (querySnapshot.empty) {
    return null;                      // no incomplete pass found → create new
  }

  // Found an incomplete pass → return its ID and data
  const docSnap = querySnapshot.docs[0];
  return {
    docPassId: docSnap.id,            // e.g. "pass-uid123-1716000000000"
    passData:  docSnap.data(),        // full document fields for prefilling the form
  };
};


// ─────────────────────────────────────────────
//  STAGE 5 — Save Personal Info
//  TWO MODES:
//   A) existingDocPassId is provided → UPDATE existing doc (user came back)
//   B) existingDocPassId is null     → CREATE new doc (fresh application)
//
//  Called when user presses NEXT on Personal Info screen.
// ─────────────────────────────────────────────
export const savePersonalInfo = async (docPassId, userId, personalData, isUpdate = false) => {
  const { name, dob, gender, mobileNo, email, photoLocalUri } = personalData;

  // ── ENABLE_LATER: uncomment to upload profile photo ──────
  // const photoStoragePath = `passes/${docPassId}/profile_photo.jpg`;
  // const photoProofUrl = await uploadImageToStorage(photoLocalUri, photoStoragePath);
  const photoProofUrl = "";

  const passRef = doc(db, "passes", docPassId);

  if (isUpdate) {
    // ── MODE A: UPDATE existing doc — only overwrite personal info fields ──
    // Does NOT touch timePeriod, passType, amount etc. already saved in Stage 6
    await updateDoc(passRef, {
      userId,
      name,
      dob:          Timestamp.fromDate(new Date(dob)),
      gender,
      mobileNo,
      email,
      photoProofUrl,
    });
  } else {
    // ── MODE B: CREATE fresh doc with all fields ──────────────
    await setDoc(passRef, {
      userId,
      name,
      dob:              Timestamp.fromDate(new Date(dob)),
      gender,
      mobileNo,
      email,
      photoProofUrl,
      timePeriod:       "",
      passType:         "",
      fromDate:         null,
      toDate:           null,
      expiryDate:       null,
      identityProofType: "",
      identityPhotoUrl: "",
      aadharNumber:     "",
      panNumber:        "",
      voterNumber:      "",
      status:           "pending",
      appliedAt:        serverTimestamp(),
      payment:          false,
      amount:           0,
    });
  }
};


// ─────────────────────────────────────────────
//  STAGE 6 — Save Pass Details
//  Always updates — no change needed here.
//  Works for both new and returning users.
// ─────────────────────────────────────────────
export const savePassDetails = async (docPassId, passDetails) => {
  const { timePeriod, passType, fromDate, amount } = passDetails;

  const from   = new Date(fromDate);
  const expiry = calculateExpiryDate(from, timePeriod);

  const passRef = doc(db, "passes", docPassId);
  await updateDoc(passRef, {
    timePeriod,
    passType,
    fromDate:   Timestamp.fromDate(from),
    toDate:     Timestamp.fromDate(expiry),
    expiryDate: Timestamp.fromDate(expiry),
    amount,
  });
};


// ─────────────────────────────────────────────
//  STAGE 7 — Save Identity + Finalize
//  Always updates — no change needed here.
// ─────────────────────────────────────────────
export const saveIdentityAndFinalize = async (docPassId, identityData) => {
  const { identityProofType, identityProofNumber, identityPhotoLocalUri } = identityData;

  // ── ENABLE_LATER: uncomment to upload identity proof photo ──
  // const identityStoragePath = `passes/${docPassId}/identity_proof.jpg`;
  // const identityPhotoUrl = await uploadImageToStorage(identityPhotoLocalUri, identityStoragePath);
  const identityPhotoUrl = "";

  const proofNumberFields = resolveProofNumberFields(identityProofType, identityProofNumber);

  const passRef = doc(db, "passes", docPassId);
  await updateDoc(passRef, {
    identityProofType,
    identityPhotoUrl,
    payment: false,
    ...proofNumberFields,
  });
};


// ─────────────────────────────────────────────
//  INTERNAL HELPER: Calculate expiry date
// ─────────────────────────────────────────────
const calculateExpiryDate = (fromDate, timePeriod) => {
  const expiry = new Date(fromDate);
  switch (timePeriod) {
    case "1 Day":   expiry.setDate(expiry.getDate() + 1);         break;
    case "1 Month": expiry.setMonth(expiry.getMonth() + 1);       break;
    case "3 Month": expiry.setMonth(expiry.getMonth() + 3);       break;
    case "6 Month": expiry.setMonth(expiry.getMonth() + 6);       break;
    case "1 Year":  expiry.setFullYear(expiry.getFullYear() + 1); break;
    default:        expiry.setMonth(expiry.getMonth() + 1);
  }
  return expiry;
};


// ─────────────────────────────────────────────
//  INTERNAL HELPER: Resolve ID number fields
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