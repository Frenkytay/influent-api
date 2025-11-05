import express from "express";
import paymentController from "../controllers/paymentController.js";

const router = express.Router();

// Create payment for a campaign
router.post("/", paymentController.createPayment);

// Midtrans will send notification to this endpoint
router.post("/notification", paymentController.notification);

// Get payment by order_id or payment_id
// Return/redirect handler for Midtrans after payment
router.get("/return", paymentController.handleReturn);
// Get payment by order_id or payment_id
router.get("/:id", paymentController.getPayment);

export default router;
