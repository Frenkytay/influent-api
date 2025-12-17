import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

class Campaign extends Model {
  static associate(models) {
    this.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
    this.hasMany(models.CampaignUsers, { foreignKey: "campaign_id" });
    this.hasMany(models.CampaignContentTypes, {
      foreignKey: "campaign_id",
      as: "contentTypes",
    });
    this.hasMany(models.Review, { foreignKey: "campaign_id" });
    this.hasMany(models.Payment, { foreignKey: "campaign_id" });
  }
}

Campaign.init(
  {
    campaign_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    campaign_category: {
      type: DataTypes.STRING(100),
      comment: "Category of campaign (e.g., Fashion, Beauty, Tech)",
    },
    influencer_category: {
      type: DataTypes.JSON,
      comment: "Array of influencer categories",
    },
    has_product: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Whether campaign has a product",
    },
    product_name: {
      type: DataTypes.STRING,
      comment: "Name of the product",
    },
    product_value: {
      type: DataTypes.DECIMAL(12, 2),
      comment: "Value/price of the product",
    },
    product_desc: {
      type: DataTypes.TEXT,
      comment: "Description of the product",
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
    content_reference: {
      type: DataTypes.TEXT,
      comment: "Reference description for content",
    },
    reference_files: {
      type: DataTypes.JSON,
      comment: "Array of reference file URLs",
    },
    influencer_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Number of influencers needed",
    },
    price_per_post: {
      type: DataTypes.DECIMAL(10, 2),
      comment: "Price per post for each content type",
    },
    min_followers: {
      type: DataTypes.INTEGER,
      comment: "Minimum followers required for influencers",
    },
    selected_gender: {
      type: DataTypes.STRING(50),
      comment: "Target gender for influencers",
    },
    selected_age: {
      type: DataTypes.STRING(100),
      comment: "Target age range for influencers (e.g., 18-25)",
    },
    criteria_desc: {
      type: DataTypes.TEXT,
      comment: "Description of selection criteria",
    },
    banner_image: {
      type: DataTypes.STRING,
      comment: "Campaign banner image path",
    },
    reference_images: {
      type: DataTypes.JSON,
      comment: "Array of reference image paths",
    },
    status: {
      type: DataTypes.ENUM('draft','admin_review','pending_payment','cancelled','active','completed' , 'paid'),
      defaultValue: "admin_review",
    },
    rating: {
      type: DataTypes.INTEGER,
      validate: { min: 1, max: 5 },
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
    modelName: "Campaign",
    tableName: "campaign",
    timestamps: false,
  }
);

export default Campaign;
