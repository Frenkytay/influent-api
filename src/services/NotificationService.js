import BaseService from "../core/BaseService.js";
import NotificationRepository from "../repositories/NotificationRepository.js";

class NotificationService extends BaseService {
  constructor() {
    super(NotificationRepository);
  }

  async getAll(filters = {}, options = {}) {
    const { user_id, type, is_read } = filters;
    
    const queryFilters = {};
    if (user_id) queryFilters.user_id = user_id;
    if (type) queryFilters.type = type;
    if (is_read !== undefined) queryFilters.is_read = is_read === "true";

    return await super.getAll(queryFilters, options);
  }

  async getByUserId(userId, options = {}) {
    const order = this.repository.buildOrderClause(
      options.sort || "created_at",
      options.order || "DESC"
    );
    return await this.repository.findByUserId(userId, { order });
  }

  async getUnread(userId) {
    return await this.repository.findUnread(userId);
  }

  async markAsRead(notificationId) {
    return await this.repository.markAsRead(notificationId);
  }

  async markAllAsRead(userId) {
    return await this.repository.markAllAsRead(userId);
  }

  async createNotification(data) {
    this.validateRequired(data, ["user_id", "title", "message", "type"]);
    return await this.repository.create({
      ...data,
      is_read: false,
    });
  }
}

export default new NotificationService();
