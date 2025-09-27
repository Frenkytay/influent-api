const express = require("express");
const router = express.Router();
const chatRoomController = require("../controllers/chatRoomController");

router.get("/", chatRoomController.getAll);
router.get("/:id", chatRoomController.getById);
router.post("/", chatRoomController.create);
router.put("/:id", chatRoomController.update);
router.delete("/:id", chatRoomController.delete);

module.exports = router;
