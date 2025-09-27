const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const CampaignUsers = sequelize.define(
  "CampaignUsers",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    campaign_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    applied_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    application_status: {
      type: DataTypes.ENUM("pending", "accepted", "rejected"),
      defaultValue: "pending",
    },
    application_notes: {
      type: DataTypes.TEXT,
    },
    accepted_at: {
      type: DataTypes.DATE,
    },
    rejected_at: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "CampaignUsers",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["campaign_id", "student_id"],
      },
    ],
  }
);

module.exports = CampaignUsers;
