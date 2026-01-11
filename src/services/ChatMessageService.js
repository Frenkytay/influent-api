import BaseService from "../core/BaseService.js";
import ChatMessageRepository from "../repositories/ChatMessageRepository.js";
import ChatRoomRepository from "../repositories/ChatRoomRepository.js";

class ChatMessageService extends BaseService {
  constructor() {
    super(ChatMessageRepository);
  }

  async create(data) {
    const room = await ChatRoomRepository.findById(data.chat_room_id);
    if (!room) {
      throw new Error("Chat room not found");
    }
    if (room.status === "closed") {
      throw new Error("Chat session is closed");
    }
    return await this.repository.create(data);
  }

  async getAll(filters = {}, options = {}) {
    const { user_id, chat_room_id, is_read } = filters;
    
    const queryFilters = {};
    if (user_id) queryFilters.user_id = user_id;
    if (chat_room_id) queryFilters.chat_room_id = chat_room_id;
    if (is_read !== undefined) queryFilters.is_read = is_read === "true";

    const where = this.repository.buildWhereClause(queryFilters);
    const order = this.repository.buildOrderClause(options.sort, options.order);

    return await this.repository.findAllWithRelations({ where, order });
  }

  async getByChatRoomId(chatRoomId, options = {}) {
    const order = this.repository.buildOrderClause(
      options.sort || "timestamp",
      options.order || "ASC"
    );
    return await this.repository.findByChatRoomId(chatRoomId, { order });
  }

  async getByUserId(userId, options = {}) {
    const order = this.repository.buildOrderClause(options.sort, options.order);
    return await this.repository.findByUserId(userId, { order });
  }

  async markAsRead(messageId) {
    return await this.repository.markAsRead(messageId);
  }
}

export default new ChatMessageService();
