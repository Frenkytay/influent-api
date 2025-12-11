import BaseController from "../core/BaseController.js";
import NotificationService from "../services/NotificationService.js";

class NotificationController extends BaseController {
  constructor() {
    super(NotificationService);
  }

  getAll = this.asyncHandler(async (req, res) => {
    const { user_id, type, is_read, sort, order } = req.query;
    
    const notifications = await this.service.getAll(
      { user_id, type, is_read },
      { sort, order }
    );
    
    this.sendSuccess(res, notifications);
  });

  getById = this.asyncHandler(async (req, res) => {
    const notification = await this.service.getById(req.params.id);
    this.sendSuccess(res, notification);
  });

  create = this.asyncHandler(async (req, res) => {
    const notification = await this.service.createNotification(req.body);
    this.sendSuccess(res, notification, 201);
  });

  update = this.asyncHandler(async (req, res) => {
    const notification = await this.service.update(req.params.id, req.body);
    this.sendSuccess(res, notification);
  });

  delete = this.asyncHandler(async (req, res) => {
    await this.service.delete(req.params.id);
    this.sendSuccess(res, { message: "Notification deleted successfully" });
  });

  markAsRead = this.asyncHandler(async (req, res) => {
    const notification = await this.service.markAsRead(req.params.id);
    this.sendSuccess(res, notification);
  });

  markAllAsRead = this.asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
      return this.sendError(res, "Unauthorized", 401);
    }

    await this.service.markAllAsRead(req.user.id);
    this.sendSuccess(res, { message: "All notifications marked as read" });
  });

  getUnread = this.asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
      return this.sendError(res, "Unauthorized", 401);
    }

    const notifications = await this.service.getUnread(req.user.id);
    this.sendSuccess(res, notifications);
  });
}

export default new NotificationController();
