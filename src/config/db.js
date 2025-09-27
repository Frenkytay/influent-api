const { Sequelize } = require("sequelize");
const config = require("./config");

const sequelize = new Sequelize(
  config.mysql.database,
  config.mysql.user,
  config.mysql.password,
  {
    host: config.mysql.host,
    port: config.mysql.port,
    dialect: config.mysql.dialect,
    logging: false,
  }
);

module.exports = sequelize;
