import BaseRepository from "../core/BaseRepository.js";
import WorkSubmission from "../models/WorkSubmission.js";
import CampaignUsers from "../models/CampaignUsers.js";
import Campaign from "../models/Campaign.js";
import Student from "../models/Student.js";
import User from "../models/User.js";

class WorkSubmissionRepository extends BaseRepository {
  constructor() {
    super(WorkSubmission);
  }

  /**
   * Find submissions by campaign ID
   */
  async findByCampaignId(campaignId, options = {}) {
    return await this.model.findAll({
      ...options,
      include: [
        {
          model: CampaignUsers,
          where: { campaign_id: campaignId },
          include: [
            {
              model: Student,
              include: [
                {
                  model: User,
                  attributes: ["user_id", "name", "email", "profile_image"],
                },
              ],
            },
            {
              model: Campaign,
              as: "campaign",
              attributes: ["campaign_id", "title", "banner_image"],
            },
          ],
        },
      ],
      order: [["submitted_at", "DESC"]],
    });
  }

  /**
   * Find submissions by student ID
   */
  async findByStudentId(studentId, options = {}) {
    return await this.model.findAll({
      ...options,
      include: [
        {
          model: CampaignUsers,
          where: { student_id: studentId },
          include: [
            {
              model: Campaign,
              as: "campaign",
              attributes: ["campaign_id", "title", "banner_image", "status"],
            },
          ],
        },
      ],
      order: [["submitted_at", "DESC"]],
    });
  }

  /**
   * Find submission by ID with full relations
   */
  async findByIdWithRelations(id) {
    return await this.model.findByPk(id, {
      include: [
        {
          model: CampaignUsers,
          include: [
            {
              model: Campaign,
              as: "campaign",
              attributes: ["campaign_id", "title", "user_id", "banner_image"],
            },
            {
              model: Student,
              include: [
                {
                  model: User,
                  attributes: ["user_id", "name", "email", "profile_image"],
                },
              ],
            },
          ],
        },
      ],
    });
  }

  /**
   * Find submissions by status
   */
  async findByStatus(status, options = {}) {
    return await this.findAll({
      where: { status },
      ...options,
    });
  }

  /**
   * Update submission status
   */
  async updateStatus(id, status, reviewData = {}) {
    const submission = await this.findById(id);
    if (!submission) return null;

    return await submission.update({
      status,
      ...reviewData,
    });
  }
}

export default new WorkSubmissionRepository();
