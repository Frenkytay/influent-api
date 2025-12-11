import dotenv from "dotenv";
import EmailService from "./src/services/EmailService.js";

dotenv.config();

// Test email sending
const testEmail = async () => {
  console.log("Testing email configuration...");
  console.log("SMTP_HOST:", process.env.SMTP_HOST);
  console.log("SMTP_PORT:", process.env.SMTP_PORT);
  console.log("SMTP_USER:", process.env.SMTP_USER);
  console.log("SMTP_FROM:", process.env.SMTP_FROM);
  console.log("---");

  const testOTP = "123456";
  const testEmailAddress = "frenky002@binus.ac.id"; // Change this to your email
  const testName = "Test User";

  console.log(`Sending test OTP email to: ${testEmailAddress}`);

  const result = await EmailService.sendOTPEmail(testEmailAddress, testName, testOTP);

  if (result) {
    console.log("✅ Email sent successfully!");
    console.log("Check your inbox at:", testEmailAddress);
  } else {
    console.log("❌ Email failed to send. Check the error logs above.");
  }

  process.exit(0);
};

testEmail();
