import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const CampaignUsers = sequelize.define(
  "CampaignUsers",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "id",
    },
    campaign_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "campaign_id",
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "student_id",
    },
    applied_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "applied_at",
    },
    application_status: {
      type: DataTypes.ENUM("pending", "accepted", "rejected"),
      defaultValue: "pending",
      field: "application_status",
    },
    application_notes: {
      type: DataTypes.TEXT,
      field: "application_notes",
    },
    accepted_at: {
      type: DataTypes.DATE,
      field: "accepted_at",
    },
    rejected_at: {
      type: DataTypes.DATE,
      field: "rejected_at",
    },
  },
  {
    tableName: "campaignUsers",
    timestamps: false,
    freezeTableName: true,
    indexes: [
      {
        unique: true,
        fields: ["campaign_id", "student_id"],
      },
    ],
  }
);

export default CampaignUsers;
