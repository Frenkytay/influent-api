import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

class User extends Model {
  static associate(models) {
    // 1:1
    this.hasOne(models.Student, { foreignKey: "user_id" });
    
    // 1:M
    this.hasMany(models.Campaign, { foreignKey: "user_id" });
    this.hasMany(models.ChatRoomParticipant, { foreignKey: "user_id" });
    this.hasMany(models.ChatMessage, { foreignKey: "user_id" });
    this.hasMany(models.Notification, { foreignKey: "user_id" });
    this.hasMany(models.Payment, { foreignKey: "user_id" });
    this.hasMany(models.Transaction, { foreignKey: "user_id", as: "transactions" });
    this.hasMany(models.Withdrawal, { foreignKey: "user_id", as: "withdrawals" });
    
    // Reviews
    this.hasMany(models.Review, { foreignKey: "creator_id" });
    this.hasMany(models.Review, { foreignKey: "reviewee_user_id" });
    
    // Work Submissions (as reviewer)
    this.hasMany(models.WorkSubmission, {
      foreignKey: "reviewed_by",
      as: "reviewedSubmissions",
    });

    // Withdrawals (as reviewer)
    this.hasMany(models.Withdrawal, {
      foreignKey: "reviewed_by",
      as: "reviewedWithdrawals",
    });

    // M:M
    this.belongsToMany(models.ChatRoom, {
      through: models.ChatRoomParticipant,
      foreignKey: "user_id",
      otherKey: "chat_room_id",
    });
  }
}

User.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("student", "company", "admin"),
      allowNull: false,
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
      type: DataTypes.ENUM("active", "inactive", "suspended"),
      defaultValue: "inactive",
    },
    balance: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.0,
      comment: "User account balance",
    },
    profile_image: {
      type: DataTypes.STRING,
      comment: "User profile image path",
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Whether email is verified",
    },
    otp_code: {
      type: DataTypes.STRING(6),
      comment: "OTP code for email verification",
    },
    otp_expires_at: {
      type: DataTypes.DATE,
      comment: "OTP expiration timestamp",
    },
    otp_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Number of failed OTP attempts",
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "user",
    timestamps: false,
  }
);

export default User;
