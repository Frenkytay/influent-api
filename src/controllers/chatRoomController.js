import ChatRoom from "../models/ChatRoom.js";
import { Op } from "sequelize";

const getAll = async (req, res) => {
  try {
    const {
      name,
      status,
      sort,
      order = "ASC",
      limit = 20,
      offset = 0,
    } = req.query;
    const where = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (status) where.status = status;

    const options = {
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
    };
    if (sort) options.order = [[sort, order.toUpperCase()]];

    const rooms = await ChatRoom.findAll(options);
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chat rooms" });
  }
};

const getById = async (req, res) => {
  try {
    const room = await ChatRoom.findByPk(req.params.id);
    if (!room) return res.status(404).json({ error: "Not found" });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chat room" });
  }
};

const create = async (req, res) => {
  try {
    const room = await ChatRoom.create(req.body);
    res.status(201).json(room);
  } catch (err) {
    res.status(400).json({ error: "Failed to create chat room" });
  }
};

const update = async (req, res) => {
  try {
    const room = await ChatRoom.findByPk(req.params.id);
    if (!room) return res.status(404).json({ error: "Not found" });
    await room.update(req.body);
    res.json(room);
  } catch (err) {
    res.status(400).json({ error: "Failed to update chat room" });
  }
};

const deleteChatRoom = async (req, res) => {
  try {
    const room = await ChatRoom.findByPk(req.params.id);
    if (!room) return res.status(404).json({ error: "Not found" });
    await room.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete chat room" });
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  delete: deleteChatRoom,
};
