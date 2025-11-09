import express from "express";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

const router = express.Router();

const specPath = path.join(process.cwd(), "openapi.json");
let openapi = {};
try {
  const raw = fs.readFileSync(specPath, "utf8");
  openapi = JSON.parse(raw);
} catch (err) {
  console.error("Failed to load openapi.json:", err.message);
}

router.use("/", swaggerUi.serve);
router.get("/", swaggerUi.setup(openapi));

export default router;
