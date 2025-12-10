import nodemailer from "nodemailer";

// Configure email transporter
// For development, you can use services like Gmail, Mailtrap, or SendGrid
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // Your email
    pass: process.env.SMTP_PASS, // Your email password or app password
  },
  authMethod: "LOGIN", // Brevo requires LOGIN method
  debug: true, // Enable debug output
  logger: true, // Log to console
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Send OTP email to user
 */
export const sendOTPEmail = async (email, otp, name) => {
  try {
    const fromName = process.env.SMTP_FROM_NAME || "Influent Platform";
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: "Verify Your Email - Influent Platform",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .otp-box { background: white; border: 2px dashed #4F46E5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 10px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Verification</h1>
            </div>
            <div class="content">
              <p>Hello ${name || "User"},</p>
              <p>Thank you for registering with Influent Platform! To complete your registration, please verify your email address using the OTP code below:</p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #666;">This code expires in 10 minutes</p>
              </div>

              <p>Enter this code on the verification page to activate your account.</p>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong> Never share this code with anyone. Our team will never ask for your OTP code.
              </div>

              <p>If you didn't request this code, please ignore this email or contact our support team.</p>
              
              <p>Best regards,<br>The Influent Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>&copy; 2025 Influent Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hello ${
        name || "User"
      },\n\nYour OTP code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this code, please ignore this email.\n\nBest regards,\nThe Influent Team`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("OTP Email sent successfully:", info.messageId);
    if (process.env.NODE_ENV === "development") {
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    }
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    console.error("Error details:", error.message);
    return false;
  }
};

/**
 * Send password reset OTP email
 */
export const sendPasswordResetOTP = async (email, otp, name) => {
  try {
    const fromName = process.env.SMTP_FROM_NAME || "Influent Platform";
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: "Password Reset OTP - Influent Platform",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .otp-box { background: white; border: 2px dashed #EF4444; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #EF4444; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .warning { background: #FEE2E2; border-left: 4px solid #EF4444; padding: 10px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello ${name || "User"},</p>
              <p>We received a request to reset your password. Use the OTP code below to proceed:</p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #666;">This code expires in 10 minutes</p>
              </div>

              <p>Enter this code on the password reset page to create a new password.</p>

              <div class="warning">
                <strong>⚠️ Security Alert:</strong> If you didn't request a password reset, please ignore this email and ensure your account is secure. Consider changing your password if you suspect unauthorized access.
              </div>

              <p>Best regards,<br>The Influent Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>&copy; 2025 Influent Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hello ${
        name || "User"
      },\n\nYour password reset OTP code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nThe Influent Team`,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending password reset OTP email:", error);
    return false;
  }
};

/**
 * Send welcome email after successful verification
 */
export const sendWelcomeEmail = async (email, name) => {
  try {
    const fromName = process.env.SMTP_FROM_NAME || "Influent Platform";
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: "Welcome to Influent Platform! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Influent! 🎉</h1>
            </div>
            <div class="content">
              <p>Hello ${name},</p>
              <p>Your email has been successfully verified! Welcome to the Influent Platform.</p>
              <p>You can now:</p>
              <ul>
                <li>Browse and apply for campaigns</li>
                <li>Connect with brands and companies</li>
                <li>Build your influencer profile</li>
                <li>Track your campaign performance</li>
              </ul>
              <center>
                <a href="${
                  process.env.FRONTEND_URL || "http://localhost:3000"
                }/dashboard" class="button">Go to Dashboard</a>
              </center>
              <p>If you have any questions, feel free to reach out to our support team.</p>
              <p>Best regards,<br>The Influent Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Influent Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return false;
  }
};

/**
 * Send withdrawal request confirmation email
 */
export const sendWithdrawalRequestEmail = async (
  email,
  name,
  amount,
  withdrawalId
) => {
  try {
    const fromName = process.env.SMTP_FROM_NAME || "Influent Platform";
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: "Withdrawal Request Received - Influent Platform",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #F59E0B; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .info-box { background: white; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 Withdrawal Request Received</h1>
            </div>
            <div class="content">
              <p>Hello ${name},</p>
              <p>We have received your withdrawal request. Our admin team will review it shortly.</p>
              
              <div class="info-box">
                <strong>Withdrawal Details:</strong><br>
                Request ID: #${withdrawalId}<br>
                Amount: Rp ${parseFloat(amount).toLocaleString("id-ID")}
              </div>

              <p>You will receive an email notification once your withdrawal has been processed.</p>
              
              <p>Best regards,<br>The Influent Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Influent Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending withdrawal request email:", error);
    return false;
  }
};

/**
 * Send withdrawal completed email with transfer proof
 */
export const sendWithdrawalCompletedEmail = async (
  email,
  name,
  amount,
  withdrawalId,
  transferProofUrl
) => {
  try {
    const fromName = process.env.SMTP_FROM_NAME || "Influent Platform";
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: "Withdrawal Completed - Influent Platform",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .info-box { background: white; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0; }
            .button { display: inline-block; background: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Withdrawal Completed</h1>
            </div>
            <div class="content">
              <p>Hello ${name},</p>
              <p>Great news! Your withdrawal request has been processed and the money has been transferred to your account.</p>
              
              <div class="info-box">
                <strong>Transfer Details:</strong><br>
                Request ID: #${withdrawalId}<br>
                Amount: Rp ${parseFloat(amount).toLocaleString("id-ID")}<br>
                Status: Completed
              </div>

              <p>Please check your bank account. The transfer should appear within 1-3 business days depending on your bank.</p>

              ${
                transferProofUrl
                  ? `
              <center>
                <a href="${transferProofUrl}" class="button">View Transfer Proof</a>
              </center>
              `
                  : ""
              }

              <p>If you have any questions or don't receive the funds within 3 business days, please contact our support team.</p>
              
              <p>Best regards,<br>The Influent Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Influent Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending withdrawal completed email:", error);
    return false;
  }
};

/**
 * Send withdrawal rejected email
 */
export const sendWithdrawalRejectedEmail = async (
  email,
  name,
  amount,
  withdrawalId,
  reason
) => {
  try {
    const fromName = process.env.SMTP_FROM_NAME || "Influent Platform";
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: "Withdrawal Request Rejected - Influent Platform",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .info-box { background: white; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Withdrawal Request Rejected</h1>
            </div>
            <div class="content">
              <p>Hello ${name},</p>
              <p>Unfortunately, your withdrawal request has been rejected by our admin team.</p>
              
              <div class="info-box">
                <strong>Request Details:</strong><br>
                Request ID: #${withdrawalId}<br>
                Amount: Rp ${parseFloat(amount).toLocaleString("id-ID")}<br>
                Status: Rejected
                ${reason ? `<br><br><strong>Reason:</strong><br>${reason}` : ""}
              </div>

              <p>The funds have been returned to your account balance. If you have any questions, please contact our support team.</p>
              
              <p>Best regards,<br>The Influent Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Influent Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending withdrawal rejected email:", error);
    return false;
  }
};

export default {
  sendOTPEmail,
  sendPasswordResetOTP,
  sendWelcomeEmail,
  sendWithdrawalRequestEmail,
  sendWithdrawalCompletedEmail,
  sendWithdrawalRejectedEmail,
};
