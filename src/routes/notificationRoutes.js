import express from "express";
import notificationController from "../controllers/notificationController.js";

const router = express.Router();

// Get all notifications (with pagination)
router.get("/", notificationController.getAll);

// Get unread count (for badge)
router.get("/unread-count", notificationController.getUnreadCount);

// Mark all as read
router.patch("/mark-all-read", notificationController.markAllAsRead);

// Get notification by ID
router.get("/:id", notificationController.getById);

// Create notification
router.post("/", notificationController.create);

// Mark specific notification as read
router.patch("/:id/read", notificationController.markAsRead);

// Update notification
router.put("/:id", notificationController.update);

// Delete notification
router.delete("/:id", notificationController.delete);

export default router;
