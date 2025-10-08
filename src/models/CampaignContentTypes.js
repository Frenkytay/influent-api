import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const CampaignContentTypes = sequelize.define(
  "CampaignContentTypes",
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
    content_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Instagram Post, Instagram Story, TikTok Video, etc.",
    },
    post_count: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: "Number of posts for this content type",
    },
    price_per_post: {
      type: DataTypes.DECIMAL(10, 2),
      comment: "Price per post for this content type",
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
    tableName: "campaign_content_types",
    timestamps: false,
  }
);

export default CampaignContentTypes;
