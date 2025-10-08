import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

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
    // New fields based on form
    platform: {
      type: DataTypes.STRING(50),
      comment: "Instagram, TikTok, YouTube, etc.",
    },
    influencer_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Number of influencers needed",
    },
    campaign_price: {
      type: DataTypes.DECIMAL(12, 2),
      comment: "Total campaign budget",
    },
    start_date: {
      type: DataTypes.DATE,
      comment: "Campaign start date",
    },
    end_date: {
      type: DataTypes.DATE,
      comment: "Campaign end date",
    },
    submission_deadline: {
      type: DataTypes.DATE,
      comment: "Content submission deadline",
    },
    content_guidelines: {
      type: DataTypes.TEXT,
      comment: "Guidelines for content creation",
    },
    caption_guidelines: {
      type: DataTypes.TEXT,
      comment: "Guidelines for captions",
    },
    reference_media: {
      type: DataTypes.TEXT,
      comment: "Reference photos/videos URLs (JSON array)",
    },
    banner_image: {
      type: DataTypes.STRING,
      comment: "Campaign banner image path",
    },
    reference_images: {
      type: DataTypes.TEXT,
      comment: "JSON array of reference image paths",
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
    tableName: "campaign",
    timestamps: false,
  }
);

export default Campaign;
