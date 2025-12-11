import BaseController from "../core/BaseController.js";
import ChatMessageService from "../services/ChatMessageService.js";

class ChatMessageController extends BaseController {
  constructor() {
    super(ChatMessageService);
  }

  getAll = this.asyncHandler(async (req, res) => {
    const { user_id, chat_room_id, is_read, sort, order } = req.query;
    
    const messages = await this.service.getAll(
      { user_id, chat_room_id, is_read },
      { sort, order }
    );
    
    this.sendSuccess(res, messages);
  });

  getById = this.asyncHandler(async (req, res) => {
    const message = await this.service.getById(req.params.id);
    this.sendSuccess(res, message);
  });

  create = this.asyncHandler(async (req, res) => {
    const message = await this.service.create(req.body);
    this.sendSuccess(res, message, 201);
  });

  update = this.asyncHandler(async (req, res) => {
    const message = await this.service.update(req.params.id, req.body);
    this.sendSuccess(res, message);
  });

  delete = this.asyncHandler(async (req, res) => {
    await this.service.delete(req.params.id);
    this.sendSuccess(res, { message: "Chat message deleted successfully" });
  });

  markAsRead = this.asyncHandler(async (req, res) => {
    const message = await this.service.markAsRead(req.params.id);
    this.sendSuccess(res, message);
  });
}

export default new ChatMessageController();
