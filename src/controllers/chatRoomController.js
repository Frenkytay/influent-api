import ChatRoom from "../models/ChatRoom.js";
import ChatRoomParticipant from "../models/ChatRoomParticipant.js";
import ChatMessage from "../models/ChatMessage.js";
import User from "../models/User.js";
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
    // If participants provided, create room and participants
    const { participants = [], ...roomData } = req.body;
    const room = await ChatRoom.create(roomData);
    if (Array.isArray(participants) && participants.length > 0) {
      const rows = participants.map((user_id) => ({
        chat_room_id: room.id,
        user_id,
      }));
      await ChatRoomParticipant.bulkCreate(rows);
    }
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

// Get rooms for a user. If req.user exists (from auth middleware) use that.
const getMine = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.user_id;
    if (!userId) return res.status(400).json({ error: "user_id required" });

    // Find participant rows for user
    const parts = await ChatRoomParticipant.findAll({
      where: { user_id: userId },
    });

    const rooms = [];
    for (const p of parts) {
      const room = await ChatRoom.findByPk(p.chat_room_id);
      if (!room) continue;

      // last message
      const last = await ChatMessage.findOne({
        where: { chat_room_id: room.id },
        order: [["timestamp", "DESC"]],
      });
      // unread count: messages in room not by this user and is_read = false
      const unread = await ChatMessage.count({
        where: {
          chat_room_id: room.id,
          is_read: false,
          user_id: { [Op.ne]: userId },
        },
      });

      rooms.push({
        room,
        lastMessage: last || null,
        unreadCount: unread,
      });
    }

    return res.json(rooms);
  } catch (err) {
    console.error("getMine error", err.message);
    return res.status(500).json({ error: "Failed to fetch user rooms" });
  }
};

export default {
  getAll,
  getById,
  getMine,
  create,
  update,
  delete: deleteChatRoom,
};
