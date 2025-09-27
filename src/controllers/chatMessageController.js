const ChatMessage = require("../models/ChatMessage");

exports.getAll = async (req, res) => {
  try {
    const {
      user_id,
      chat_room_id,
      is_read,
      sort,
      order = "ASC",
      limit = 20,
      offset = 0,
    } = req.query;
    const where = {};
    if (user_id) where.user_id = user_id;
    if (chat_room_id) where.chat_room_id = chat_room_id;
    if (is_read !== undefined) where.is_read = is_read === "true";

    const options = {
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
    };
    if (sort) options.order = [[sort, order.toUpperCase()]];

    const messages = await ChatMessage.findAll(options);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chat messages" });
  }
};

exports.getById = async (req, res) => {
  try {
    const message = await ChatMessage.findByPk(req.params.id);
    if (!message) return res.status(404).json({ error: "Not found" });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chat message" });
  }
};

exports.create = async (req, res) => {
  try {
    const message = await ChatMessage.create(req.body);
    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ error: "Failed to create chat message" });
  }
};

exports.update = async (req, res) => {
  try {
    const message = await ChatMessage.findByPk(req.params.id);
    if (!message) return res.status(404).json({ error: "Not found" });
    await message.update(req.body);
    res.json(message);
  } catch (err) {
    res.status(400).json({ error: "Failed to update chat message" });
  }
};

exports.delete = async (req, res) => {
  try {
    const message = await ChatMessage.findByPk(req.params.id);
    if (!message) return res.status(404).json({ error: "Not found" });
    await message.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete chat message" });
  }
};
