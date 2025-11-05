import express from "express";
import authController from "../controllers/authController.js";

const router = express.Router();

// Register new user
router.post("/register", authController.register);
// Login
router.post("/login", authController.login);
// Forgot password - returns reset token in response (for dev)
router.post("/forgot", authController.forgotPassword);
// Reset password
router.post("/reset", authController.resetPassword);

export default router;
