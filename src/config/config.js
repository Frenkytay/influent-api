import fs from "fs";
import path from "path";
import mysql from "mysql2";
let config = {};

if (process.env.MYSQL_HOST) {
  // Use environment variables (for Vercel or production)
  config = {
    port: process.env.PORT || 3000,
    mongoURI: process.env.MONGO_URI,
    mysql: {
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      dialect: "mysql",
      dialectModule: mysql,
    },
  };
} else {
  // Fallback to local config.json
  // const configPath = path.join(__dirname, "config.json");
  // config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

export default config;
