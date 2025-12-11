import express from "express";
import CampaignController from "../controllers/CampaignController.class.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.class.js";

const router = express.Router();

// Public routes
router.get("/category/:category", CampaignController.getByCategory);
router.get("/:id", CampaignController.getById);

// Protected routes (require authentication)
router.get("/", AuthMiddleware.verifyJWT, CampaignController.getAll);
router.post("/", AuthMiddleware.verifyJWT, CampaignController.create);
router.put("/:id", AuthMiddleware.verifyJWT, CampaignController.update);
router.delete("/:id", AuthMiddleware.verifyJWT, CampaignController.delete);

export default router;
