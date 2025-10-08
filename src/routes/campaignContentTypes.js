import express from "express";
import campaignContentTypesController from "../controllers/campaignContentTypesController.js";

const router = express.Router();

router.get("/", campaignContentTypesController.getAll);
router.get("/:id", campaignContentTypesController.getById);
router.post("/", campaignContentTypesController.create);
router.post("/multiple", campaignContentTypesController.createMultiple);
router.put("/:id", campaignContentTypesController.update);
router.delete("/:id", campaignContentTypesController.delete);

export default router;
