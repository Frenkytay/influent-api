import BaseController from "../core/BaseController.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Campaign from "../models/Campaign.js";
import User from "../models/User.js";
import UploadMiddleware from "../middlewares/UploadMiddleware.class.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ImageController - Handles image uploads and serving
 */
class ImageController extends BaseController {
  constructor() {
    super(null); // No specific service needed for this simple controller
  }

  /**
   * Serve uploaded image
   * GET /uploads/:filename
   */
  getImage = this.asyncHandler(async (req, res) => {
    const filename = req.params.filename;
    // Use the same upload directory as configured in the middleware
    const imagePath = path.join(UploadMiddleware.uploadDir, filename);

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return this.sendError(res, "Image not found", 404);
    }

    // Send the image file
    res.sendFile(imagePath);
  });

  /**
   * Upload campaign banner
   * POST /api/v1/upload/campaign/:id/banner
   */
  uploadCampaignBanner = this.asyncHandler(async (req, res) => {
    const campaignId = req.params.id;
    
    // File validation is handled by middleware
    if (!req.file) {
        return this.sendError(res, "No file uploaded", 400);
    }

    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      // Clean up uploaded file if campaign not found
      this.deleteFile(req.file.path);
      return this.sendError(res, "Campaign not found", 404);
    }

    const bannerPath = `${req.file.filename}`;
    await campaign.update({ banner_image: bannerPath });

    this.sendSuccess(res, {
      message: "Banner image uploaded successfully",
      banner_image: bannerPath,
    });
  });

  /**
   * Upload campaign reference images
   * POST /api/v1/upload/campaign/:id/references
   */
  uploadCampaignReferences = this.asyncHandler(async (req, res) => {
    const campaignId = req.params.id;

    if (!req.files || req.files.length === 0) {
        return this.sendError(res, "No files uploaded", 400);
    }

    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      // Clean up uploaded files if campaign not found
      req.files.forEach(file => this.deleteFile(file.path));
      return this.sendError(res, "Campaign not found", 404);
    }

    const filePaths = req.files.map((file) => `${file.filename}`);
    
    // In a real app, you might want to merge with existing or replace. 
    // The legacy code replaced it.
    await campaign.update({
      reference_images: JSON.stringify(filePaths),
    });

    this.sendSuccess(res, {
      message: "Reference images uploaded successfully",
      reference_images: filePaths,
    });
  });

  /**
   * Upload user profile image
   * POST /api/v1/upload/user/:id/profile
   */
  uploadUserProfile = this.asyncHandler(async (req, res) => {
    const userId = req.params.id;

    if (!req.file) {
        return this.sendError(res, "No file uploaded", 400);
    }

    const user = await User.findByPk(userId);
    if (!user) {
        this.deleteFile(req.file.path);
        return this.sendError(res, "User not found", 404);
    }

    const profilePath = `${req.file.filename}`;
    await user.update({ profile_image: profilePath });

    this.sendSuccess(res, {
      message: "Profile image uploaded successfully",
      profile_image: profilePath,
    });
  });

  /**
   * Helper to delete file
   */
  deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error("Error deleting file:", err);
    }
  }
}

export default new ImageController();
