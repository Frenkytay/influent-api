import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  paySingleStudent,
  payAllStudents,
  payCustomAmounts,
} from "../controllers/campaignPaymentController.js";

const router = express.Router();

// Admin only routes for paying students
router.post("/pay-student", authMiddleware, paySingleStudent);
router.post("/pay-all", authMiddleware, payAllStudents);
router.post("/pay-custom", authMiddleware, payCustomAmounts);

export default router;
