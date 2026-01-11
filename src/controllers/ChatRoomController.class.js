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

  joinRoom = this.asyncHandler(async (req, res) => {
    // Expect admin user
    // We can enforce role check in middleware or here. 
    // Assuming AuthMiddleware already verified token, we check role if needed or rely on business logic.
    // For safety, let's verify it's an admin requesting this (or handled by route middleware).
    
    await this.service.joinRoom(req.params.id, req.user.id);
    this.sendSuccess(res, { message: "Joined room successfully" });
  });

  endSession = this.asyncHandler(async (req, res) => {
    // Only admin or participants should be able to end? 
    // Request implies "admin can end".
    // We'll rely on service/repo or just update status.
    await this.service.updateStatus(req.params.id, "closed");
    this.sendSuccess(res, { message: "Chat session ended" });
  });

  createAdminChat = this.asyncHandler(async (req, res) => {
    const room = await this.service.createAdminChat(req.user.id);
    this.sendSuccess(res, room, 201);
  });
}

export default new ChatRoomController();
