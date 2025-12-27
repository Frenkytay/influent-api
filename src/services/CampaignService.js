import BaseService from "../core/BaseService.js";
import CampaignRepository from "../repositories/CampaignRepository.js";
import { Op } from "sequelize";

/**
 * CampaignService - Contains business logic for Campaign operations
 */
class CampaignService extends BaseService {
  constructor() {
    super(CampaignRepository);
  }

  /**
   * Get all campaigns with filters
   */
  async getAll(filters = {}, options = {}, requestUser = null) {
    const { status, user_id, title, campaign_category } = filters;
    
    const where = {};
    if (status) where.status = status;
    
    // If requester is not admin
    if (requestUser && requestUser.role !== "admin") {
      if (requestUser.role === "student") {
        // Students see ALL active campaigns, sorted by newest
        where.status = "active";
        options.sort = "created_at";
        options.order = "DESC";
      } else {
        // Other roles (e.g. brands) only see their own campaigns
        where.user_id = requestUser.id;
      }
    } else if (user_id) {
      where.user_id = user_id;
    }
    
    if (title) where.title = { [Op.like]: `%${title}%` };
    if (campaign_category) where.campaign_category = campaign_category;

    const order = this.repository.buildOrderClause(
      options.sort || "campaign_id",
      options.order || "DESC"
    );

    return await this.repository.findAllWithRelations({
      where,
      order,
    });
  }

  /**
   * Get campaign by ID with relations
   */
  async getById(id) {
    const campaign = await this.repository.findByIdWithRelations(id);
    if (!campaign) {
      throw new Error("Campaign not found");
    }
    return campaign;
  }

  /**
   * Get campaigns by category
   */
  async getByCategory(category, options = {}) {
    const order = this.repository.buildOrderClause(
      options.sort || "campaign_id",
      options.order || "DESC"
    );

    return await this.repository.findByCategory(category, { order });
  }

  /**
   * Create new campaign
   */
  async create(campaignData, userId) {
    // Validate required fields
    this.validateRequired(campaignData, ["title", "description"]);

    // Handle contentTypes -> content_types mapping
    if (campaignData.contentTypes) {
      let contentTypes = campaignData.contentTypes;
      if (typeof contentTypes === "string") {
        try {
          contentTypes = JSON.parse(contentTypes);
        } catch (e) {
          // Keep as string if parsing fails, or handle error
        }
      }
      campaignData.content_types = contentTypes;
    }

    // Set user_id from authenticated user
    return await this.repository.create({
      ...campaignData,
      user_id: userId,
    });
  }

  /**
   * Update campaign
   */
  async update(id, campaignData, requestUser = null) {
    const campaign = await this.repository.findById(id);
    
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    // Check if user owns the campaign (unless admin)
    if (
      requestUser &&
      requestUser.role !== "admin" &&
      campaign.user_id !== requestUser.id
    ) {
      throw new Error("Unauthorized to update this campaign");
    }

    // Handle contentTypes -> content_types mapping
    if (campaignData.contentTypes) {
      let contentTypes = campaignData.contentTypes;
      if (typeof contentTypes === "string") {
        try {
          contentTypes = JSON.parse(contentTypes);
        } catch (e) {
          // Keep as string if parsing fails
        }
      }
      campaignData.content_types = contentTypes;
    }

    return await this.repository.update(id, campaignData);
  }

  /**
   * Delete campaign
   */
  async delete(id, requestUser = null) {
    const campaign = await this.repository.findById(id);
    
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    // Check if user owns the campaign (unless admin)
    if (
      requestUser &&
      requestUser.role !== "admin" &&
      campaign.user_id !== requestUser.id
    ) {
      throw new Error("Unauthorized to delete this campaign");
    }

    return await this.repository.delete(id);
  }

  /**
   * Get campaigns by user
   */
  async getByUserId(userId, options = {}) {
    const order = this.repository.buildOrderClause(
      options.sort || "campaign_id",
      options.order || "DESC"
    );

    return await this.repository.findByUserId(userId, { order });
  }

  /**
   * Get campaigns by status
   */
  async getByStatus(status, options = {}) {
    const order = this.repository.buildOrderClause(
      options.sort || "campaign_id",
      options.order || "DESC"
    );

    return await this.repository.findByStatus(status, { order });
  }
}

export default new CampaignService();
