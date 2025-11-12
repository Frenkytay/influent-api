import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ChatRoom = sequelize.define(
  "ChatRoom",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM("active", "archived"),
      defaultValue: "active",
    },
  },
  {
    tableName: "chatRoom",
    timestamps: false,
  }
);

export default ChatRoom;
