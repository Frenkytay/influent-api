import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Withdrawal = sequelize.define(
  "Withdrawal",
  {
    withdrawal_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "user",
        key: "user_id",
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    bank_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    account_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    account_holder_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected", "completed"),
      defaultValue: "pending",
    },
    request_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    reviewed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "user",
        key: "user_id",
      },
    },
    reviewed_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    review_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    transfer_proof_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    completed_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "withdrawal",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Withdrawal;
