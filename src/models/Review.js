const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Review = sequelize.define(
  "Review",
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
    tableName: "Review",
    timestamps: false,
  }
);

module.exports = Review;
