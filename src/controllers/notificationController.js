import Notification from "../models/Notification.js";

const getAll = async (req, res) => {
  try {
    const {
      user_id,
      type,
      is_read,
      sort,
      order = "ASC",
      limit = 20,
      offset = 0,
    } = req.query;
    const where = {};
    if (user_id) where.user_id = user_id;
    if (type) where.type = type;
    if (is_read !== undefined) where.is_read = is_read === "true";

    const options = {
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
    };
    if (sort) options.order = [[sort, order.toUpperCase()]];

    const notifications = await Notification.findAll(options);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

const getById = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ error: "Not found" });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notification" });
  }
};

const create = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json(notification);
  } catch (err) {
    res.status(400).json({ error: "Failed to create notification" });
  }
};

const update = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ error: "Not found" });
    await notification.update(req.body);
    res.json(notification);
  } catch (err) {
    res.status(400).json({ error: "Failed to update notification" });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ error: "Not found" });
    await notification.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete notification" });
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  delete: deleteNotification,
};
