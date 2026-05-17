import {
  sendOtpService,
  verifyOtpService,
} from "../services/authService";

export const sendOtpController = async (
  phoneNumber,
  recaptchaVerifier
) => {
  if (!phoneNumber) {
    return {
      success: false,
      error: "Phone number required",
    };
  }

  return await sendOtpService(
    phoneNumber,
    recaptchaVerifier
  );
};

export const verifyOtpController = async (
  verificationId,
  otp
) => {
  if (!otp) {
    return {
      success: false,
      error: "OTP required",
    };
  }

  return await verifyOtpService(
    verificationId,
    otp
  );
};