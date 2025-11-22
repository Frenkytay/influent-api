import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define(
  "User",
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
      defaultValue: "active",
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
    tableName: "user",
    timestamps: false,
  }
);

export default User;
