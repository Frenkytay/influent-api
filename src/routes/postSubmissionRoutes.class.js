import { Router } from "express";
import PostSubmissionController from "../controllers/PostSubmissionController.class.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.class.js";

const router = Router();

// Apply auth middleware to all routes
router.use(AuthMiddleware.verifyJWT);

// Submit a post link
router.post("/", PostSubmissionController.submitLink);

// Get submission by work submission ID
router.get("/work/:work_submission_id", PostSubmissionController.getByWorkSubmissionId);

// Verify/Reject submission (Admin/Company only)
router.patch("/:id/verify", PostSubmissionController.verifySubmission);

export default router;
