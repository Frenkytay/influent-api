import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

class PostSubmission extends Model {
  static associate(models) {
    this.belongsTo(models.WorkSubmission, {
      foreignKey: "work_submission_id",
      as: "work_submission",
    });
  }
}

PostSubmission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    work_submission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "work_submissions",
        key: "submission_id",
      },
      comment: "Reference to the original approved work submission",
    },
    post_link: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
      },
      comment: "The URL link to the live post (e.g. Instagram)",
    },
    status: {
      type: DataTypes.ENUM("pending", "verified", "rejected"),
      defaultValue: "pending",
      comment: "Verification status of the post link",
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
    modelName: "PostSubmission",
    tableName: "post_submissions",
    timestamps: false,
    indexes: [
      {
        fields: ["work_submission_id"],
      },
      {
        fields: ["status"],
      },
    ],
  }
);

export default PostSubmission;
