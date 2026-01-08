import BaseService from "../core/BaseService.js";
import WorkSubmissionRepository from "../repositories/WorkSubmissionRepository.js";
import CampaignUsersRepository from "../repositories/CampaignUsersRepository.js";
import NotificationService from "./NotificationService.js";

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
      include: ["campaign", "user"], // Include campaign for title and owner, user for student name
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

    const submission = await this.repository.create(submissionData);

    // Notify campaign owner (company)
    if (campaignUser.campaign && campaignUser.campaign.user_id) {
      await NotificationService.createNotification({
        user_id: campaignUser.campaign.user_id,
        type: "work_submission",
        title: "Pengajuan Pekerjaan Baru",
        message: `Mahasiswa ${campaignUser.user ? campaignUser.user.name : "Unknown"} telah mengirimkan pekerjaan untuk kampanye "${campaignUser.campaign.title}".`,
      });
    }

    return submission;
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
    const submission = await this.getSubmissionWithRelations(id);
    if (!submission) {
      throw new Error("Submission not found");
    }

    const updated = await this.repository.updateStatus(id, "approved", {
      reviewed_by: reviewedBy,
      review_feedback: feedback,
      reviewed_at: new Date(),
    });

    // Notify student
    const campaignUser = submission.CampaignUser;
    if (campaignUser && campaignUser.student_id) {
      await NotificationService.createNotification({
        user_id: campaignUser.student_id ? (campaignUser.user ? campaignUser.user.user_id : null) : null,
        // Fallback or better logic: CampaignUser belongsTo User (as student). 
        // Let's rely on campaignUser.student_id or campaignUser.user.user_id 
        // In CampaignUsers model: belongsTo User as 'user', and Student as 'student'.
        // user_id in Notification is the global User ID.
        // Assuming campaignUser.user is the User model for the student.
        user_id: campaignUser.user ? campaignUser.user.user_id : campaignUser.student_id, 
        type: "work_status",
        title: "Pengajuan Pekerjaan Disetujui!",
        message: `Kabar baik! Pengajuan pekerjaan Anda untuk "${campaignUser.campaign.title}" telah disetujui.${feedback ? ` Masukan: ${feedback}` : ''}`,
      });
    }

    return updated;
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
      review_notes: feedback,
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

  /**
   * Reject the rejection (Admin)
   * Reverts status to pending
   */
  async rejectRejection(id, adminId, reason) {
    const submission = await this.repository.findById(id);
    if (!submission) {
      throw new Error("Submission not found");
    }

    if (submission.status !== "rejected") {
      throw new Error("Can only reject submissions with 'rejected' status");
    }

    // Notify company that rejection was overruled (optional, but good practice)
    // We need to find the company user.
    // Submission -> CampaignUser -> Campaign -> User (Company)
    const fullSubmission = await this.getSubmissionWithRelations(id);
    const campaignUser = fullSubmission.CampaignUser;
    
    if (campaignUser && campaignUser.campaign && campaignUser.campaign.user_id) {
       await NotificationService.createNotification({
        user_id: campaignUser.campaign.user_id,
        type: "work_submission",
        title: "Penolakan Dibatalkan Admin",
        message: `Penolakan Anda untuk pengajuan pada kampanye "${campaignUser.campaign.title}" telah dibatalkan oleh Admin.${reason ? ` Alasan: ${reason}` : ''} Silakan tinjau kembali.`,
       });
    }

    return await this.repository.update(id, {
      status: "pending", // Revert to pending
      reviewed_by: null, // Clear reviewer
      review_feedback: null, // Clear feedback
      reviewed_at: null,
      admin_feedback: reason // Store why admin rejected the rejection if we want
    });
  }
}

export default new WorkSubmissionService();
