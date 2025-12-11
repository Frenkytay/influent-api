import BaseRepository from "../core/BaseRepository.js";
import ChatMessage from "../models/ChatMessage.js";
import User from "../models/User.js";

class ChatMessageRepository extends BaseRepository {
  constructor() {
    super(ChatMessage);
  }

  async findAllWithRelations(options = {}) {
    return await this.findAll({
      ...options,
      include: [{ model: User }],
    });
  }

  async findByChatRoomId(chatRoomId, options = {}) {
    return await this.findAllWithRelations({
      where: { chat_room_id: chatRoomId },
      ...options,
    });
  }

  async findByUserId(userId, options = {}) {
    return await this.findAllWithRelations({
      where: { user_id: userId },
      ...options,
    });
  }

  async markAsRead(messageId) {
    return await this.update(messageId, { is_read: true });
  }
}

export default new ChatMessageRepository();
