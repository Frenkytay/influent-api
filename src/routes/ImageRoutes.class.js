import { Router } from "express";
import ImageController from "../controllers/ImageController.class.js";
import UploadMiddleware from "../middlewares/UploadMiddleware.class.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.class.js";

const router = Router();

// ==========================================
// Public Routes
// ==========================================

// Serve uploaded images
// Note: In production, this is often handled by Nginx or S3, but keeping for compatibility
router.get("/uploads/:filename", ImageController.getImage);

// ==========================================
// Protected Routes
// ==========================================

// Upload campaign banner
router.post(
  "/v1/upload/campaign/:id/banner",
  AuthMiddleware.verifyJWT,
  UploadMiddleware.single("banner_image"),
  ImageController.uploadCampaignBanner
);

// Upload campaign references
router.post(
  "/v1/upload/campaign/:id/references",
  AuthMiddleware.verifyJWT,
  UploadMiddleware.multiple("reference_images", 5),
  ImageController.uploadCampaignReferences
);

// Upload user profile image
router.post(
  "/v1/upload/user/:id/profile",
  AuthMiddleware.verifyJWT,
  UploadMiddleware.single("profile_image"),
  ImageController.uploadUserProfile
);

export default router;
