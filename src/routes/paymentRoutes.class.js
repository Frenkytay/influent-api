import { Router } from "express";
import PaymentController from "../controllers/PaymentController.class.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.class.js";

const router = Router();

// Create payment (protected)
router.post("/create", AuthMiddleware.verifyJWT, PaymentController.createPayment);

// Midtrans notification webhook (public - Midtrans will call this)
router.post("/notification", PaymentController.handleNotification);

// Handle return from Midtrans (public)
router.get("/return", PaymentController.handleReturn);

// Get payment details (protected)
router.get("/:id", AuthMiddleware.verifyJWT, PaymentController.getPayment);

// Get payments by campaign (protected)
router.get("/campaign/:campaign_id", AuthMiddleware.verifyJWT, PaymentController.getPaymentsByCampaign);

// Get payments by user (protected)
router.get("/user/:user_id", AuthMiddleware.verifyJWT, PaymentController.getPaymentsByUser);

export default router;
