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

  async findExistingPrivateRoom(user1Id, user2Id) {
    // Find rooms where user1 is a participant
    const user1Rooms = await ChatRoomParticipant.findAll({
      attributes: ["chat_room_id"],
      where: { user_id: user1Id },
    });

    const user1RoomIds = user1Rooms.map((r) => r.chat_room_id);

    if (user1RoomIds.length === 0) return null;

    // Find if user2 is also in any of those rooms, AND count participants = 2
    const commonRooms = await ChatRoomParticipant.findAll({
      where: {
        chat_room_id: user1RoomIds,
        user_id: user2Id,
      },
    });

    for (const common of commonRooms) {
      const count = await ChatRoomParticipant.count({
        where: { chat_room_id: common.chat_room_id },
      });
      if (count === 2) {
        return await this.findById(common.chat_room_id);
      }
    }

    return null;
  }

  async createWithParticipants(roomData, participants = []) {
    // Check for existing private room (1-on-1)
    if (participants.length === 2) {
      const existing = await this.findExistingPrivateRoom(
        participants[0],
        participants[1]
      );
      if (existing) {
        return existing;
      }
    }

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
