import BaseRepository from "../core/BaseRepository.js";
import Campaign from "../models/Campaign.js";
import User from "../models/User.js";
import CampaignContentTypes from "../models/CampaignContentTypes.js";

/**
 * CampaignRepository - Handles all database operations for Campaign model
 */
class CampaignRepository extends BaseRepository {
  constructor() {
    super(Campaign);
  }

  /**
   * Find all campaigns with user and content types
   */
  async findAllWithRelations(options = {}) {
    return await this.findAll({
      ...options,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "name", "email", "profile_image", "role"],
        },
        {
          model: CampaignContentTypes,
          as: "contentTypes",
        },
      ],
    });
  }

  /**
   * Find campaign by ID with relations
   */
  async findByIdWithRelations(id) {
    return await this.findOne({
      where: { campaign_id: id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "name", "email", "profile_image", "role"],
        },
        {
          model: CampaignContentTypes,
          as: "contentTypes",
        },
      ],
    });
  }

  /**
   * Find campaigns by user ID
   */
  async findByUserId(userId, options = {}) {
    return await this.findAllWithRelations({
      where: { user_id: userId },
      ...options,
    });
  }

  /**
   * Find campaigns by status
   */
  async findByStatus(status, options = {}) {
    return await this.findAllWithRelations({
      where: { status },
      ...options,
    });
  }

  /**
   * Find campaigns by category
   */
  async findByCategory(category, options = {}) {
    return await this.findAllWithRelations({
      where: { campaign_category: category },
      ...options,
    });
  }
}

export default new CampaignRepository();
