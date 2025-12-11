import BaseService from "../core/BaseService.js";
import CampaignContentTypesRepository from "../repositories/CampaignContentTypesRepository.js";

class CampaignContentTypesService extends BaseService {
  constructor() {
    super(CampaignContentTypesRepository);
  }

  /**
   * Get all content types with optional filters
   */
  async getAll(filters = {}) {
    const where = {};
    
    if (filters.campaign_id) {
      where.campaign_id = filters.campaign_id;
    }
    
    if (filters.content_type) {
      where.content_type = filters.content_type;
    }

    if (Object.keys(where).length > 0) {
      return await this.repository.findAll({
        where,
        order: [["created_at", "ASC"]],
      });
    }

    return await this.repository.findAll({
      order: [["created_at", "ASC"]],
    });
  }

  /**
   * Create multiple content types at once
   */
  async createMultiple(campaignId, contentTypes) {
    if (!campaignId || !contentTypes || !Array.isArray(contentTypes)) {
      throw new Error("campaign_id and content_types array are required");
    }

    const contentTypesToCreate = contentTypes.map((ct) => ({
      campaign_id: campaignId,
      content_type: ct.content_type,
      post_count: ct.post_count || 1,
      price_per_post: ct.price_per_post || null,
    }));

    return await this.repository.bulkCreate(contentTypesToCreate);
  }

  /**
   * Get by campaign ID
   */
  async getByCampaignId(campaignId) {
    return await this.repository.findByCampaignId(campaignId);
  }

  /**
   * Delete all content types for a campaign
   */
  async deleteByCampaignId(campaignId) {
    return await this.repository.deleteByCampaignId(campaignId);
  }
}

export default new CampaignContentTypesService();
