import CampaignUsers from "../models/CampaignUsers.js";
import User from "../models/User.js";
import Campaign from "../models/Campaign.js";

// Make sure associations are defined somewhere in your project:
// CampaignUsers.belongsTo(User, { foreignKey: 'student_id', as: 'user' });
// CampaignUsers.belongsTo(Campaign, { foreignKey: 'campaign_id', as: 'campaign' });

const getAll = async (req, res) => {
  try {
    const {
      campaign_id,
      student_id,
      application_status,
      sort,
      order = "ASC",
      limit = 20,
      offset = 0,
    } = req.query;
    const where = {};
    if (campaign_id) where.campaign_id = campaign_id;
    if (student_id) where.student_id = student_id;
    if (application_status) where.application_status = application_status;

    const options = {
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "name", "email", "profile_image", "role"],
        },
        { model: Campaign, as: "campaign" },
      ],
    };
    if (sort) options.order = [[sort, order.toUpperCase()]];

    const items = await CampaignUsers.findAll(options);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch campaign users" });
  }
};

const getById = async (req, res) => {
  try {
    const item = await CampaignUsers.findByPk(req.params.id, {
      include: [
        { model: User, as: "user" },
        { model: Campaign, as: "campaign" },
      ],
    });
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch campaign user" });
  }
};

const create = async (req, res) => {
  try {
    const item = await CampaignUsers.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: "Failed to create campaign user" });
  }
};

const update = async (req, res) => {
  try {
    const item = await CampaignUsers.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: "Failed to update campaign user" });
  }
};

const deleteCampaignUser = async (req, res) => {
  try {
    const item = await CampaignUsers.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    await item.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete campaign user" });
  }
};

const acceptApplicant = async (req, res) => {
  try {
    const item = await CampaignUsers.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Applicant not found" });

    await item.update({
      application_status: 'accepted',
      accepted_at: new Date(),
      application_notes: req.body.notes || null
    });

    res.json({ message: "Applicant accepted successfully", data: item });
  } catch (err) {
    console.error('Error accepting applicant:', err);
    res.status(400).json({ error: "Failed to accept applicant" });
  }
};

const rejectApplicant = async (req, res) => {
  try {
    const item = await CampaignUsers.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Applicant not found" });

    await item.update({
      application_status: 'rejected',
      rejected_at: new Date(),
      application_notes: req.body.notes || null
    });

    res.json({ message: "Applicant rejected successfully", data: item });
  } catch (err) {
    console.error('Error rejecting applicant:', err);
    res.status(400).json({ error: "Failed to reject applicant" });
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  delete: deleteCampaignUser,
  acceptApplicant,
  rejectApplicant,
};



