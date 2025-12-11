import BaseService from "../core/BaseService.js";
import ReviewRepository from "../repositories/ReviewRepository.js";

class ReviewService extends BaseService {
  constructor() {
    super(ReviewRepository);
  }

  async getAll(filters = {}, options = {}) {
    const { creator_id, reviewee_user_id, campaign_id, rating } = filters;
    
    const queryFilters = {};
    if (creator_id) queryFilters.creator_id = creator_id;
    if (reviewee_user_id) queryFilters.reviewee_user_id = reviewee_user_id;
    if (campaign_id) queryFilters.campaign_id = campaign_id;
    if (rating) queryFilters.rating = rating;

    return await super.getAll(queryFilters, options);
  }

  async getByCreatorId(creatorId, options = {}) {
    const order = this.repository.buildOrderClause(options.sort, options.order);
    return await this.repository.findByCreatorId(creatorId, { order });
  }

  async getByRevieweeId(revieweeId, options = {}) {
    const order = this.repository.buildOrderClause(options.sort, options.order);
    return await this.repository.findByRevieweeId(revieweeId, { order });
  }

  async getByCampaignId(campaignId, options = {}) {
    const order = this.repository.buildOrderClause(options.sort, options.order);
    return await this.repository.findByCampaignId(campaignId, { order });
  }
}

export default new ReviewService();
