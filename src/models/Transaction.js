import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Transaction = sequelize.define(
  "Transaction",
  {
    transaction_id: {
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
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("credit", "debit"),
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(
        "campaign_payment",
        "withdrawal",
        "refund",
        "bonus",
        "penalty",
        "adjustment"
      ),
      allowNull: false,
    },
    reference_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "campaign_users, withdrawal, etc",
    },
    reference_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID of related record",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    balance_before: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    balance_after: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "transaction",
    timestamps: false,
  }
);

export default Transaction;
