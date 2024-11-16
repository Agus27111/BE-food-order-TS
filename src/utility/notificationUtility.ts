/* ------------------- Email --------------------- */

/* ------------------- Notification --------------------- */

/* ------------------- OTP --------------------- */
import dotenv from "dotenv";
dotenv.config();

export const GenerateOtp = () => {
  const otp = Math.floor(10000 + Math.random() * 900000);
  let expiry = new Date();
  expiry.setTime(new Date().getTime() + 30 * 60 * 1000);

  return { otp, expiry };
};

export const onRequestOTP = async (otp: number, toPhoneNumber: string) => {
  try {
    const accountSid = process.env.ACCOUNT_SID_TWILIO;
    const authToken = process.env.AUTH_TOKEN_TWILIO;
    const client = require("twilio")(accountSid, authToken);

    const response = await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.PHONE,
      to: `+62${toPhoneNumber}`,
    });

    return response;

    // const accountSid = process.env.ACCOUNT_SID_TWILIO;
    // const authToken = process.env.AUTH_TOKEN_TWILIO;
    // const client = require("twilio")(accountSid, authToken);

    // client.verify.v2
    //   .services("VA351e2e94f0e9e24f7a9665af7b64a3e6")
    //   .verifications.create({ to: `+62${toPhoneNumber}`, channel: "sms" })
    //   .then((verification) => console.log(verification.status));
  } catch (error) {
    return false;
  }
};

/* ------------------- Payment --------------------- */
