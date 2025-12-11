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
    this.sendSuccess(res, submission, "Work submission created successfully", 201);
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
    
    this.sendSuccess(res, submissions, "Submissions retrieved successfully");
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
    
    this.sendSuccess(res, submissions, "Submissions retrieved successfully");
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
    
    this.sendSuccess(res, submission, "Submission retrieved successfully");
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
    
    this.sendSuccess(res, submission, "Submission updated successfully");
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
    
    this.sendSuccess(res, submission, "Submission approved successfully");
  });

  /**
   * Reject submission
   */
  rejectSubmission = this.asyncHandler(async (req, res) => {
    const { submission_id } = req.params;
    const { review_feedback } = req.body;
    const reviewerId = req.user?.id;
    
    if (!review_feedback) {
      return this.sendError(res, "Rejection feedback is required", 400);
    }
    
    const submission = await this.service.rejectSubmission(
      submission_id,
      reviewerId,
      review_feedback
    );
    
    if (!submission) {
      return this.sendError(res, "Submission not found", 404);
    }
    
    this.sendSuccess(res, submission, "Submission rejected");
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
    
    this.sendSuccess(res, submission, "Revision requested");
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
    
    this.sendSuccess(res, submission, "Submission resubmitted successfully");
  });

  /**
   * Delete submission
   */
  deleteSubmission = this.asyncHandler(async (req, res) => {
    const { submission_id } = req.params;
    await this.service.deleteSubmission(submission_id);
    this.sendSuccess(res, null, "Submission deleted successfully");
  });
}

export default new WorkSubmissionController();
