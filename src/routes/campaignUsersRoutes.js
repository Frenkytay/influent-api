import express from "express";
import campaignUsersController from "../controllers/campaignUsersController.js";

const router = express.Router();
router.get("/", campaignUsersController.getAll);
router.get("/:id", campaignUsersController.getById);
router.post("/", campaignUsersController.create);
router.put("/:id", campaignUsersController.update);
router.delete("/:id", campaignUsersController.delete);

export default router;
