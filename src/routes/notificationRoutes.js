import express from "express";
import notificationController from "../controllers/notificationController.js";

const router = express.Router();
router.get("/", notificationController.getAll);
router.get("/:id", notificationController.getById);
router.post("/", notificationController.create);
router.put("/:id", notificationController.update);
router.delete("/:id", notificationController.delete);

export default router;
