import BaseController from "../core/BaseController.js";
import WorkSubmissionService from "../services/WorkSubmissionService.js";

class WorkSubmissionController extends BaseController {
  constructor() {
    super(WorkSubmissionService);
  }

  /**
   * Create submission
   */
  createSubmission = this.asyncHandler(async (req, res) => {
    const submission = await this.service.createSubmission(req.body);
    this.sendSuccess(res, submission, 201);
  });

  /**
   * Get campaign submissions
   */
  getCampaignSubmissions = this.asyncHandler(async (req, res) => {
    const { campaign_id } = req.params;
    const { status } = req.query;
    
    const submissions = await this.service.getCampaignSubmissions(
      campaign_id,
      { status }
    );
    
    this.sendSuccess(res, submissions);
  });

  /**
   * Get all rejected submissions (Admin only)
   */
  getRejectedSubmissions = this.asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") {
      return this.sendError(res, "Access denied", 403);
    }

    const submissions = await this.service.getAllRejected();
    this.sendSuccess(res, submissions);
  });

  /**
   * Get student submissions
   */
  getStudentSubmissions = this.asyncHandler(async (req, res) => {
    const { student_id } = req.params;
    const { status } = req.query;
    
    const submissions = await this.service.getStudentSubmissions(
      student_id,
      { status }
    );
    
    this.sendSuccess(res, submissions);
  });

  /**
   * Get submission by ID
   */
  getSubmissionById = this.asyncHandler(async (req, res) => {
    const { submission_id } = req.params;
    const submission = await this.service.getSubmissionWithRelations(submission_id);
    
    if (!submission) {
      return this.sendError(res, "Submission not found", 404);
    }
    
    this.sendSuccess(res, submission);
  });

  /**
   * Update submission
   */
  updateSubmission = this.asyncHandler(async (req, res) => {
    const { submission_id } = req.params;
    const submission = await this.service.updateSubmission(submission_id, req.body);
    
    if (!submission) {
      return this.sendError(res, "Submission not found", 404);
    }
    
    this.sendSuccess(res, submission);
  });

  /**
   * Approve submission
   */
  approveSubmission = this.asyncHandler(async (req, res) => {
    const { submission_id } = req.params;
    const { review_feedback } = req.body;
    const reviewerId = req.user?.id;
    
    const submission = await this.service.approveSubmission(
      submission_id,
      reviewerId,
      review_feedback
    );
    
    if (!submission) {
      return this.sendError(res, "Submission not found", 404);
    }
    
    this.sendSuccess(res, submission);
  });

  /**
   * Reject submission
   */
  rejectSubmission = this.asyncHandler(async (req, res) => {
    const { submission_id } = req.params;
    const { review_notes } = req.body;
    const reviewerId = req.user?.id;
    
    if (!review_notes) {
      return this.sendError(res, "Rejection feedback is required", 400);
    }
    
    const submission = await this.service.rejectSubmission(
      submission_id,
      reviewerId,
      review_notes
    );
    
    if (!submission) {
      return this.sendError(res, "Submission not found", 404);
    }
    
    this.sendSuccess(res, submission);
  });

  /**
   * Request revisions
   */
  requestRevisions = this.asyncHandler(async (req, res) => {
    const { submission_id } = req.params;
    const { review_feedback } = req.body;
    const reviewerId = req.user?.id;
    
    if (!review_feedback) {
      return this.sendError(res, "Revision feedback is required", 400);
    }
    
    const submission = await this.service.requestRevisions(
      submission_id,
      reviewerId,
      review_feedback
    );
    
    if (!submission) {
      return this.sendError(res, "Submission not found", 404);
    }
    
    this.sendSuccess(res, submission);
  });

  /**
   * Resubmit after revisions
   */
  resubmit = this.asyncHandler(async (req, res) => {
    const { submission_id } = req.params;
    const submission = await this.service.resubmit(submission_id, req.body);
    
    if (!submission) {
      return this.sendError(res, "Submission not found", 404);
    }
    
    this.sendSuccess(res, submission);
  });

  /**
   * Delete submission
   */
  deleteSubmission = this.asyncHandler(async (req, res) => {
    const { submission_id } = req.params;
    await this.service.deleteSubmission(submission_id);
    this.sendSuccess(res, null);
  });
}

export default new WorkSubmissionController();
