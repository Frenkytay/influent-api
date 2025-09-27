require("dotenv").config();
const express = require("express");
const app = express();
const config = require("./config/config");

app.use(express.json());

// Register all model routes
app.use("/api", require("./routes"));

// Error handling middleware
const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);

const PORT = config.port || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
