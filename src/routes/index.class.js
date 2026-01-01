import express from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware.class.js";

// ============================================
// CLASS-BASED ROUTES (OOP Architecture) ✅
// ============================================
import authRoutesClass from "./authRoutes.class.js";
import userRoutesClass from "./userRoutes.class.js";
import campaignRoutesClass from "./campaignRoutes.class.js";
import studentRoutesClass from "./studentRoutes.class.js";
import campaignUsersRoutesClass from "./campaignUsersRoutes.class.js";
import campaignContentTypesRoutesClass from "./campaignContentTypes.class.js";
import chatRoomRoutesClass from "./chatRoomRoutes.class.js";
import chatMessageRoutesClass from "./chatMessageRoutes.class.js";
import reviewRoutesClass from "./reviewRoutes.class.js";
import notificationRoutesClass from "./notificationRoutes.class.js";
import withdrawalRoutesClass from "./withdrawalRoutes.class.js";
import campaignPaymentRoutesClass from "./campaignPaymentRoutes.class.js";
import transactionRoutesClass from "./transactionRoutes.class.js";
import workSubmissionRoutesClass from "./workSubmissionRoutes.class.js";
import postSubmissionRoutesClass from "./postSubmissionRoutes.class.js";
// import paymentRoutesClass from "./paymentRoutes.class.js";
import paymentRoutesClass from "./paymentRoutes.class.js";
import imageRoutesClass from "./ImageRoutes.class.js";
import adminRoutesClass from "./adminRoutes.class.js";

// ============================================
// LEGACY ROUTES (Still functional)
// ============================================
import swaggerRoutes from "./swaggerRoutes.js";

const router = express.Router();

// Attach user info (if Authorization Bearer token provided) on every request.
// This middleware is non-blocking and only populates req.user when a valid token is present.
router.use(AuthMiddleware.attachUser);

// ============================================
// CLASS-BASED ROUTES (100% OOP) ✅
// ============================================
router.use("/v1/auth", authRoutesClass);
router.use("/v1/users", userRoutesClass);
router.use("/v1/campaigns", campaignRoutesClass);
router.use("/v1/students", studentRoutesClass);
router.use("/v1/campaign-users", campaignUsersRoutesClass);
router.use("/v1/campaign-content-types", campaignContentTypesRoutesClass);
router.use("/v1/chat-rooms", chatRoomRoutesClass);
router.use("/v1/chat-messages", chatMessageRoutesClass);
router.use("/v1/reviews", reviewRoutesClass);
router.use("/v1/notifications", notificationRoutesClass);
router.use("/v1/withdrawals", withdrawalRoutesClass);
router.use("/v1/campaign-payments", campaignPaymentRoutesClass);
router.use("/v1/transactions", transactionRoutesClass);
router.use("/v1/work-submissions", workSubmissionRoutesClass);
router.use("/v1/post-submissions", postSubmissionRoutesClass);
router.use("/v1/payments", paymentRoutesClass);
router.use("/v1/admin", adminRoutesClass);

// Image and Upload Routes (OOP)
router.use("/", imageRoutesClass);

// ============================================
// LEGACY ROUTES (File uploads, API docs)
// ============================================
// router.use("/uploads", imageRoutes); // Replaced by imageRoutesClass
// router.use("/v1/upload", uploadRoutes); // Replaced by imageRoutesClass

// Serve API docs at /api/docs
router.use("/docs", swaggerRoutes);

export default router;

/**
 * 🎉 OOP MIGRATION COMPLETE - 100%
 * ================================
 * 
 * ✅ Auth - Repository → Service → Controller
 * ✅ Users - Repository → Service → Controller
 * ✅ Campaigns - Repository → Service → Controller
 * ✅ Students - Repository → Service → Controller
 * ✅ CampaignUsers - Repository → Service → Controller
 * ✅ CampaignContentTypes - Repository → Service → Controller
 * ✅ ChatRoom - Repository → Service → Controller
 * ✅ ChatMessage - Repository → Service → Controller
 * ✅ Reviews - Repository → Service → Controller
 * ✅ Notifications - Repository → Service → Controller
 * ✅ WorkSubmissions - Repository → Service → Controller
 * ✅ Withdrawals - Repository → Service → Controller
 * ✅ Payments (Midtrans) - Repository → Service → Controller
 * ✅ CampaignPayments - Repository → Service → Controller
 * ✅ Transactions - Repository → Service → Controller
 * 
 * ✅ EmailService - Class-based service
 * ✅ PaymentDistributionService - Class-based service
 * ✅ ChatSocketHandler - Class-based WebSocket handler
 * ✅ AuthMiddleware - Class-based middleware
 * ✅ ErrorHandler - Class-based middleware
 * ✅ UploadMiddleware - Class-based middleware
 * 
 * 📁 Architecture:
 * - 15 Repositories (data access layer)
 * - 17 Services (business logic layer)
 * - 15 Controllers (HTTP handling layer)
 * - 15 Routes (endpoint definitions)
 * - 3 Base classes (BaseRepository, BaseService, BaseController)
 * - 3 Middleware classes
 * - 3 Utility services (Email, PaymentDistribution, ChatSocket)
 */
