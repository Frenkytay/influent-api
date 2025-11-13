import "dotenv/config";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import sequelize from "./config/db.js";
import ChatMessage from "./models/ChatMessage.js";
import ChatRoom from "./models/ChatRoom.js";
import ChatRoomParticipant from "./models/ChatRoomParticipant.js";
import User from "./models/User.js";

const app = express();
const server = createServer(app);

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5173",
      process.env.FRONTEND_URL || "https://your-frontend-domain.com",
    ],
    credentials: true,
  })
);

app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    service: "influent-websocket-server",
  });
});

// Basic info endpoint
app.get("/", (req, res) => {
  res.json({
    service: "Influent WebSocket Server",
    status: "running",
    endpoints: {
      health: "/health",
      websocket: "ws://[host] or wss://[host]",
    },
  });
});

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5173",
      process.env.FRONTEND_URL || "https://your-frontend-domain.com",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Unauthorized: missing token"));
    }

    const secret = process.env.JWT_SECRET || "please_change_me_in_production";
    const payload = jwt.verify(token, secret);

    // Attach user info to socket
    socket.user = {
      id: payload.sub || payload.userId || payload.user_id,
      email: payload.email,
      role: payload.role,
    };

    return next();
  } catch (err) {
    return next(new Error("Unauthorized"));
  }
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  // Join a chat room
  socket.on("joinRoom", async ({ roomId }) => {
    try {
      if (!roomId) {
        return socket.emit("error", { message: "Room ID is required" });
      }

      const roomName = `room-${roomId}`;

      // Verify user is a participant
      const participant = await ChatRoomParticipant.findOne({
        where: {
          chat_room_id: roomId,
          user_id: socket.user.id,
        },
      });

      if (!participant) {
        return socket.emit("error", {
          message: "Not a participant of this room",
        });
      }

      socket.join(roomName);

      // Send previous messages
      const messages = await ChatMessage.findAll({
        where: { chat_room_id: roomId },
        include: [
          {
            model: User,
            attributes: ["user_id", "name", "email", "profile_image"],
          },
        ],
        order: [["timestamp", "ASC"]],
        limit: 50, // Last 50 messages
      });

      socket.emit("history", messages);
      socket.to(roomName).emit("userJoined", {
        userId: socket.user.id,
        socketId: socket.id,
      });
    } catch (err) {
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  // Leave a chat room
  socket.on("leaveRoom", ({ roomId }) => {
    if (!roomId) return;

    const roomName = `room-${roomId}`;
    socket.leave(roomName);

    socket.to(roomName).emit("userLeft", {
      userId: socket.user.id,
      socketId: socket.id,
    });
  });

  // Typing indicator
  socket.on("typing", ({ roomId, typing = true }) => {
    if (!roomId) return;

    const roomName = `room-${roomId}`;
    socket.to(roomName).emit("typing", {
      userId: socket.user.id,
      typing,
    });
  });

  // Handle new chat message
  socket.on("message", async (payload) => {
    try {
      const { roomId, message } = payload || {};
      const userId = socket.user.id;

      if (!roomId || !userId || !message) {
        return socket.emit("error", {
          message: "roomId and message are required",
        });
      }

      // Verify user is participant
      const participant = await ChatRoomParticipant.findOne({
        where: {
          chat_room_id: roomId,
          user_id: userId,
        },
      });

      if (!participant) {
        return socket.emit("error", {
          message: "Not a participant of this room",
        });
      }

      // Save message to database
      const saved = await ChatMessage.create({
        user_id: userId,
        chat_room_id: roomId,
        message,
      });

      // Load full message with user data
      const fullMessage = await ChatMessage.findByPk(saved.id, {
        include: [
          {
            model: User,
            attributes: ["user_id", "name", "email", "profile_image"],
          },
        ],
      });

      const roomName = `room-${roomId}`;

      // Broadcast to all users in room (including sender)
      io.to(roomName).emit("message", fullMessage);
    } catch (err) {
      socket.emit("error", { message: "Message delivery failed" });
    }
  });

  // Mark messages as read
  socket.on("markAsRead", async ({ roomId, messageId }) => {
    try {
      if (messageId) {
        await ChatMessage.update(
          { is_read: true },
          { where: { id: messageId } }
        );
      } else if (roomId) {
        await ChatMessage.update(
          { is_read: true },
          { where: { chat_room_id: roomId } }
        );
      }

      socket.emit("markedAsRead", { roomId, messageId });
    } catch (err) {
      // Silent error handling
    }
  });

  // Disconnect handler
  socket.on("disconnect", () => {
    // Connection closed
  });
});

// Database connection and server start
const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log("✓ Database connected");

    // Sync models (use migrations in production)
    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync({ alter: false });
      console.log("✓ Database models synced");
    }

    // Start server
    server.listen(PORT, () => {
      console.log(`✓ WebSocket server running on port ${PORT}`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("✗ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
