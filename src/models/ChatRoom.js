const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

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
    tableName: "ChatRoom",
    timestamps: false,
  }
);

module.exports = ChatRoom;
