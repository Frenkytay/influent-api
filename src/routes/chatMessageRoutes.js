const express = require("express");
const router = express.Router();
const chatMessageController = require("../controllers/chatMessageController");

router.get("/", chatMessageController.getAll);
router.get("/:id", chatMessageController.getById);
router.post("/", chatMessageController.create);
router.put("/:id", chatMessageController.update);
router.delete("/:id", chatMessageController.delete);

module.exports = router;
