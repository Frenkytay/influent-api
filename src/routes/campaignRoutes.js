const express = require("express");
const router = express.Router();
const campaignController = require("../controllers/campaignController");

router.get("/", campaignController.getAll);
router.get("/:id", campaignController.getById);
router.post("/", campaignController.create);
router.put("/:id", campaignController.update);
router.delete("/:id", campaignController.delete);

module.exports = router;
