import express from "express";
import umkmController from "../controllers/umkmController.js";

const router = express.Router();

/**
 * UMKM Dashboard Routes
 * All routes require authentication
 */

// Get dashboard statistics
router.get("/dashboard/stats", umkmController.getDashboardStats);

export default router;
