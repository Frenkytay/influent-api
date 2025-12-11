import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

class ChatRoom extends Model {
  static associate(models) {
    this.hasMany(models.ChatMessage, { foreignKey: "chat_room_id" });
    this.hasMany(models.ChatRoomParticipant, { foreignKey: "chat_room_id" });
    this.belongsToMany(models.User, {
      through: models.ChatRoomParticipant,
      foreignKey: "chat_room_id",
      otherKey: "user_id",
    });
  }
}

ChatRoom.init(
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
    sequelize,
    modelName: "ChatRoom",
    tableName: "chatRoom",
    timestamps: false,
  }
);

export default ChatRoom;
