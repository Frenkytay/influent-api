import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

class Review extends Model {
  static associate(models) {
    this.belongsTo(models.User, { as: "creator", foreignKey: "creator_id" });
    this.belongsTo(models.User, { as: "reviewee", foreignKey: "reviewee_user_id" });
    this.belongsTo(models.Campaign, { foreignKey: "campaign_id" });
  }
}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    creator_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reviewee_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    campaign_id: {
      type: DataTypes.INTEGER,
    },
    rating: {
      type: DataTypes.INTEGER,
      validate: { min: 1, max: 5 },
    },
    comment: {
      type: DataTypes.TEXT,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Review",
    tableName: "review",
    timestamps: false,
  }
);

export default Review;
