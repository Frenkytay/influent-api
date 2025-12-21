import express from "express";
import CampaignPaymentController from "../controllers/CampaignPaymentController.class.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.class.js";

const router = express.Router();

// All payment routes require authentication (admin only)
router.post("/pay-student", AuthMiddleware.verifyJWT, CampaignPaymentController.paySingleStudent);
router.post("/pay-all", AuthMiddleware.verifyJWT, CampaignPaymentController.payAllStudents);
router.post("/pay-custom", AuthMiddleware.verifyJWT, CampaignPaymentController.payCustomAmounts);
router.get("/history", AuthMiddleware.verifyJWT, CampaignPaymentController.getCompanyHistory);

export default router;
