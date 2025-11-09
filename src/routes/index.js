import express from "express";
import attachUser from "../middlewares/attachUser.js";
import userRoutes from "./userRoutes.js";
import studentRoutes from "./studentRoutes.js";
import campaignRoutes from "./campaignRoutes.js";
import campaignUsersRoutes from "./campaignUsersRoutes.js";
import campaignContentTypesRoutes from "./campaignContentTypes.js";
import chatRoomRoutes from "./chatRoomRoutes.js";
import chatMessageRoutes from "./chatMessageRoutes.js";
import reviewRoutes from "./reviewRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import imageRoutes from "./imageRoutes.js";
import uploadRoutes from "./uploadRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import authRoutes from "./authRoutes.js";
import swaggerRoutes from "./swaggerRoutes.js";

const router = express.Router();
// Attach user info (if Authorization Bearer token provided) on every request.
// This middleware is non-blocking and only populates req.user when a valid token is present.
router.use(attachUser);
router.use("/v1/users", userRoutes);
router.use("/v1/students", studentRoutes);
router.use("/v1/campaigns", campaignRoutes);
router.use("/v1/campaign-users", campaignUsersRoutes);
router.use("/v1/campaign-content-types", campaignContentTypesRoutes);
router.use("/v1/chat-rooms", chatRoomRoutes);
router.use("/v1/chat-messages", chatMessageRoutes);
router.use("/v1/reviews", reviewRoutes);
router.use("/v1/notifications", notificationRoutes);
router.use("/uploads", imageRoutes);
router.use("/v1/upload", uploadRoutes);
router.use("/v1/payments", paymentRoutes);
router.use("/v1/auth", authRoutes);
// Serve API docs at /api/docs
router.use("/docs", swaggerRoutes);

export default router;
