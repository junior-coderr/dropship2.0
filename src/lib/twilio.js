import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Add credentials check
if (!accountSid || !authToken) {
  console.error('Twilio credentials missing:', {
    hasSID: !!accountSid,
    hasToken: !!authToken
  });
}

const client = twilio(accountSid, authToken);

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const sendOTP = async (phone, message) => {
  try {
    if (!phone) {
      console.error('No phone number provided for SMS');
      return { success: false, error: 'No phone number provided' };
    }

    console.log('Attempting to send SMS to:', `+91${phone}`);
    
    // For OTP verification, message will be a number (the OTP)
    // For notifications, message will be a string
    const messageText = typeof message === 'number' || /^\d+$/.test(message)
      ? `Cupidcart verification code is: ${message}\n\nDo not share this code with anyone. Valid for 5 minutes only.`
      : message;

    const twilioMessage = await client.messages.create({
      body: messageText,
      from: "+13368913582",
      to: `+91${phone}`,
    });
    
    console.log(`Message sent successfully: ${twilioMessage.sid}`);
    return { success: true, messageId: twilioMessage.sid };
  } catch (error) {
    console.error("Error sending message:", {
      error: error.message,
      code: error.code,
      phone: phone,
      twilioError: error.toString()
    });
    return { success: false, error: error.message };
  }
};

const validateOTP = (storedOTP, inputOTP) => {
  return storedOTP === inputOTP;
};

export { generateOTP, sendOTP, validateOTP };
