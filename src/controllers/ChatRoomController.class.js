import BaseController from "../core/BaseController.js";
import ChatRoomService from "../services/ChatRoomService.js";

class ChatRoomController extends BaseController {
  constructor() {
    super(ChatRoomService);
  }

  getAll = this.asyncHandler(async (req, res) => {
    const { name, status, sort, order } = req.query;
    
    const rooms = await this.service.getAll(
      { name, status },
      { sort, order }
    );
    
    this.sendSuccess(res, rooms);
  });

  getById = this.asyncHandler(async (req, res) => {
    const room = await this.service.getById(req.params.id);
    this.sendSuccess(res, room);
  });

  create = this.asyncHandler(async (req, res) => {
    const { participants = [], ...roomData } = req.body;
    const room = await this.service.createWithParticipants(roomData, participants);
    this.sendSuccess(res, room, 201);
  });

  update = this.asyncHandler(async (req, res) => {
    const room = await this.service.update(req.params.id, req.body);
    this.sendSuccess(res, room);
  });

  delete = this.asyncHandler(async (req, res) => {
    await this.service.delete(req.params.id);
    this.sendSuccess(res, { message: "Chat room deleted successfully" });
  });

  getMine = this.asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.query.user_id;
    
    if (!userId) {
      return this.sendError(res, "user_id required", 400);
    }

    const rooms = await this.service.getRoomsByUserId(userId);
    this.sendSuccess(res, rooms);
  });
}

export default new ChatRoomController();
