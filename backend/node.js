const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendOTP(phoneNumber) {
  return await client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verifications.create({
      to: phoneNumber,
      channel: "sms"   // or "call"
    });
}
async function verifyOTP(phoneNumber, otp) {
  const verificationCheck = await client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verificationChecks.create({
      to: phoneNumber,
      code: otp
    });

  return verificationCheck.status; // approved / pending / denied
}