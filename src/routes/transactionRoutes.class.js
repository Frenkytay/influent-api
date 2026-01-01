import express from "express";
import TransactionController from "../controllers/TransactionController.class.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.class.js";

const router = express.Router();

// User routes
router.get("/my-transactions", AuthMiddleware.verifyJWT, TransactionController.getMyTransactions);
router.get("/refunds", AuthMiddleware.verifyJWT, TransactionController.getRefunds);
router.get("/balance", AuthMiddleware.verifyJWT, TransactionController.getBalance);

// Admin routes
router.get("/admin/all", AuthMiddleware.verifyJWT, TransactionController.getAllTransactions);
router.get("/:id", AuthMiddleware.verifyJWT, TransactionController.getTransactionById);

export default router;
