import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  sendOTPEmail,
  sendPasswordResetOTP,
  sendWelcomeEmail,
} from "../utils/emailService.js";

const JWT_SECRET = process.env.JWT_SECRET || "please_change_me_in_production";
// Set default token expiry to 5 hours. Can be overridden with JWT_EXPIRES_IN env var (e.g. '5h')
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "5h";
const RESET_EXPIRES = process.env.RESET_EXPIRES || "1h";
const OTP_EXPIRES_MINUTES = 10; // OTP expires in 10 minutes
const MAX_OTP_ATTEMPTS = 5; // Maximum failed attempts before blocking

// Helper to sign auth tokens
function signAuthToken(user) {
  const payload = {
    sub: user.user_id || user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Generate random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Register a new user (sends OTP, doesn't create token yet)
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ error: "name, email, password and role are required" });
    }

    // Validate that email ends with .ac.id for student role
    if (role === "student" && !email.toLowerCase().endsWith(".ac.id")) {
      return res.status(400).json({
        error: "Student accounts must use an academic email ending with .ac.id",
      });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing)
      return res.status(409).json({ error: "Email already in use" });

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      email_verified: false,
      otp_code: otp,
      otp_expires_at: otpExpiresAt,
      otp_attempts: 0,
    });

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, name);

    if (!emailSent) {
      console.error("Failed to send OTP email to", email);
      // Still return success but log the error
    }

    return res.status(201).json({
      message:
        "Registration successful. Please verify your email with the OTP sent to your inbox.",
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        email_verified: false,
      },
      // In development, return OTP in response (remove in production)
      ...(process.env.NODE_ENV !== "production" && { otp }),
    });
  } catch (err) {
    console.error("Register error", err.message);
    return res.status(500).json({ error: "Registration failed" });
  }
};

// Verify OTP and activate account
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "email and otp are required" });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.email_verified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    // Check if OTP attempts exceeded
    if (user.otp_attempts >= MAX_OTP_ATTEMPTS) {
      return res.status(429).json({
        error: "Too many failed attempts. Please request a new OTP.",
      });
    }

    // Check if OTP expired
    if (!user.otp_expires_at || new Date() > user.otp_expires_at) {
      return res.status(400).json({
        error: "OTP has expired. Please request a new one.",
      });
    }

    // Verify OTP
    if (user.otp_code !== otp) {
      await user.update({ otp_attempts: user.otp_attempts + 1 });
      return res.status(400).json({
        error: "Invalid OTP code",
        attempts_remaining: MAX_OTP_ATTEMPTS - (user.otp_attempts + 1),
      });
    }

    // OTP is valid - verify email and clear OTP data
    await user.update({
      email_verified: true,
      otp_code: null,
      otp_expires_at: null,
      otp_attempts: 0,
    });

    // Send welcome email
    await sendWelcomeEmail(email, user.name);

    // Generate auth token
    const token = signAuthToken(user);

    return res.json({
      message: "Email verified successfully",
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        email_verified: true,
      },
    });
  } catch (err) {
    console.error("Verify OTP error", err.message);
    return res.status(500).json({ error: "OTP verification failed" });
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.email_verified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);

    await user.update({
      otp_code: otp,
      otp_expires_at: otpExpiresAt,
      otp_attempts: 0, // Reset attempts
    });

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, user.name);

    if (!emailSent) {
      return res.status(500).json({ error: "Failed to send OTP email" });
    }

    return res.json({
      message: "OTP has been resent to your email",
      // In development, return OTP in response (remove in production)
      ...(process.env.NODE_ENV !== "production" && { otp }),
    });
  } catch (err) {
    console.error("Resend OTP error", err.message);
    return res.status(500).json({ error: "Failed to resend OTP" });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email and password required" });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json({
        error:
          "Email not verified. Please verify your email before logging in.",
        email_verified: false,
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = signAuthToken(user);
    return res.json({
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        email_verified: user.email_verified,
      },
    });
  } catch (err) {
    console.error("Login error", err.message);
    return res.status(500).json({ error: "Login failed" });
  }
};

// Forgot password - sends OTP to email
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email required" });

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      return res.json({
        message: "If an account exists with this email, an OTP has been sent.",
      });
    }

    // Generate OTP for password reset
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);

    await user.update({
      otp_code: otp,
      otp_expires_at: otpExpiresAt,
      otp_attempts: 0, // Reset attempts for new reset request
    });

    // Send OTP email
    const emailSent = await sendPasswordResetOTP(email, otp, user.name);

    if (!emailSent) {
      console.error("Failed to send password reset OTP to", email);
    }

    return res.json({
      message: "If an account exists with this email, an OTP has been sent.",
      // In development, return OTP in response (remove in production)
      ...(process.env.NODE_ENV !== "production" && { otp }),
    });
  } catch (err) {
    console.error("forgotPassword error", err.message);
    return res.status(500).json({ error: "Failed to send reset OTP" });
  }
};

// Verify OTP for password reset
export const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "email and otp are required" });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if OTP attempts exceeded
    if (user.otp_attempts >= MAX_OTP_ATTEMPTS) {
      return res.status(429).json({
        error: "Too many failed attempts. Please request a new OTP.",
      });
    }

    // Check if OTP expired
    if (!user.otp_expires_at || new Date() > user.otp_expires_at) {
      return res.status(400).json({
        error: "OTP has expired. Please request a new one.",
      });
    }

    // Verify OTP
    if (user.otp_code !== otp) {
      await user.update({ otp_attempts: user.otp_attempts + 1 });
      return res.status(400).json({
        error: "Invalid OTP code",
        attempts_remaining: MAX_OTP_ATTEMPTS - (user.otp_attempts + 1),
      });
    }

    // OTP is valid - generate a temporary reset token
    const resetToken = jwt.sign(
      { sub: user.user_id, email: user.email, purpose: "reset" },
      JWT_SECRET,
      { expiresIn: "15m" } // Reset token valid for 15 minutes
    );

    // Clear OTP data
    await user.update({
      otp_code: null,
      otp_expires_at: null,
      otp_attempts: 0,
    });

    return res.json({
      message: "OTP verified successfully. You can now reset your password.",
      resetToken,
    });
  } catch (err) {
    console.error("verifyResetOTP error", err.message);
    return res.status(500).json({ error: "OTP verification failed" });
  }
};

// Reset password using verified token
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, password } = req.body;
    if (!resetToken || !password)
      return res
        .status(400)
        .json({ error: "resetToken and new password required" });

    let payload;
    try {
      payload = jwt.verify(resetToken, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    if (payload.purpose !== "reset")
      return res.status(400).json({ error: "Invalid token purpose" });

    const user = await User.findByPk(payload.sub);
    if (!user) return res.status(404).json({ error: "User not found" });

    const hashed = await bcrypt.hash(password, 10);
    await user.update({ password: hashed });

    return res.json({
      message:
        "Password reset successfully. You can now login with your new password.",
    });
  } catch (err) {
    console.error("resetPassword error", err.message);
    return res.status(500).json({ error: "Failed to reset password" });
  }
};

export default {
  register,
  login,
  verifyOTP,
  resendOTP,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
};
