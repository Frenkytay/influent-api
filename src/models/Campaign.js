const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Campaign = sequelize.define(
  "Campaign",
  {
    campaign_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    student_id: {
      type: DataTypes.INTEGER,
    },
    rating: {
      type: DataTypes.INTEGER,
      validate: { min: 1, max: 5 },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    requirements: {
      type: DataTypes.TEXT,
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2),
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "completed"),
      defaultValue: "active",
    },
    deadline: {
      type: DataTypes.DATE,
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
    tableName: "Campaign",
    timestamps: false,
  }
);

module.exports = Campaign;
