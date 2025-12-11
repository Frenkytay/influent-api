import BaseController from "../core/BaseController.js";
import ReviewService from "../services/ReviewService.js";

class ReviewController extends BaseController {
  constructor() {
    super(ReviewService);
  }

  getAll = this.asyncHandler(async (req, res) => {
    const { creator_id, reviewee_user_id, campaign_id, rating, sort, order } = req.query;
    
    const reviews = await this.service.getAll(
      { creator_id, reviewee_user_id, campaign_id, rating },
      { sort, order }
    );
    
    this.sendSuccess(res, reviews);
  });

  getById = this.asyncHandler(async (req, res) => {
    const review = await this.service.getById(req.params.id);
    this.sendSuccess(res, review);
  });

  create = this.asyncHandler(async (req, res) => {
    const review = await this.service.create(req.body);
    this.sendSuccess(res, review, 201);
  });

  update = this.asyncHandler(async (req, res) => {
    const review = await this.service.update(req.params.id, req.body);
    this.sendSuccess(res, review);
  });

  delete = this.asyncHandler(async (req, res) => {
    await this.service.delete(req.params.id);
    this.sendSuccess(res, { message: "Review deleted successfully" });
  });
}

export default new ReviewController();
