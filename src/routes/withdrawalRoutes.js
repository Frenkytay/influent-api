import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import uploadMiddleware from "../middlewares/uploadMiddleware.js";
import {
  requestWithdrawal,
  getAllWithdrawals,
  getMyWithdrawals,
  getWithdrawalById,
  completeWithdrawal,
  rejectWithdrawal,
  approveWithdrawal,
  cancelWithdrawal,
} from "../controllers/withdrawalController.js";

const router = express.Router();

// User routes
router.post("/request", authMiddleware, requestWithdrawal);
router.get("/my-withdrawals", authMiddleware, getMyWithdrawals);
router.get("/:id", authMiddleware, getWithdrawalById);
router.delete("/:id/cancel", authMiddleware, cancelWithdrawal);

// Admin routes
router.get("/admin/all", authMiddleware, getAllWithdrawals);
router.put("/:id/approve", authMiddleware, approveWithdrawal);
router.put("/:id/reject", authMiddleware, rejectWithdrawal);
router.put(
  "/:id/complete",
  authMiddleware,
  uploadMiddleware.single("transfer_proof"),
  completeWithdrawal
);

export default router;
