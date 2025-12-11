import "dotenv/config";
import "./src/models/index.js"; // Ensure models are loaded
import express from "express";
import cors from "cors";
import config from "./src/config/config.js";
import routes from "./src/routes/index.class.js"; // Using OOP routes
import path from "path";
import ErrorHandler from "./src/middlewares/ErrorHandler.class.js"; // Using OOP error handler
import ChatSocketHandler from "./src/sockets/ChatSocketHandler.js"; // Using OOP socket handler
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
app.use("/api", routes);

// Use class-based error handler
app.use(ErrorHandler.handle);

const PORT = config.port || 3000;

// Create HTTP server so we can attach socket.io
const server = http.createServer(app);

// Initialize socket.io chat handlers using OOP
ChatSocketHandler.initialize(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🎯 OOP Architecture: 100% Complete`);
});
