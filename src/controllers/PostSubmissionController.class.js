import BaseController from "../core/BaseController.js";
import PostSubmissionService from "../services/PostSubmissionService.js";

class PostSubmissionController extends BaseController {
  constructor() {
    super(PostSubmissionService);
  }

  /**
   * Submit post link
   */
  submitLink = this.asyncHandler(async (req, res) => {
    const submission = await this.service.createSubmission(req.body);
    this.sendSuccess(res, submission, 201);
  });

  /**
   * Get submission by Work Submission ID
   */
  getByWorkSubmissionId = this.asyncHandler(async (req, res) => {
    const { work_submission_id } = req.params;
    const submission = await this.service.getSubmissionByWorkId(work_submission_id);
    this.sendSuccess(res, submission);
  });

  /**
   * Verify or Reject submission
   */
  verifySubmission = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const submission = await this.service.verifySubmission(id, status);
    
    if (!submission) {
      return this.sendError(res, "Submission not found", 404);
    }
    
    this.sendSuccess(res, submission);
  });
}

export default new PostSubmissionController();
