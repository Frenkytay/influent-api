import express from "express";
import userRoutes from "./userRoutes.js";
import studentRoutes from "./studentRoutes.js";
import campaignRoutes from "./campaignRoutes.js";
import campaignUsersRoutes from "./campaignUsersRoutes.js";
import chatRoomRoutes from "./chatRoomRoutes.js";
import chatMessageRoutes from "./chatMessageRoutes.js";
import reviewRoutes from "./reviewRoutes.js";
import notificationRoutes from "./notificationRoutes.js";

const router = express.Router();
router.use("/v1/users", userRoutes);
router.use("/v1/students", studentRoutes);
router.use("/v1/campaigns", campaignRoutes);
router.use("/v1/campaign-users", campaignUsersRoutes);
router.use("/v1/chat-rooms", chatRoomRoutes);
router.use("/v1/chat-messages", chatMessageRoutes);
router.use("/v1/reviews", reviewRoutes);
router.use("/v1/notifications", notificationRoutes);

export default router;
