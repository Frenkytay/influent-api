import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

class WorkSubmission extends Model {
  static associate(models) {
    this.belongsTo(models.CampaignUsers, { foreignKey: "campaign_user_id" });
    this.belongsTo(models.User, { foreignKey: "reviewed_by", as: "reviewer" });
  }
}

WorkSubmission.init(
  {
    submission_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    campaign_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment:
        "Reference to CampaignUsers record (contains campaign_id and student_id)",
    },
    submission_type: {
      type: DataTypes.ENUM("draft", "final"),
      defaultValue: "draft",
      comment: "Type of submission",
    },
    content_type: {
      type: DataTypes.STRING(50),
      comment: "Type of content (e.g., post, story, reel, video)",
    },
    content_url: {
      type: DataTypes.STRING,
      comment: "URL to the submitted content/media",
    },
    content_files: {
      type: DataTypes.JSON,
      comment: "Array of uploaded file paths/URLs",
    },
    submission_content: {
      type: DataTypes.JSON,
      comment: "Structured submission content matching campaign requirements",
    },
    caption: {
      type: DataTypes.TEXT,
      comment: "Caption/description for the content",
    },
    hashtags: {
      type: DataTypes.JSON,
      comment: "Array of hashtags used",
    },
    platform: {
      type: DataTypes.STRING(50),
      comment: "Social media platform (Instagram, TikTok, etc.)",
    },
    submission_notes: {
      type: DataTypes.TEXT,
      comment: "Additional notes from student",
    },
    submitted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: "When the work was submitted",
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "under_review",
        "approved",
        "rejected",
        "revision_requested"
      ),
      defaultValue: "pending",
      comment: "Current status of submission",
    },
    reviewed_by: {
      type: DataTypes.INTEGER,
      comment: "User ID of reviewer (campaign owner)",
    },
    reviewed_at: {
      type: DataTypes.DATE,
      comment: "When the submission was reviewed",
    },
    review_notes: {
      type: DataTypes.TEXT,
      comment: "Feedback from reviewer",
    },
    approved_at: {
      type: DataTypes.DATE,
      comment: "When the submission was accepted",
    },
    rejected_at: {
      type: DataTypes.DATE,
      comment: "When the submission was rejected",
    },
    revision_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Number of times revision was requested",
    },
    performance_metrics: {
      type: DataTypes.JSON,
      comment: "Performance data (views, likes, shares, etc.)",
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Whether content has been published on platform",
    },
    published_at: {
      type: DataTypes.DATE,
      comment: "When content was published",
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
    modelName: "WorkSubmission",
    tableName: "work_submissions",
    timestamps: false,
    indexes: [
      {
        fields: ["campaign_user_id"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["submitted_at"],
      },
    ],
  }
);

export default WorkSubmission;
