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

  async createWithParticipants(roomData, participants = []) {
    return await this.repository.createWithParticipants(roomData, participants);
  }

  async getRoomsByUserId(userId) {
    return await this.repository.findRoomsByUserId(userId);
  }
}

export default new ChatRoomService();
