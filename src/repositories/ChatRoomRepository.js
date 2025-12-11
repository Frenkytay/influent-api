import BaseRepository from "../core/BaseRepository.js";
import ChatRoom from "../models/ChatRoom.js";
import ChatRoomParticipant from "../models/ChatRoomParticipant.js";
import ChatMessage from "../models/ChatMessage.js";
import User from "../models/User.js";
import { Op } from "sequelize";

class ChatRoomRepository extends BaseRepository {
  constructor() {
    super(ChatRoom);
  }

  async createWithParticipants(roomData, participants = []) {
    const room = await this.create(roomData);
    
    if (Array.isArray(participants) && participants.length > 0) {
      const rows = participants.map((user_id) => ({
        chat_room_id: room.id,
        user_id,
      }));
      await ChatRoomParticipant.bulkCreate(rows);
    }
    
    return room;
  }

  async findRoomsByUserId(userId) {
    const parts = await ChatRoomParticipant.findAll({
      where: { user_id: userId },
    });

    const rooms = [];
    for (const p of parts) {
      const room = await this.findById(p.chat_room_id);
      if (!room) continue;

      const last = await ChatMessage.findOne({
        where: { chat_room_id: room.id },
        order: [["timestamp", "DESC"]],
      });

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

    return rooms;
  }
}

export default new ChatRoomRepository();
