import express from "express";
import chatMessageController from "../controllers/chatMessageController.js";

const router = express.Router();
router.get("/", chatMessageController.getAll);
router.get("/:id", chatMessageController.getById);
router.post("/", chatMessageController.create);
router.put("/:id", chatMessageController.update);
router.delete("/:id", chatMessageController.delete);

export default router;
