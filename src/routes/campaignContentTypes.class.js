import { Router } from "express";
import CampaignContentTypesController from "../controllers/CampaignContentTypesController.class.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.class.js";

const router = Router();

// Public routes
router.get("/", CampaignContentTypesController.getAll);
router.get("/:id", CampaignContentTypesController.getById);

// Protected routes
router.post("/", AuthMiddleware.verifyJWT, CampaignContentTypesController.create);
router.post("/multiple", AuthMiddleware.verifyJWT, CampaignContentTypesController.createMultiple);
router.put("/:id", AuthMiddleware.verifyJWT, CampaignContentTypesController.update);
router.delete("/:id", AuthMiddleware.verifyJWT, CampaignContentTypesController.delete);

export default router;
