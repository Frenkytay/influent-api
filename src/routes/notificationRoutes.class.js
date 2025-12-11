import express from "express";
import NotificationController from "../controllers/NotificationController.class.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.class.js";

const router = express.Router();

router.get("/", AuthMiddleware.verifyJWT, NotificationController.getAll);
router.get("/unread", AuthMiddleware.verifyJWT, NotificationController.getUnread);
router.post("/mark-all-read", AuthMiddleware.verifyJWT, NotificationController.markAllAsRead);
router.get("/:id", AuthMiddleware.verifyJWT, NotificationController.getById);
router.post("/", AuthMiddleware.verifyJWT, NotificationController.create);
router.put("/:id", AuthMiddleware.verifyJWT, NotificationController.update);
router.put("/:id/read", AuthMiddleware.verifyJWT, NotificationController.markAsRead);
router.delete("/:id", AuthMiddleware.verifyJWT, NotificationController.delete);

export default router;
