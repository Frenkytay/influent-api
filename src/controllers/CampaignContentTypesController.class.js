import BaseController from "../core/BaseController.js";
import CampaignContentTypesService from "../services/CampaignContentTypesService.js";

class CampaignContentTypesController extends BaseController {
  constructor() {
    super(CampaignContentTypesService);
  }

  /**
   * Get all content types
   */
  getAll = this.asyncHandler(async (req, res) => {
    const { campaign_id, content_type } = req.query;
    const items = await this.service.getAll({ campaign_id, content_type });
    this.sendSuccess(res, items);
  });

  /**
   * Get by ID
   */
  getById = this.asyncHandler(async (req, res) => {
    const item = await this.service.getById(req.params.id);
    if (!item) {
      return this.sendError(res, "Content type not found", 404);
    }
    this.sendSuccess(res, item);
  });

  /**
   * Create single content type
   */
  create = this.asyncHandler(async (req, res) => {
    const item = await this.service.create(req.body);
    this.sendSuccess(res, item, "Content type created successfully", 201);
  });

  /**
   * Create multiple content types
   */
  createMultiple = this.asyncHandler(async (req, res) => {
    const { campaign_id, content_types } = req.body;
    const items = await this.service.createMultiple(campaign_id, content_types);
    this.sendSuccess(res, items, "Content types created successfully", 201);
  });

  /**
   * Update content type
   */
  update = this.asyncHandler(async (req, res) => {
    const item = await this.service.update(req.params.id, req.body);
    if (!item) {
      return this.sendError(res, "Content type not found", 404);
    }
    this.sendSuccess(res, item, "Content type updated successfully");
  });

  /**
   * Delete content type
   */
  delete = this.asyncHandler(async (req, res) => {
    await this.service.delete(req.params.id);
    this.sendSuccess(res, null, "Content type deleted successfully");
  });
}

export default new CampaignContentTypesController();
