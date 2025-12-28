import express from "express";
import CampaignUsersController from "../controllers/CampaignUsersController.class.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.class.js";

const router = express.Router();

router.get("/", AuthMiddleware.verifyJWT, CampaignUsersController.getAll);
router.get("/:id", AuthMiddleware.verifyJWT, CampaignUsersController.getById);
router.post("/", AuthMiddleware.verifyJWT, CampaignUsersController.create);
router.put("/:id", AuthMiddleware.verifyJWT, CampaignUsersController.update);
router.delete("/:id", AuthMiddleware.verifyJWT, CampaignUsersController.delete);
router.post("/:id/approve", AuthMiddleware.verifyJWT, CampaignUsersController.approve);
router.post("/:id/reject", AuthMiddleware.verifyJWT, CampaignUsersController.reject);

export default router;
