import BaseService from "../core/BaseService.js";
import ChatRoomRepository from "../repositories/ChatRoomRepository.js";

class ChatRoomService extends BaseService {
  constructor() {
    super(ChatRoomRepository);
  }

  async getAll(filters = {}, options = {}) {
    const { name, status } = filters;
    
    const queryFilters = {};
    if (name) queryFilters.name_like = name;
    if (status) queryFilters.status = status;

    return await super.getAll(queryFilters, options);
  }

  async updateStatus(roomId, status) {
    return await this.repository.update(roomId, { status });
  }

  async createWithParticipants(roomData, participants = []) {
    return await this.repository.createWithParticipants(roomData, participants);
  }

  async getRoomsByUserId(userId) {
    return await this.repository.findRoomsByUserId(userId);
  }

  async joinRoom(roomId, adminUserId) {
    // Optionally check if room exists or if user is actually admin here, 
    // but typically controller handles auth/validation.
    // We just proceed to add participant.
    return await this.repository.addParticipant(roomId, adminUserId);
  }

  async createAdminChat(userId) {
    // 1. Find an admin
    const admin = await this.repository.findFirstAdmin();
    if (!admin) {
      throw new Error("No admin available to chat with.");
    }

    // 2. Create room with participants [userId, admin.user_id]
    // Use createWithParticipants which handles existing private room check
    const room = await this.createWithParticipants(
      { name: "Support Chat" }, // Default name, or could be null for 1-1
      [userId, admin.user_id]
    );

    return room;
  }
}

export default new ChatRoomService();
