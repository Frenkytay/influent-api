import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

class Notification extends Model {
  static associate(models) {
    this.belongsTo(models.User, { foreignKey: "user_id" });
  }
}

Notification.init(
  {
    notification_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "User who receives this notification",
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Short notification title",
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Full notification message",
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "Notification type: campaign, payment, system, violation, etc.",
    },
    reference_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Related entity ID (e.g., campaign_id)",
    },
    reference_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Type of reference: campaign, payment, submission, etc.",
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Whether notification has been read",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "When notification was marked as read",
    },
  },
  {
    sequelize,
    modelName: "Notification",
    tableName: "notification",
    timestamps: false,
  }
);

export default Notification;
