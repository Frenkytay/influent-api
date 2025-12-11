import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

class ChatRoomParticipant extends Model {
  static associate(models) {
    this.belongsTo(models.ChatRoom, { foreignKey: "chat_room_id" });
    this.belongsTo(models.User, { foreignKey: "user_id" });
  }
}

ChatRoomParticipant.init(
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
    sequelize,
    modelName: "ChatRoomParticipant",
    tableName: "chatRoomParticipant",
    timestamps: false,
  }
);

export default ChatRoomParticipant;
