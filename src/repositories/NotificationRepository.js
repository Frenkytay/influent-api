import BaseRepository from "../core/BaseRepository.js";
import Notification from "../models/Notification.js";

class NotificationRepository extends BaseRepository {
  constructor() {
    super(Notification);
  }

  async findByUserId(userId, options = {}) {
    return await this.findAll({
      where: { user_id: userId },
      ...options,
    });
  }

  async findUnread(userId) {
    return await this.findAll({
      where: { user_id: userId, is_read: false },
      order: [["created_at", "DESC"]],
    });
  }

  async markAsRead(notificationId) {
    return await this.update(notificationId, { is_read: true });
  }

  async markAllAsRead(userId) {
    const notifications = await this.findUnread(userId);
    const promises = notifications.map((notif) =>
      this.markAsRead(notif.notification_id)
    );
    return await Promise.all(promises);
  }
}

export default new NotificationRepository();
