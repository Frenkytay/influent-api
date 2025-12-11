import express from "express";
import WithdrawalController from "../controllers/WithdrawalController.class.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.class.js";
import UploadMiddleware from "../middlewares/UploadMiddleware.class.js";

const router = express.Router();

// User routes
router.post("/request", AuthMiddleware.verifyJWT, WithdrawalController.requestWithdrawal);
router.get("/my-withdrawals", AuthMiddleware.verifyJWT, WithdrawalController.getMyWithdrawals);
router.delete("/:id/cancel", AuthMiddleware.verifyJWT, WithdrawalController.cancelWithdrawal);

// Admin routes
router.get("/admin/all", AuthMiddleware.verifyJWT, WithdrawalController.getAllWithdrawals);
router.get("/:id", AuthMiddleware.verifyJWT, WithdrawalController.getWithdrawalById);
router.put("/:id/approve", AuthMiddleware.verifyJWT, WithdrawalController.approveWithdrawal);
router.put("/:id/complete", AuthMiddleware.verifyJWT, UploadMiddleware.single("transfer_proof"), WithdrawalController.completeWithdrawal);
router.put("/:id/reject", AuthMiddleware.verifyJWT, WithdrawalController.rejectWithdrawal);

export default router;
