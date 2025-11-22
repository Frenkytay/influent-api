import WorkSubmission from "../models/WorkSubmission.js";
import CampaignUsers from "../models/CampaignUsers.js";
import Campaign from "../models/Campaign.js";
import Student from "../models/Student.js";
import User from "../models/User.js";
import { formatResponse } from "../utils/responseFormatter.js";

/**
 * Create a new work submission
 */
export const createSubmission = async (req, res, next) => {
  try {
    const {
      campaign_user_id,
      submission_type,
      content_type,
      content_url,
      content_files,
      caption,
      hashtags,
      platform,
      submission_notes,
    } = req.body;

    // Verify that the student is accepted for this campaign
    const campaignUser = await CampaignUsers.findOne({
      where: {
        id: campaign_user_id,
        application_status: "accepted",
      },
    });

    if (!campaignUser) {
      return res
        .status(403)
        .json(
          formatResponse(null, "Campaign user not found or not accepted", false)
        );
    }

    // Create submission
    const submission = await WorkSubmission.create({
      campaign_user_id,
      submission_type,
      content_type,
      content_url,
      content_files,
      caption,
      hashtags,
      platform,
      submission_notes,
      status: "pending",
    });

    res
      .status(201)
      .json(
        formatResponse(submission, "Work submission created successfully", true)
      );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all submissions for a campaign
 */
export const getCampaignSubmissions = async (req, res, next) => {
  try {
    const { campaign_id } = req.params;
    const { status } = req.query;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const submissions = await WorkSubmission.findAll({
      where: whereClause,
      include: [
        {
          model: CampaignUsers,
          where: { campaign_id },
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
              attributes: ["campaign_id", "title", "banner_image"],
            },
          ],
        },
      ],
      order: [["submitted_at", "DESC"]],
    });

    res.json(
      formatResponse(submissions, "Submissions retrieved successfully", true)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all submissions by a student
 */
export const getStudentSubmissions = async (req, res, next) => {
  try {
    const { student_id } = req.params;
    const { status } = req.query;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const submissions = await WorkSubmission.findAll({
      where: whereClause,
      include: [
        {
          model: CampaignUsers,
          where: { student_id },
          include: [
            {
              model: Campaign,
              attributes: ["campaign_id", "title", "banner_image", "status"],
            },
          ],
        },
      ],
      order: [["submitted_at", "DESC"]],
    });

    res.json(
      formatResponse(submissions, "Submissions retrieved successfully", true)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single submission by ID
 */
export const getSubmissionById = async (req, res, next) => {
  try {
    const { submission_id } = req.params;

    const submission = await WorkSubmission.findByPk(submission_id, {
      include: [
        {
          model: CampaignUsers,
          include: [
            {
              model: Campaign,
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

    if (!submission) {
      return res
        .status(404)
        .json(formatResponse(null, "Submission not found", false));
    }

    res.json(
      formatResponse(submission, "Submission retrieved successfully", true)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update submission (for students to edit their work)
 */
export const updateSubmission = async (req, res, next) => {
  try {
    const { submission_id } = req.params;
    const {
      content_type,
      content_url,
      content_files,
      caption,
      hashtags,
      platform,
      submission_notes,
      submission_type,
    } = req.body;

    const submission = await WorkSubmission.findByPk(submission_id);

    if (!submission) {
      return res
        .status(404)
        .json(formatResponse(null, "Submission not found", false));
    }

    // Only allow updates if status is pending or revision_requested
    if (!["pending", "revision_requested"].includes(submission.status)) {
      return res
        .status(403)
        .json(
          formatResponse(
            null,
            "Cannot update submission with current status",
            false
          )
        );
    }

    await submission.update({
      content_type,
      content_url,
      content_files,
      caption,
      hashtags,
      platform,
      submission_notes,
      submission_type,
      updated_at: new Date(),
    });

    res.json(
      formatResponse(submission, "Submission updated successfully", true)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Review submission (approve/reject/request revision)
 */
export const reviewSubmission = async (req, res, next) => {
  try {
    const { submission_id } = req.params;
    const { status, review_notes, reviewed_by } = req.body;

    const submission = await WorkSubmission.findByPk(submission_id);

    if (!submission) {
      return res
        .status(404)
        .json(formatResponse(null, "Submission not found", false));
    }

    const updateData = {
      status,
      review_notes,
      reviewed_by,
      reviewed_at: new Date(),
      updated_at: new Date(),
    };

    if (status === "approved") {
      updateData.approved_at = new Date();
    } else if (status === "rejected") {
      updateData.rejected_at = new Date();
    } else if (status === "revision_requested") {
      updateData.revision_count = submission.revision_count + 1;
    }

    await submission.update(updateData);

    res.json(
      formatResponse(submission, "Submission reviewed successfully", true)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Mark submission as published
 */
export const markAsPublished = async (req, res, next) => {
  try {
    const { submission_id } = req.params;
    const { performance_metrics } = req.body;

    const submission = await WorkSubmission.findByPk(submission_id);

    if (!submission) {
      return res
        .status(404)
        .json(formatResponse(null, "Submission not found", false));
    }

    if (submission.status !== "approved") {
      return res
        .status(403)
        .json(
          formatResponse(
            null,
            "Only approved submissions can be marked as published",
            false
          )
        );
    }

    await submission.update({
      is_published: true,
      published_at: new Date(),
      performance_metrics,
      updated_at: new Date(),
    });

    res.json(
      formatResponse(submission, "Submission marked as published", true)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update performance metrics
 */
export const updatePerformanceMetrics = async (req, res, next) => {
  try {
    const { submission_id } = req.params;
    const { performance_metrics } = req.body;

    const submission = await WorkSubmission.findByPk(submission_id);

    if (!submission) {
      return res
        .status(404)
        .json(formatResponse(null, "Submission not found", false));
    }

    await submission.update({
      performance_metrics,
      updated_at: new Date(),
    });

    res.json(formatResponse(submission, "Performance metrics updated", true));
  } catch (error) {
    next(error);
  }
};

/**
 * Delete submission
 */
export const deleteSubmission = async (req, res, next) => {
  try {
    const { submission_id } = req.params;

    const submission = await WorkSubmission.findByPk(submission_id);

    if (!submission) {
      return res
        .status(404)
        .json(formatResponse(null, "Submission not found", false));
    }

    // Only allow deletion if status is pending or rejected
    if (!["pending", "rejected"].includes(submission.status)) {
      return res
        .status(403)
        .json(
          formatResponse(
            null,
            "Cannot delete submission with current status",
            false
          )
        );
    }

    await submission.destroy();

    res.json(formatResponse(null, "Submission deleted successfully", true));
  } catch (error) {
    next(error);
  }
};
