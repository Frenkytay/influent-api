import BaseController from "../core/BaseController.js";
import CampaignService from "../services/CampaignService.js";

/**
 * CampaignController - Handles HTTP requests for Campaign endpoints
 */
class CampaignController extends BaseController {
  constructor() {
    super(CampaignService);
  }

  /**
   * Get all campaigns with filters
   * GET /api/v1/campaigns
   */
  getAll = this.asyncHandler(async (req, res) => {
    const { status, user_id, title, campaign_category, sort, order } =
      req.query;

    const campaigns = await this.service.getAll(
      { status, user_id, title, campaign_category },
      { sort, order },
      req.user // Pass authenticated user for filtering
    );

    this.sendSuccess(res, campaigns);
  });

  /**
   * Get campaign by ID
   * GET /api/v1/campaigns/:id
   */
  getById = this.asyncHandler(async (req, res) => {
    const campaign = await this.service.getById(req.params.id);
    this.sendSuccess(res, campaign);
  });

  /**
   * Get campaigns by category
   * GET /api/v1/campaigns/category/:category
   */
  getByCategory = this.asyncHandler(async (req, res) => {
    const { category } = req.params;
    const { sort, order } = req.query;

    const campaigns = await this.service.getByCategory(category, {
      sort,
      order,
    });

    this.sendSuccess(res, campaigns);
  });

  /**
   * Create new campaign
   * POST /api/v1/campaigns
   */
  create = this.asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
      return this.sendError(res, "Unauthorized", 401);
    }

    const campaign = await this.service.create(req.body, req.user.id);
    this.sendSuccess(res, campaign, 201);
  });

  /**
   * Update campaign
   * PUT /api/v1/campaigns/:id
   */
  update = this.asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
      return this.sendError(res, "Unauthorized", 401);
    }

    const campaign = await this.service.update(
      req.params.id,
      req.body,
      req.user
    );
    this.sendSuccess(res, campaign);
  });

  /**
   * Delete campaign
   * DELETE /api/v1/campaigns/:id
   */
  delete = this.asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
      return this.sendError(res, "Unauthorized", 401);
    }

    await this.service.delete(req.params.id, req.user);
    this.sendSuccess(res, { message: "Campaign deleted successfully" });
  });

  /**
   * Approve campaign (admin only)
   * POST /api/v1/campaigns/:id/approve
   */
  approveCampaign = this.asyncHandler(async (req, res) => {
    // Optional: Check if user is admin
    // if (req.user.role !== 'admin') ... 
    
    const campaign = await this.service.approveCampaign(req.params.id);
    this.sendSuccess(res, campaign);
  });

  /**
   * Reject campaign (admin only)
   * POST /api/v1/campaigns/:id/reject
   */
  rejectCampaign = this.asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const campaign = await this.service.rejectCampaign(req.params.id, reason);
    this.sendSuccess(res, campaign);
  });

  /**
   * Complete campaign
   * POST /api/v1/campaigns/:id/complete
   */
  completeCampaign = this.asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
       return this.sendError(res, "Unauthorized", 401);
    }
    const campaign = await this.service.completeCampaign(req.params.id, req.user);
    this.sendSuccess(res, campaign);
  });
}

export default new CampaignController();
