// Example User controller
const User = require("../models/User");

exports.getAllUsers = async (req, res) => {
  try {
    const {
      name,
      email,
      role,
      status,
      sort,
      order = "ASC",
      limit = 20,
      offset = 0,
    } = req.query;
    const where = {};
    if (name) where.name = { [require("sequelize").Op.like]: `%${name}%` };
    if (email) where.email = { [require("sequelize").Op.like]: `%${email}%` };
    if (role) where.role = role;
    if (status) where.status = status;

    const options = {
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
    };
    if (sort) options.order = [[sort, order.toUpperCase()]];

    const users = await User.findAll(options);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

exports.getById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

exports.create = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: "Failed to create user" });
  }
};

exports.update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "Not found" });
    await user.update(req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: "Failed to update user" });
  }
};

exports.delete = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "Not found" });
    await user.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete user" });
  }
};
