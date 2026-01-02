import BaseController from "../core/BaseController.js";
import Campaign from "../models/Campaign.js";
import User from "../models/User.js";

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
   * @deprecated - Cloudinary serves images directly via URL
   */
  getImage = this.asyncHandler(async (req, res) => {
    // This endpoint is effectively deprecated for new uploads
    // We could redirect to Cloudinary if we stored the public_id, but we store full URLs now.
    return this.sendError(res, "This endpoint is deprecated. Please use the direct image URL.", 410);
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
      return this.sendError(res, "Campaign not found", 404);
    }

    // Cloudinary returns the full URL in file.path
    const bannerUrl = req.file.path;
    await campaign.update({ banner_image: bannerUrl });

    this.sendSuccess(res, {
      message: "Banner image uploaded successfully",
      banner_image: bannerUrl,
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
      return this.sendError(res, "Campaign not found", 404);
    }

    // Map to Cloudinary URLs
    const fileUrls = req.files.map((file) => file.path);
    
    // In a real app, you might want to merge with existing or replace. 
    // The legacy code replaced it.
    await campaign.update({
      reference_images: JSON.stringify(fileUrls),
    });

    this.sendSuccess(res, {
      message: "Reference images uploaded successfully",
      reference_images: fileUrls,
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
        return this.sendError(res, "User not found", 404);
    }

    const profileUrl = req.file.path;
    await user.update({ profile_image: profileUrl });

    this.sendSuccess(res, {
      message: "Profile image uploaded successfully",
      profile_image: profileUrl,
    });
  });

  // deleteFile helper is removed as we don't manage local files anymore
}

export default new ImageController();
