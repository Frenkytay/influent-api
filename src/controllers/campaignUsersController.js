const CampaignUsers = require("../models/CampaignUsers");

exports.getAll = async (req, res) => {
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
    };
    if (sort) options.order = [[sort, order.toUpperCase()]];

    const items = await CampaignUsers.findAll(options);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch campaign users" });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await CampaignUsers.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch campaign user" });
  }
};

exports.create = async (req, res) => {
  try {
    const item = await CampaignUsers.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: "Failed to create campaign user" });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await CampaignUsers.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: "Failed to update campaign user" });
  }
};

exports.delete = async (req, res) => {
  try {
    const item = await CampaignUsers.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    await item.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete campaign user" });
  }
};
