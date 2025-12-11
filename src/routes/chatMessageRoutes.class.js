import express from "express";
import ChatMessageController from "../controllers/ChatMessageController.class.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.class.js";

const router = express.Router();

router.get("/", AuthMiddleware.verifyJWT, ChatMessageController.getAll);
router.get("/:id", AuthMiddleware.verifyJWT, ChatMessageController.getById);
router.post("/", AuthMiddleware.verifyJWT, ChatMessageController.create);
router.put("/:id", AuthMiddleware.verifyJWT, ChatMessageController.update);
router.put("/:id/read", AuthMiddleware.verifyJWT, ChatMessageController.markAsRead);
router.delete("/:id", AuthMiddleware.verifyJWT, ChatMessageController.delete);

export default router;
