import express from "express";
import authController from "../controllers/authController.js";

const router = express.Router();

// Register new user (sends OTP)
router.post("/register", authController.register);
// Verify OTP after registration
router.post("/verify-otp", authController.verifyOTP);
// Resend OTP
router.post("/resend-otp", authController.resendOTP);
// Login (requires verified email)
router.post("/login", authController.login);
// Forgot password (sends OTP)
router.post("/forgot-password", authController.forgotPassword);
// Verify OTP for password reset
router.post("/verify-reset-otp", authController.verifyResetOTP);
// Reset password with verified token
router.post("/reset-password", authController.resetPassword);

export default router;
