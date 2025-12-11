import BaseRepository from "../core/BaseRepository.js";
import Review from "../models/Review.js";

class ReviewRepository extends BaseRepository {
  constructor() {
    super(Review);
  }

  async findByCreatorId(creatorId, options = {}) {
    return await this.findAll({
      where: { creator_id: creatorId },
      ...options,
    });
  }

  async findByRevieweeId(revieweeId, options = {}) {
    return await this.findAll({
      where: { reviewee_user_id: revieweeId },
      ...options,
    });
  }

  async findByCampaignId(campaignId, options = {}) {
    return await this.findAll({
      where: { campaign_id: campaignId },
      ...options,
    });
  }
}

export default new ReviewRepository();
