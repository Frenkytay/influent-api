import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import ChatMessage from "../models/ChatMessage.js";
import ChatRoom from "../models/ChatRoom.js";
import User from "../models/User.js";
import ChatRoomParticipant from "../models/ChatRoomParticipant.js";

// Initialize Socket.IO and chat event handlers
export default function initChatSockets(server) {
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "https://your-frontend-domain.com",
      ],
      methods: ["GET", "POST"],
    },
  });

  // socket auth - expect token in handshake.auth.token (JWT)
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) return next(new Error("Unauthorized: missing token"));
      const secret = process.env.JWT_SECRET || "please_change_me_in_production";
      const payload = jwt.verify(token, secret);
      // attach user info to socket
      socket.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
      return next();
    } catch (err) {
      console.warn("Socket auth failed", err.message);
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id, "user:", socket.user?.id);

    // join a chat room
    socket.on("joinRoom", async ({ roomId }) => {
      try {
        if (!roomId) return;
        const roomName = `room-${roomId}`;
        // Optional: verify the user is a participant in the room
        const participant = await ChatRoomParticipant.findOne({
          where: { chat_room_id: roomId, user_id: socket.user.id },
        });
        if (!participant) {
          // if not participant, deny join
          return socket.emit("error", {
            message: "Not a participant of this room",
          });
        }
        socket.join(roomName);
        console.log(`Socket ${socket.id} joined ${roomName}`);

        // Optionally, emit previous messages
        const messages = await ChatMessage.findAll({
          where: { chat_room_id: roomId },
          order: [["timestamp", "ASC"]],
        });
        socket.emit("history", messages);
      } catch (err) {
        console.warn("joinRoom error", err.message);
      }
    });

    // leave a chat room
    socket.on("leaveRoom", ({ roomId }) => {
      if (!roomId) return;
      const roomName = `room-${roomId}`;
      socket.leave(roomName);
      console.log(`Socket ${socket.id} left ${roomName}`);
    });

    // typing indicator
    socket.on("typing", ({ roomId, typing = true }) => {
      if (!roomId) return;
      const roomName = `room-${roomId}`;
      socket.to(roomName).emit("typing", { userId: socket.user.id, typing });
    });

    // handle new chat message
    socket.on("message", async (payload) => {
      // payload: { roomId, message }
      try {
        const { roomId, message } = payload || {};
        const userId = socket.user.id;
        if (!roomId || !userId || !message) return;

        // ensure room exists and user is participant
        const participant = await ChatRoomParticipant.findOne({
          where: { chat_room_id: roomId, user_id: userId },
        });
        if (!participant)
          return socket.emit("error", { message: "Not a participant" });

        const saved = await ChatMessage.create({
          user_id: userId,
          chat_room_id: roomId,
          message,
        });

        const roomName = `room-${roomId}`;
        // emit to everyone in the room
        io.to(roomName).emit("message", saved);
      } catch (err) {
        console.error("socket message handler error", err.message);
        socket.emit("error", { message: "Message delivery failed" });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`Socket ${socket.id} disconnected (${reason})`);
    });
  });

  return io;
}
