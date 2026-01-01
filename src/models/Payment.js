import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

class Payment extends Model {
  static associate(models) {
    this.belongsTo(models.Campaign, { foreignKey: "campaign_id" });
    this.belongsTo(models.User, { foreignKey: "user_id" });
  }
}

Payment.init(
  {
    payment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.STRING,
      unique: true,
    },
    campaign_id: {
      type: DataTypes.INTEGER,
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    admin_fee: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING(50),
      comment: "pending, paid, failed, expire",
    },
    payment_type: {
      type: DataTypes.STRING(50),
    },
    transaction_time: {
      type: DataTypes.DATE,
    },
    raw_response: {
      type: DataTypes.JSON,
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
    sequelize,
    modelName: "Payment",
    tableName: "payment",
    timestamps: false,
  }
);

export default Payment;
