import express from "express";
import campaignUsersController from "../controllers/campaignUsersController.js";

const router = express.Router();
router.get("/", campaignUsersController.getAll);
router.get("/:id", campaignUsersController.getById);
router.post("/", campaignUsersController.create);
router.put("/:id", campaignUsersController.update);

router.post('/:id/accept', campaignUsersController.acceptApplicant);
router.post('/:id/reject', campaignUsersController.rejectApplicant);




export default router;

