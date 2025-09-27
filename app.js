import "dotenv/config";
import express from "express";
import config from "./src/config/config.js";
import routes from "./src/routes/index.js";
import errorHandler from "./src/middlewares/errorHandler.js";

const app = express();
app.use(express.json());
app.use("/api", routes);
app.use(errorHandler);

const PORT = config.port || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
