const express = require("express");
const router = express.Router();
const campaignUsersController = require("../controllers/campaignUsersController");

router.get("/", campaignUsersController.getAll);
router.get("/:id", campaignUsersController.getById);
router.post("/", campaignUsersController.create);
router.put("/:id", campaignUsersController.update);
router.delete("/:id", campaignUsersController.delete);

module.exports = router;
