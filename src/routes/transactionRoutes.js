import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getMyTransactions,
  getTransactionById,
  getAllTransactions,
  getBalance,
} from "../controllers/transactionController.js";

const router = express.Router();

// User routes
router.get("/my-transactions", authMiddleware, getMyTransactions);
router.get("/balance", authMiddleware, getBalance);
router.get("/:id", authMiddleware, getTransactionById);

// Admin routes
router.get("/admin/all", authMiddleware, getAllTransactions);

export default router;
