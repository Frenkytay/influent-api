import express from "express";
import {
  createSubmission,
  getCampaignSubmissions,
  getStudentSubmissions,
  getSubmissionById,
  updateSubmission,
  reviewSubmission,
  markAsPublished,
  updatePerformanceMetrics,
  deleteSubmission,
} from "../controllers/workSubmissionController.js";
// import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
// router.use(protect);

// Create a new submission
router.post("/", createSubmission);

// Get all submissions for a campaign
router.get("/campaign/:campaign_id", getCampaignSubmissions);

// Get all submissions by a student
router.get("/student/:student_id", getStudentSubmissions);

// Get a single submission
router.get("/:submission_id", getSubmissionById);

// Update submission (for students)
router.put("/:submission_id", updateSubmission);

// Review submission (approve/reject/request revision)
router.post("/:submission_id/review", reviewSubmission);

// Mark as published
router.post("/:submission_id/publish", markAsPublished);

// Update performance metrics
router.put("/:submission_id/metrics", updatePerformanceMetrics);

// Delete submission
router.delete("/:submission_id", deleteSubmission);

export default router;
