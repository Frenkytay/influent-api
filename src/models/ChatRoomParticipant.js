import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ChatRoomParticipant = sequelize.define(
  "ChatRoomParticipant",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    chat_room_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    last_read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "chatRoomParticipant",
    timestamps: false,
  }
);

export default ChatRoomParticipant;
