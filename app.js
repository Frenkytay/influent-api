import "dotenv/config";
import "./src/models/index.js"; // Ensure models are loaded
import express from "express";
import cors from "cors";
import config from "./src/config/config.js";
import routes from "./src/routes/index.js";
import path from "path";
import swaggerUiDist from "swagger-ui-dist";
import errorHandler from "./src/middlewares/errorHandler.js";
import initChatSockets from "./src/sockets/chat.js";
import http from "http";

const app = express();

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5173", // Vite default port
      "https://your-frontend-domain.com", // Add your production frontend URL
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
// Serve Swagger UI static distribution under /api/docs to ensure assets (css/js) are reachable
app.use("/api/docs", express.static(swaggerUiDist.getAbsoluteFSPath()));

// Serve the OpenAPI spec at a predictable URL for the static Swagger UI bundle
app.get("/api/openapi.json", (req, res) => {
  res.sendFile(path.join(process.cwd(), "openapi.json"));
});
app.use("/api", routes);
app.use(errorHandler);

const PORT = config.port || 3000;

// Create HTTP server so we can attach socket.io
const server = http.createServer(app);

// Initialize socket.io chat handlers
initChatSockets(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
