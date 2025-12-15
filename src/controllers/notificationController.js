import Notification from "../models/Notification.js";
import { Op } from "sequelize";

const getAll = async (req, res) => {
  try {
    const {
      user_id,
      type,
      is_read,
      sort = "created_at",
      order = "DESC",
      limit = 20,
      offset = 0,
      page,
    } = req.query;

    console.log(`🔔 [GET /notifications] Request from user:`, req.user);

    // If user is authenticated, force filter to their own notifications
    const where = {};
    if (req.user) {
      where.user_id = req.user.id;
      console.log(`📋 Filtering notifications for user_id: ${req.user.id}`);
    } else if (user_id) {
      where.user_id = user_id;
      console.log(`📋 Filtering notifications for user_id (from query): ${user_id}`);
    }

    if (type) where.type = type;
    if (is_read !== undefined) where.is_read = is_read === "true";

    // Calculate offset from page if provided
    const itemsPerPage = parseInt(limit);
    const calculatedOffset = page 
      ? (parseInt(page) - 1) * itemsPerPage 
      : parseInt(offset);

    const options = {
      where,
      limit: itemsPerPage,
      offset: calculatedOffset,
      order: [[sort, order.toUpperCase()]],
    };

    const notifications = await Notification.findAll(options);
    const totalCount = await Notification.count({ where });
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    console.log(`✅ Found ${notifications.length} notifications (total: ${totalCount})`);
    if (notifications.length > 0) {
      console.log(`Sample notification:`, notifications[0].toJSON());
    }

    res.json({
      data: notifications,
      pagination: {
        total: totalCount,
        limit: itemsPerPage,
        offset: calculatedOffset,
        page: page ? parseInt(page) : Math.floor(calculatedOffset / itemsPerPage) + 1,
        totalPages,
      },
    });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

const getById = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ error: "Not found" });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notification" });
  }
};

const create = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json(notification);
  } catch (err) {
    res.status(400).json({ error: "Failed to create notification" });
  }
};

const update = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ error: "Not found" });
    await notification.update(req.body);
    res.json(notification);
  } catch (err) {
    res.status(400).json({ error: "Failed to update notification" });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ error: "Not found" });
    await notification.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete notification" });
  }
};

// Get unread count for badge
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.query.user_id;
    
    console.log(`🔔 [GET /unread-count] Request from user:`, req.user);
    
    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    const count = await Notification.count({
      where: {
        user_id: userId,
        is_read: false,
      },
    });

    console.log(`✅ Unread count for user ${userId}: ${count}`);

    res.json({ unread_count: count });
  } catch (err) {
    console.error("Error fetching unread count:", err);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    // Verify ownership if user is authenticated
    if (req.user && notification.user_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await notification.update({
      is_read: true,
      read_at: new Date(),
    });

    res.json(notification);
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(400).json({ error: "Failed to mark as read" });
  }
};

// Mark all notifications as read for user
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.body.user_id;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    await Notification.update(
      {
        is_read: true,
        read_at: new Date(),
      },
      {
        where: {
          user_id: userId,
          is_read: false,
        },
      }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Error marking all as read:", err);
    res.status(500).json({ error: "Failed to mark all as read" });
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  delete: deleteNotification,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
