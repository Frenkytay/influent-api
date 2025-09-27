import express from "express";
import chatRoomController from "../controllers/chatRoomController.js";

const router = express.Router();
router.get("/", chatRoomController.getAll);
router.get("/:id", chatRoomController.getById);
router.post("/", chatRoomController.create);
router.put("/:id", chatRoomController.update);
router.delete("/:id", chatRoomController.delete);

export default router;
