import BaseService from "../core/BaseService.js";
import WorkSubmissionRepository from "../repositories/WorkSubmissionRepository.js";
import CampaignUsersRepository from "../repositories/CampaignUsersRepository.js";

class WorkSubmissionService extends BaseService {
  constructor() {
    super(WorkSubmissionRepository);
    this.campaignUsersRepo = CampaignUsersRepository;
  }

  /**
   * Create a work submission
   */
  async createSubmission(data) {
    // Verify that the student is accepted for this campaign
    const campaignUser = await this.campaignUsersRepo.findOne({
      where: {
        id: data.campaign_user_id,
        application_status: "accepted",
      },
    });

    if (!campaignUser) {
      throw new Error("Campaign user not found or not accepted");
    }

    // Set default status
    const submissionData = {
      ...data,
      status: data.status || "pending",
    };

    // Handle submissionContent -> submission_content mapping
    if (data.submissionContent) {
      let submissionContent = data.submissionContent;
      if (typeof submissionContent === "string") {
        try {
          submissionContent = JSON.parse(submissionContent);
        } catch (e) {
          // Keep as string if parsing fails
        }
      }
      submissionData.submission_content = submissionContent;
    }

    return await this.repository.create(submissionData);
  }

  /**
   * Get submissions by campaign
   */
  async getCampaignSubmissions(campaignId, filters = {}) {
    const options = {};
    if (filters.status) {
      options.where = { status: filters.status };
    }
    return await this.repository.findByCampaignId(campaignId, options);
  }

  /**
   * Get all rejected submissions
   */
  async getAllRejected() {
    return await this.repository.findAll({
      where: { status: "rejected" },
      order: [["updated_at", "DESC"]],
      include: [
        {
          model: this.campaignUsersRepo.model,
          include: ["campaign", "user"],
        },
      ],
    });
  }

  /**
   * Get submissions by student
   */
  async getStudentSubmissions(studentId, filters = {}) {
    const options = {};
    if (filters.status) {
      options.where = { status: filters.status };
    }
    return await this.repository.findByStudentId(studentId, options);
  }

  /**
   * Get submission by ID with relations
   */
  async getSubmissionWithRelations(id) {
    return await this.repository.findByIdWithRelations(id);
  }

  /**
   * Update submission
   */
  async updateSubmission(id, data) {
    const submission = await this.repository.findById(id);
    if (!submission) {
      throw new Error("Submission not found");
    }

    // Only allow updating certain fields
    const allowedFields = [
      "content_url",
      "content_files",
      "caption",
      "hashtags",
      "platform",
      "submission_notes",
      "submission_content"
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      // Map submissionContent to submission_content for update
      if (field === "submission_content" && data.submissionContent !== undefined) {
         let submissionContent = data.submissionContent;
         if (typeof submissionContent === "string") {
            try {
              submissionContent = JSON.parse(submissionContent);
            } catch (e) {
              // Keep as string if parsing fails
            }
         }
         updateData.submission_content = submissionContent;
      } else if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    return await this.repository.update(id, updateData);
  }

  /**
   * Approve submission
   */
  async approveSubmission(id, reviewedBy, feedback = null) {
    return await this.repository.updateStatus(id, "approved", {
      reviewed_by: reviewedBy,
      review_feedback: feedback,
      reviewed_at: new Date(),
    });
  }

  /**
   * Reject submission
   */
  async rejectSubmission(id, reviewedBy, feedback) {
    if (!feedback) {
      throw new Error("Rejection feedback is required");
    }

    return await this.repository.updateStatus(id, "rejected", {
      reviewed_by: reviewedBy,
      review_feedback: feedback,
      reviewed_at: new Date(),
    });
  }

  /**
   * Request revisions
   */
  async requestRevisions(id, reviewedBy, feedback) {
    if (!feedback) {
      throw new Error("Revision feedback is required");
    }

    return await this.repository.updateStatus(id, "revision_requested", {
      reviewed_by: reviewedBy,
      review_feedback: feedback,
      reviewed_at: new Date(),
    });
  }

  /**
   * Resubmit after revisions
   */
  async resubmit(id, data) {
    const submission = await this.repository.findById(id);
    if (!submission) {
      throw new Error("Submission not found");
    }

    if (submission.status !== "revision_requested") {
      throw new Error("Can only resubmit submissions with revision_requested status");
    }

    return await this.repository.update(id, {
      ...data,
      status: "pending",
      reviewed_by: null,
      review_feedback: null,
      reviewed_at: null,
    });
  }

  /**
   * Delete submission
   */
  async deleteSubmission(id) {
    return await this.repository.delete(id);
  }
}

export default new WorkSubmissionService();
