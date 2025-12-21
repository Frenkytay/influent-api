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
