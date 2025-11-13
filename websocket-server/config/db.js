import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME || "influent_db",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 12945,
    dialect: process.env.DB_DIALECT || "mysql",
    logging: process.env.NODE_ENV === "production" ? false : console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export default sequelize;
