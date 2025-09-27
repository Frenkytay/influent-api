module.exports = {
  port: 3000,
  mongoURI: "mongodb://localhost:27017/influent_db", // Change as needed
  mysql: {
    host: "localhost",
    user: "root",
    password: "", // Update with your password
    database: "influent", // Update with your database name
    dialect: "mysql",
  },
  // Add other config variables here
};
