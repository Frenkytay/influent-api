const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ChatMessage = sequelize.define(
  "ChatMessage",
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
    tableName: "chatMessage",
    timestamps: false,
  }
);

module.exports = ChatMessage;
