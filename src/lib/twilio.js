import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};
const sendOTP = async (phone, otp) => {
  try {
    const message = await client.messages.create({
      body: `Cupidcart verification code is: ${otp}\n\nDo not share this code with anyone. Valid for 5 minutes only.`,
      from: "+13368913582",
      to: `+91${phone}`,
    });
    console.log(`OTP sent successfully: ${message.sid}`);
    return { success: true };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { success: false, error: error.message };
  }
};

const validateOTP = (storedOTP, inputOTP) => {
  return storedOTP === inputOTP;
};

export { generateOTP, sendOTP, validateOTP };
