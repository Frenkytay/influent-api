import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

class ChatMessage extends Model {
  static associate(models) {
    this.belongsTo(models.ChatRoom, { foreignKey: "chat_room_id" });
    this.belongsTo(models.User, { foreignKey: "user_id" });
  }
}

ChatMessage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    chat_room_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "ChatMessage",
    tableName: "chatMessage",
    timestamps: false,
  }
);

export default ChatMessage;
