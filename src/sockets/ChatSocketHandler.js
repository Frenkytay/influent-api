import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import ChatMessage from "../models/ChatMessage.js";
import ChatRoom from "../models/ChatRoom.js";
import User from "../models/User.js";
import ChatRoomParticipant from "../models/ChatRoomParticipant.js";

/**
 * ChatSocketHandler - Handles WebSocket connections and events for chat
 */
class ChatSocketHandler {
  constructor() {
    this.io = null;
    this.jwtSecret = process.env.JWT_SECRET || "please_change_me_in_production";
  }

  /**
   * Initialize Socket.IO server
   */
  initialize(httpServer) {
    this.io = new Server(httpServer, {
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

    this.setupMiddleware();
    this.setupEventHandlers();

    return this.io;
  }

  /**
   * Setup authentication middleware
   */
  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth && socket.handshake.auth.token;
        if (!token) {
          return next(new Error("Unauthorized: missing token"));
        }

        const payload = jwt.verify(token, this.jwtSecret);
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
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    this.io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id, "user:", socket.user?.id);

      this.handleJoinRoom(socket);
      this.handleLeaveRoom(socket);
      this.handleSendMessage(socket);
      this.handleTyping(socket);
      this.handleMarkAsRead(socket);
      this.handleDisconnect(socket);
    });
  }

  /**
   * Handle join room event
   */
  handleJoinRoom(socket) {
    socket.on("joinRoom", async ({ roomId }) => {
      try {
        if (!roomId) return;

        const roomName = `room-${roomId}`;
        const isParticipant = await this.verifyRoomParticipant(
          roomId,
          socket.user.id
        );

        if (!isParticipant) {
          socket.emit("error", { message: "Not a participant of this room" });
          return;
        }

        socket.join(roomName);
        console.log(`User ${socket.user.id} joined room ${roomName}`);

        socket.emit("joinedRoom", { roomId, roomName });
      } catch (error) {
        console.error("Error joining room:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });
  }

  /**
   * Handle leave room event
   */
  handleLeaveRoom(socket) {
    socket.on("leaveRoom", ({ roomId }) => {
      if (!roomId) return;
      const roomName = `room-${roomId}`;
      socket.leave(roomName);
      console.log(`User ${socket.user.id} left room ${roomName}`);
    });
  }

  /**
   * Handle send message event
   */
  handleSendMessage(socket) {
    socket.on("sendMessage", async ({ roomId, content, contentType }) => {
      try {
        if (!roomId || !content) {
          socket.emit("error", { message: "roomId and content required" });
          return;
        }

        const message = await ChatMessage.create({
          chat_room_id: roomId,
          user_id: socket.user.id,
          content,
          content_type: contentType || "text",
          is_read: false,
          timestamp: new Date(),
        });

        const fullMessage = await ChatMessage.findByPk(message.id, {
          include: [{ model: User, attributes: ["user_id", "name", "profile_image"] }],
        });

        const roomName = `room-${roomId}`;
        this.io.to(roomName).emit("newMessage", fullMessage);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });
  }

  /**
   * Handle typing event
   */
  handleTyping(socket) {
    socket.on("typing", ({ roomId, isTyping }) => {
      if (!roomId) return;
      const roomName = `room-${roomId}`;
      socket.to(roomName).emit("userTyping", {
        userId: socket.user.id,
        isTyping,
      });
    });
  }

  /**
   * Handle mark as read event
   */
  handleMarkAsRead(socket) {
    socket.on("markAsRead", async ({ messageId }) => {
      try {
        const message = await ChatMessage.findByPk(messageId);
        if (message) {
          await message.update({ is_read: true });
          const roomName = `room-${message.chat_room_id}`;
          this.io.to(roomName).emit("messageRead", { messageId });
        }
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    });
  }

  /**
   * Handle disconnect event
   */
  handleDisconnect(socket) {
    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  }

  /**
   * Verify if user is a participant of the room
   */
  async verifyRoomParticipant(roomId, userId) {
    const participant = await ChatRoomParticipant.findOne({
      where: {
        chat_room_id: roomId,
        user_id: userId,
      },
    });
    return !!participant;
  }

  /**
   * Get socket.io instance
   */
  getIO() {
    return this.io;
  }
}

export default new ChatSocketHandler();
