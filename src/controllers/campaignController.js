import Campaign from "../models/Campaign.js";
import CampaignContentTypes from "../models/CampaignContentTypes.js";
import { Op } from "sequelize";

const getAll = async (req, res) => {
  try {
    const {
      status,
      student_id,
      title,
      campaign_category,
      sort,
      order = "DESC",
      limit = 20,
      offset = 0,
    } = req.query;

    const where = {};
    if (status) where.status = status;
    if (student_id) where.student_id = student_id;
    if (title) where.title = { [Op.like]: `%${title}%` };
    if (campaign_category) where.campaign_category = campaign_category;

    const options = {
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: CampaignContentTypes,
          as: "contentTypes",
        },
      ],
      order: sort ? [[sort, order.toUpperCase()]] : [["campaign_id", "DESC"]],
    };

    const campaigns = await Campaign.findAll(options);
    const totalCount = await Campaign.count({ where });

    res.json({
      data: campaigns,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < totalCount,
      },
    });
  } catch (err) {
    console.error("Error fetching campaigns:", err);
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
};

const getById = async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id, {
      include: [
        {
          model: CampaignContentTypes,
          as: "contentTypes",
        },
      ],
    });
    if (!campaign) return res.status(404).json({ error: "Not found" });
    res.json(campaign);
  } catch (err) {
    console.error("Error fetching campaign:", err);
    res.status(500).json({ error: "Failed to fetch campaign" });
  }
};

const create = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.title) {
      return res.status(400).json({ error: "Title is required" });
    }

    // Parse JSON fields if they come as strings
    const campaignData = {
      ...req.body,
      influencer_category: Array.isArray(req.body.influencer_category)
        ? req.body.influencer_category
        : req.body.influencer_category
        ? JSON.parse(req.body.influencer_category)
        : [],
      reference_files: Array.isArray(req.body.reference_files)
        ? req.body.reference_files
        : req.body.reference_files
        ? JSON.parse(req.body.reference_files)
        : [],
      reference_images: Array.isArray(req.body.reference_images)
        ? req.body.reference_images
        : req.body.reference_images
        ? JSON.parse(req.body.reference_images)
        : [],
      // Convert string boolean to actual boolean
      has_product:
        req.body.has_product === true || req.body.has_product === "true",
    };

    const campaign = await Campaign.create(campaignData);

    // Handle contentItems if provided
    if (req.body.contentItems && Array.isArray(req.body.contentItems)) {
      const contentTypes = req.body.contentItems.map((item) => ({
        campaign_id: campaign.campaign_id,
        content_type: item.content_type,
        post_count: item.post_count || 1,
        price_per_post: req.body.price_per_post,
      }));
      await CampaignContentTypes.bulkCreate(contentTypes);
    }

    res.status(201).json(campaign);
  } catch (err) {
    console.error("Error creating campaign:", err);
    res.status(400).json({
      error: "Failed to create campaign",
      details: err.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Not found" });

    // Parse JSON fields if they come as strings
    const updateData = {
      ...req.body,
      influencer_category: req.body.influencer_category
        ? Array.isArray(req.body.influencer_category)
          ? req.body.influencer_category
          : JSON.parse(req.body.influencer_category)
        : campaign.influencer_category,
      reference_files: req.body.reference_files
        ? Array.isArray(req.body.reference_files)
          ? req.body.reference_files
          : JSON.parse(req.body.reference_files)
        : campaign.reference_files,
      reference_images: req.body.reference_images
        ? Array.isArray(req.body.reference_images)
          ? req.body.reference_images
          : JSON.parse(req.body.reference_images)
        : campaign.reference_images,
      has_product:
        req.body.has_product !== undefined
          ? req.body.has_product === true || req.body.has_product === "true"
          : campaign.has_product,
    };

    await campaign.update(updateData);

    // Update contentItems if provided
    if (req.body.contentItems && Array.isArray(req.body.contentItems)) {
      // Delete old content types
      await CampaignContentTypes.destroy({
        where: { campaign_id: campaign.campaign_id },
      });

      // Create new content types
      const contentTypes = req.body.contentItems.map((item) => ({
        campaign_id: campaign.campaign_id,
        content_type: item.content_type,
        post_count: item.post_count || 1,
        price_per_post: req.body.price_per_post,
      }));
      await CampaignContentTypes.bulkCreate(contentTypes);
    }

    res.json(campaign);
  } catch (err) {
    console.error("Error updating campaign:", err);
    res.status(400).json({
      error: "Failed to update campaign",
      details: err.message,
    });
  }
};

const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Not found" });

    // Delete associated content types
    await CampaignContentTypes.destroy({
      where: { campaign_id: campaign.campaign_id },
    });

    await campaign.destroy();
    res.json({ message: "Campaign deleted successfully" });
  } catch (err) {
    console.error("Error deleting campaign:", err);
    res.status(500).json({
      error: "Failed to delete campaign",
      details: err.message,
    });
  }
};

// Get campaigns by category
const getByCategory = async (req, res) => {
  try {
    const { category, limit = 20, offset = 0 } = req.query;

    if (!category) {
      return res.status(400).json({ error: "Category parameter required" });
    }

    const campaigns = await Campaign.findAll({
      where: { campaign_category: category },
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: CampaignContentTypes,
          as: "contentTypes",
        },
      ],
      order: [["campaign_id", "DESC"]],
    });

    const totalCount = await Campaign.count({
      where: { campaign_category: category },
    });

    res.json({
      data: campaigns,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < totalCount,
      },
    });
  } catch (err) {
    console.error("Error fetching campaigns by category:", err);
    res.status(500).json({ error: "Failed to fetch campaigns by category" });
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  delete: deleteCampaign,
  getByCategory,
};
