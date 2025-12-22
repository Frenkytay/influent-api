import express from "express";
import AuthController from "../controllers/AuthController.class.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.class.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/verify-otp", AuthController.verifyOTP);
router.post("/resend-otp", AuthController.resendOTP);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);

// Instagram Auth
router.get("/instagram/url", AuthController.getInstagramAuthUrl);
router.post("/instagram/login", AuthController.instagramLogin);

// Protected routes (require authentication)
router.post("/change-password", AuthMiddleware.verifyJWT, AuthController.changePassword);
router.get("/me", AuthMiddleware.verifyJWT, AuthController.getMe);

export default router;
