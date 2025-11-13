import { Sequelize } from "sequelize";

// Log environment variables for debugging (only in non-production)
if (process.env.NODE_ENV !== "production") {
  console.log("DB Config:", {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    dialect: process.env.DB_DIALECT,
  });
}

const sequelize = new Sequelize(
  process.env.DB_NAME || "influent_db",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    dialect: process.env.DB_DIALECT || "mysql",
    logging: process.env.NODE_ENV === "production" ? false : console.log,
    dialectOptions: {
      ssl:
        process.env.DB_HOST && process.env.DB_HOST.includes("aivencloud.com")
          ? {
              require: true,
              rejectUnauthorized: false,
            }
          : undefined,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export default sequelize;
