import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

class CampaignUsers extends Model {
  static associate(models) {

    this.belongsTo(models.User, { foreignKey: "student_id", as: "user" }); // Corrected to match index.js
    this.belongsTo(models.Campaign, { foreignKey: "campaign_id", as: "campaign" });
    this.belongsTo(models.Student, { foreignKey: "student_id" });
    this.hasMany(models.WorkSubmission, { foreignKey: "campaign_user_id" });
  }
}

CampaignUsers.init(
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
      type: DataTypes.ENUM("pending", "accepted", "rejected", "completed", "paid"),
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
    sequelize,
    modelName: "CampaignUsers",
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
