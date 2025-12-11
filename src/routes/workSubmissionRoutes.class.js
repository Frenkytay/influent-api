import { Router } from "express";
import WorkSubmissionController from "../controllers/WorkSubmissionController.class.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.class.js";

const router = Router();

// All routes require authentication
router.use(AuthMiddleware.verifyJWT);

// Create submission
router.post("/", WorkSubmissionController.createSubmission);

// Get submissions by campaign
router.get("/campaign/:campaign_id", WorkSubmissionController.getCampaignSubmissions);

// Get submissions by student
router.get("/student/:student_id", WorkSubmissionController.getStudentSubmissions);

// Get single submission
router.get("/:submission_id", WorkSubmissionController.getSubmissionById);

// Update submission
router.put("/:submission_id", WorkSubmissionController.updateSubmission);

// Review actions
router.post("/:submission_id/approve", WorkSubmissionController.approveSubmission);
router.post("/:submission_id/reject", WorkSubmissionController.rejectSubmission);
router.post("/:submission_id/request-revisions", WorkSubmissionController.requestRevisions);
router.post("/:submission_id/resubmit", WorkSubmissionController.resubmit);

// Delete submission
router.delete("/:submission_id", WorkSubmissionController.deleteSubmission);

export default router;
