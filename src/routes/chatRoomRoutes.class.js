import express from "express";
import ChatRoomController from "../controllers/ChatRoomController.class.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.class.js";

const router = express.Router();

router.get("/mine", AuthMiddleware.verifyJWT, ChatRoomController.getMine);
router.get("/", AuthMiddleware.verifyJWT, ChatRoomController.getAll);
router.get("/:id", AuthMiddleware.verifyJWT, ChatRoomController.getById);
router.post("/", AuthMiddleware.verifyJWT, ChatRoomController.create);
router.post("/:id/end", AuthMiddleware.verifyJWT, ChatRoomController.endSession);
router.post("/admin", AuthMiddleware.verifyJWT, ChatRoomController.createAdminChat);
router.post("/:id/join", AuthMiddleware.verifyJWT, ChatRoomController.joinRoom); // Add role check middleware if needed strictly for admin
router.put("/:id", AuthMiddleware.verifyJWT, ChatRoomController.update);
router.delete("/:id", AuthMiddleware.verifyJWT, ChatRoomController.delete);

export default router;
