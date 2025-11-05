#!/usr/bin/env node
import { Sequelize } from "sequelize";
let config = {};

if (process.env.MYSQL_HOST) {
  // Use environment variables (for Vercel or production)
  config = {
    port: process.env.PORT || 3000,
    mongoURI: process.env.MONGO_URI,
    mysql: {
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      dialect: "mysql",
      dialectModule: mysql,
    },
  };
} else {
  // Fallback to local config.json
  // const configPath = path.join(__dirname, "config.json");
  // config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
}
const sequelize = new Sequelize(
  config.mysql.database,
  config.mysql.user,
  config.mysql.password,
  {
    host: config.mysql.host,
    port: config.mysql.port,
    dialect: config.mysql.dialect,
    logging: false,
  }
);

import bcrypt from "bcryptjs";
import {
  User,
  ChatRoom,
  ChatRoomParticipant,
  ChatMessage,
} from "../src/models/index.js";

async function seed() {
  try {
    console.log("Syncing DB (no destructive changes)...");
    // Note: do NOT use sync({ force: true }) in production
    await sequelize.sync();

    // Create users
    const passwordPlain = "password123";
    const hashed = await bcrypt.hash(passwordPlain, 10);

    const users = [
      {
        user_id: 102,
        name: "User 102",
        email: "user102@example.com",
        password: hashed,
        role: "student",
      },
      {
        user_id: 103,
        name: "User 103",
        email: "user103@example.com",
        password: hashed,
        role: "student",
      },
    ];

    for (const u of users) {
      const [row, created] = await User.findOrCreate({
        where: { user_id: u.user_id },
        defaults: u,
      });
      console.log(`User ${row.user_id} ${created ? "created" : "exists"}`);
    }

    // Create chat rooms
    const room1 = await ChatRoom.findOrCreate({
      where: { id: 1 },
      defaults: { id: 1, name: "Direct: 101 <> 102", status: "active" },
    });
    const room2 = await ChatRoom.findOrCreate({
      where: { id: 2 },
      defaults: { id: 2, name: "Group: Project X", status: "active" },
    });
    console.log("Chat rooms ready");

    // Participants
    const parts = [
      { chat_room_id: 1, user_id: 101 },
      { chat_room_id: 1, user_id: 102 },
      { chat_room_id: 2, user_id: 101 },
      { chat_room_id: 2, user_id: 102 },
      { chat_room_id: 2, user_id: 103 },
    ];

    for (const p of parts) {
      const [row, created] = await ChatRoomParticipant.findOrCreate({
        where: { chat_room_id: p.chat_room_id, user_id: p.user_id },
        defaults: p,
      });
      console.log(
        `Participant r${p.chat_room_id}-u${p.user_id} ${
          created ? "created" : "exists"
        }`
      );
    }

    // Messages
    const now = new Date();
    const messages = [
      {
        user_id: 102,
        chat_room_id: 1,
        message: "Hi 101, are you available?",
        timestamp: new Date(now.getTime() - 1000 * 60 * 60),
      },
      {
        user_id: 101,
        chat_room_id: 1,
        message: "Yes 102, I am here.",
        timestamp: new Date(now.getTime() - 1000 * 60 * 50),
        is_read: true,
      },
      {
        user_id: 103,
        chat_room_id: 2,
        message: "Hello team, I pushed the draft.",
        timestamp: new Date(now.getTime() - 1000 * 60 * 30),
      },
      {
        user_id: 102,
        chat_room_id: 2,
        message: "Nice! I will review.",
        timestamp: new Date(now.getTime() - 1000 * 60 * 20),
      },
      {
        user_id: 101,
        chat_room_id: 2,
        message: "Thanks all, I will check later.",
        timestamp: new Date(now.getTime() - 1000 * 60 * 10),
      },
    ];

    for (const m of messages) {
      const row = await ChatMessage.create({ ...m, created_at: m.timestamp });
      console.log(`Inserted message ${row.id} in room ${row.chat_room_id}`);
    }

    console.log("Seeding completed");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed", err);
    process.exit(1);
  }
}

seed();
