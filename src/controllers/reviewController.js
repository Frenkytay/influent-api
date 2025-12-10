import Review from "../models/Review.js";

const getAll = async (req, res) => {
  try {
    const {
      creator_id,
      reviewee_user_id,
      campaign_id,
      rating,
      sort,
      order = "ASC",
    } = req.query;
    const where = {};
    if (creator_id) where.creator_id = creator_id;
    if (reviewee_user_id) where.reviewee_user_id = reviewee_user_id;
    if (campaign_id) where.campaign_id = campaign_id;
    if (rating) where.rating = rating;

    const options = { where };
    if (sort) options.order = [[sort, order.toUpperCase()]];

    const reviews = await Review.findAll(options);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

const getById = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: "Not found" });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch review" });
  }
};

const create = async (req, res) => {
  try {
    const review = await Review.create(req.body);
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: "Failed to create review" });
  }
};

const update = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: "Not found" });
    await review.update(req.body);
    res.json(review);
  } catch (err) {
    res.status(400).json({ error: "Failed to update review" });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: "Not found" });
    await review.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete review" });
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  delete: deleteReview,
};
