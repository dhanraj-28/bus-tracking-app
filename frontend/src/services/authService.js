import {
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";

import { auth } from "../config/firebase";
import {
  createUserInFirestore
} from "../services/userService";

export const sendOtpService = async (
  phoneNumber,
  recaptchaVerifier
) => {
  try {
    const phoneProvider = new PhoneAuthProvider(auth);

    const verificationId = await phoneProvider.verifyPhoneNumber(
      phoneNumber,
      recaptchaVerifier
    );

    return {
      success: true,
      verificationId,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const verifyOtpService = async (
  verificationId,
  otp
) => {
  try {
    const credential = PhoneAuthProvider.credential(
      verificationId,
      otp
    );

    const userCredential = await signInWithCredential(
      auth,
      credential
    );
    const user = userCredential.user;

    await createUserInFirestore(user);

    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};