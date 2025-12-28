import PostSubmissionRepository from "../repositories/PostSubmissionRepository.js";
import WorkSubmissionRepository from "../repositories/WorkSubmissionRepository.js";
import NotificationService from "./NotificationService.js";
import CampaignUsersRepository from "../repositories/CampaignUsersRepository.js";

class PostSubmissionService {
  async createSubmission(data) {
    const { work_submission_id, post_link } = data;

    // Verify work submission exists and is approved
    // Verify work submission exists and is approved, with relations to identify campaign owner
    const workSubmission = await WorkSubmissionRepository.findByIdWithRelations(work_submission_id);
    if (!workSubmission) {
      throw new Error("Work submission not found");
    }

    if (workSubmission.status !== "approved") {
      throw new Error("Work submission must be approved before submitting post link");
    }

    // Check if post submission already exists
    const existing = await PostSubmissionRepository.findByWorkSubmissionId(work_submission_id);
    if (existing) {
      throw new Error("Post link already submitted for this work");
    }

    const postSubmission = await PostSubmissionRepository.create({
      work_submission_id,
      post_link,
      status: "pending",
    });

    // Notify campaign owner (company)
    const campaignUser = workSubmission.CampaignUser;
    if (campaignUser && campaignUser.campaign && campaignUser.campaign.user_id) {
      // Get student name securely
      const studentName = campaignUser.Student?.User?.name || "Unknown Student";
      
      await NotificationService.createNotification({
        user_id: campaignUser.campaign.user_id,
        type: "post_submission",
        title: "New Post Link Submitted",
        message: `Student ${studentName} has submitted the post link for campaign "${campaignUser.campaign.title}".`,
      });
    }

    return postSubmission;
  }

  async verifySubmission(id, status) {
    if (!["verified", "rejected"].includes(status)) {
      throw new Error("Invalid status");
    }
    return await PostSubmissionRepository.updateStatus(id, status);
  }

  async getSubmissionByWorkId(workSubmissionId) {
    return await PostSubmissionRepository.findByWorkSubmissionId(workSubmissionId);
  }

  async getSubmissionById(id) {
    return await PostSubmissionRepository.findById(id);
  }
}

export default new PostSubmissionService();
