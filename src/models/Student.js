import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Student = sequelize.define(
  "Student",
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
    updated_at: {
      type: DataTypes.DATE,
    },
    created_at: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "student",
    timestamps: false,
  }
);

export default Student;
