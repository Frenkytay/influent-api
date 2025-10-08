import CampaignContentTypes from "../models/CampaignContentTypes.js";

const getAll = async (req, res) => {
  try {
    const { campaign_id, content_type, limit = 50, offset = 0 } = req.query;
    const where = {};
    if (campaign_id) where.campaign_id = campaign_id;
    if (content_type) where.content_type = content_type;

    const options = {
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "ASC"]],
    };

    const items = await CampaignContentTypes.findAll(options);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch campaign content types" });
  }
};

const getById = async (req, res) => {
  try {
    const item = await CampaignContentTypes.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch campaign content type" });
  }
};

const create = async (req, res) => {
  try {
    const item = await CampaignContentTypes.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: "Failed to create campaign content type" });
  }
};

const createMultiple = async (req, res) => {
  try {
    const { campaign_id, content_types } = req.body;

    if (!campaign_id || !content_types || !Array.isArray(content_types)) {
      return res
        .status(400)
        .json({ error: "campaign_id and content_types array required" });
    }

    const contentTypesToCreate = content_types.map((ct) => ({
      campaign_id,
      content_type: ct.content_type,
      post_count: ct.post_count || 1,
      price_per_post: ct.price_per_post || null,
    }));

    const items = await CampaignContentTypes.bulkCreate(contentTypesToCreate);
    res.status(201).json(items);
  } catch (err) {
    res.status(400).json({ error: "Failed to create campaign content types" });
  }
};

const update = async (req, res) => {
  try {
    const item = await CampaignContentTypes.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: "Failed to update campaign content type" });
  }
};

const deleteCampaignContentType = async (req, res) => {
  try {
    const item = await CampaignContentTypes.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    await item.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete campaign content type" });
  }
};

export default {
  getAll,
  getById,
  create,
  createMultiple,
  update,
  delete: deleteCampaignContentType,
};
