import express from "express";
import campaignController from "../controllers/campaignController.js";

const router = express.Router();
router.get("/", campaignController.getAll);
router.get("/:id", campaignController.getById);
router.post("/", campaignController.create);
router.put("/:id", campaignController.update);
router.delete("/:id", campaignController.delete);

export default router;
