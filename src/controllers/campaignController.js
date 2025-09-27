const Campaign = require("../models/Campaign");

exports.getAll = async (req, res) => {
  try {
    const {
      status,
      student_id,
      title,
      sort,
      order = "ASC",
      limit = 20,
      offset = 0,
    } = req.query;
    const where = {};
    if (status) where.status = status;
    if (student_id) where.student_id = student_id;
    if (title) where.title = { [require("sequelize").Op.like]: `%${title}%` };

    const options = {
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
    };
    if (sort) options.order = [[sort, order.toUpperCase()]];

    const campaigns = await Campaign.findAll(options);
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
};

exports.getById = async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Not found" });
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch campaign" });
  }
};

exports.create = async (req, res) => {
  try {
    const campaign = await Campaign.create(req.body);
    res.status(201).json(campaign);
  } catch (err) {
    res.status(400).json({ error: "Failed to create campaign" });
  }
};

exports.update = async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Not found" });
    await campaign.update(req.body);
    res.json(campaign);
  } catch (err) {
    res.status(400).json({ error: "Failed to update campaign" });
  }
};

exports.delete = async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Not found" });
    await campaign.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete campaign" });
  }
};
