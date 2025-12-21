import BaseController from "../core/BaseController.js";
import NotificationService from "../services/NotificationService.js";

class NotificationController extends BaseController {
  constructor() {
    super(NotificationService);
  }

  getAll = this.asyncHandler(async (req, res) => {
    let { user_id, type, is_read, sort, order } = req.query;

    // If user is not admin, they can only see their own notification
    if (req.user.role !== "admin") {
      user_id = req.user.id;
    }
    
    // If user_id is still not set (e.g. admin didn't provide it), do we want all?
    // Yes, allow admin to see all if they want.
    
    const notifications = await this.service.getAll(
      { user_id, type, is_read },
      { sort, order }
    );
    
    this.sendSuccess(res, notifications);
  });

  getById = this.asyncHandler(async (req, res) => {
    const notification = await this.service.getById(req.params.id);
    
    // Check ownership
    if (req.user.role !== "admin" && notification.user_id !== req.user.id) {
      return this.sendError(res, "Access denied", 403);
    }

    this.sendSuccess(res, notification);
  });

  create = this.asyncHandler(async (req, res) => {
    // Ensure user_id matches logged in user if not admin (or force it)
    const data = { ...req.body };
    if (req.user.role !== "admin") {
      data.user_id = req.user.id;
    }
    
    const notification = await this.service.createNotification(data);
    this.sendSuccess(res, notification, 201);
  });

  update = this.asyncHandler(async (req, res) => {
    const notification = await this.service.getById(req.params.id);
    
    // Check ownership
    if (req.user.role !== "admin" && notification.user_id !== req.user.id) {
      return this.sendError(res, "Access denied", 403);
    }

    const updated = await this.service.update(req.params.id, req.body);
    this.sendSuccess(res, updated);
  });

  delete = this.asyncHandler(async (req, res) => {
    const notification = await this.service.getById(req.params.id);
    
    // Check ownership
    if (req.user.role !== "admin" && notification.user_id !== req.user.id) {
      return this.sendError(res, "Access denied", 403);
    }

    await this.service.delete(req.params.id);
    this.sendSuccess(res, { message: "Notification deleted successfully" });
  });

  markAsRead = this.asyncHandler(async (req, res) => {
    const notification = await this.service.getById(req.params.id);
    
    // Check ownership
    if (req.user.role !== "admin" && notification.user_id !== req.user.id) {
      return this.sendError(res, "Access denied", 403);
    }

    const updated = await this.service.markAsRead(req.params.id);
    this.sendSuccess(res, updated);
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
