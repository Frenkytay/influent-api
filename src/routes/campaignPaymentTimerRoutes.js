import express from "express";
import campaignPaymentTimerController from "../controllers/campaignPaymentTimerController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Process campaign payment (UMKM only)
router.post("/process", authMiddleware, campaignPaymentTimerController.processPayment);

// Check payment status
router.get("/status/:id", authMiddleware, campaignPaymentTimerController.checkPaymentStatus);

// Cancel payment manually (Admin only)
router.post("/cancel/:id", authMiddleware, campaignPaymentTimerController.cancelPayment);

export default router;
