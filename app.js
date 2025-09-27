require("dotenv").config();
const express = require("express");
const app = express();
const config = require("./src/config/config");

app.use(express.json());

// Register all model routes
app.use("/api", require("./src/routes"));

// Error handling middleware
const errorHandler = require("./src/middlewares/errorHandler");
app.use(errorHandler);

const PORT = config.port || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
