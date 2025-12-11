import BaseRepository from "../core/BaseRepository.js";
import CampaignContentTypes from "../models/CampaignContentTypes.js";

class CampaignContentTypesRepository extends BaseRepository {
  constructor() {
    super(CampaignContentTypes);
  }

  /**
   * Find by campaign ID
   */
  async findByCampaignId(campaignId) {
    return await this.findAll({
      where: { campaign_id: campaignId },
      order: [["created_at", "ASC"]],
    });
  }

  /**
   * Find by content type
   */
  async findByContentType(contentType) {
    return await this.findAll({
      where: { content_type: contentType },
    });
  }

  /**
   * Bulk create content types
   */
  async bulkCreate(data) {
    return await this.model.bulkCreate(data);
  }

  /**
   * Delete by campaign ID
   */
  async deleteByCampaignId(campaignId) {
    return await this.model.destroy({
      where: { campaign_id: campaignId },
    });
  }
}

export default new CampaignContentTypesRepository();
