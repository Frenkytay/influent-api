import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

class Student extends Model {
  static associate(models) {
    this.belongsTo(models.User, { foreignKey: "user_id" });
    this.hasMany(models.CampaignUsers, { foreignKey: "student_id" });
  }
}

Student.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    university: {
      type: DataTypes.STRING,
    },
    major: {
      type: DataTypes.STRING,
    },
    year: {
      type: DataTypes.DATE,
    },
    phone_number: {
      type: DataTypes.STRING(20),
    },
    gpa: {
      type: DataTypes.DECIMAL(3, 2),
    },
    status: {
      type: DataTypes.BOOLEAN,
    },
    instagram: {
      type: DataTypes.STRING,
    },
    instagram_id: {
      type: DataTypes.STRING,
      unique: true,
    },
    // New Profile Fields
    domicile: {
      type: DataTypes.STRING,
    },
    age: {
      type: DataTypes.INTEGER,
    },
    gender: {
      type: DataTypes.ENUM("Perempuan", "Laki-laki"),
    },
    instagram_profile_link: {
      type: DataTypes.STRING,
    },
    content_category: {
      type: DataTypes.STRING,
    },
    // Verification Fields
    ktm_image_url: {
      type: DataTypes.STRING,
    },
    verification_status: {
      type: DataTypes.ENUM("unverified", "pending", "verified", "rejected"),
      defaultValue: "unverified",
    },
    rejection_reason: {
      type: DataTypes.STRING,
    },
    facebook_access_token: {
      type: DataTypes.TEXT,
    },
    instagram_followers_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    instagram_username: {
      type: DataTypes.STRING,
    },
    updated_at: {
      type: DataTypes.DATE,
    },
    created_at: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: "Student",
    tableName: "student",
    timestamps: false,
  }
);

export default Student;
