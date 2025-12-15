/**
 * Campaign Workflow Controller
 * Handles sub-status transitions for active campaigns
 */

import Campaign from "../models/Campaign.js";

// Transition campaign to next sub-status
const transitionSubStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { sub_status } = req.body;

    const campaign = await Campaign.findByPk(id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    // Only active campaigns can have sub-status
    if (campaign.status !== "active") {
      return res.status(400).json({ error: "Campaign must be active to set sub-status" });
    }

    // Validate sub-status
    const validSubStatuses = [
      "registration_open",
      "student_selection",
      "student_confirmation",
      "content_submission",
      "content_revision",
      "violation_reported",
      "violation_confirmed",
      "posting",
      "payout_success"
    ];

    if (!validSubStatuses.includes(sub_status)) {
      return res.status(400).json({ error: "Invalid sub-status" });
    }

    await campaign.update({ sub_status, updated_at: new Date() });

    res.json({ message: "Sub-status updated successfully", campaign });
  } catch (err) {
    console.error("Error updating sub-status:", err);
    res.status(500).json({ error: "Failed to update sub-status" });
  }
};

// Auto-transition based on campaign dates and conditions
const autoTransitionSubStatus = async (campaignId) => {
  try {
    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign || campaign.status !== "active") return;

    const now = new Date();
    const regDeadline = new Date(campaign.registration_deadline);
    const subDeadline = new Date(campaign.submission_deadline);
    const startDate = new Date(campaign.start_date);
    const endDate = new Date(campaign.end_date);

    // Logic untuk auto-transition
    if (now < regDeadline && !campaign.sub_status) {
      await campaign.update({ sub_status: "registration_open" });
    } else if (now >= regDeadline && now < subDeadline) {
      if (campaign.sub_status === "registration_open") {
        await campaign.update({ sub_status: "student_selection" });
      }
    } else if (now >= subDeadline && now < startDate) {
      if (["student_selection", "student_confirmation"].includes(campaign.sub_status)) {
        await campaign.update({ sub_status: "content_submission" });
      }
    } else if (now >= startDate && now < endDate) {
      if (["content_submission", "content_revision"].includes(campaign.sub_status)) {
        await campaign.update({ sub_status: "posting" });
      }
    } else if (now >= endDate) {
      if (campaign.sub_status !== "payout_success") {
        await campaign.update({ sub_status: "payout_success" });
      }
    }
  } catch (err) {
    console.error("Error auto-transitioning sub-status:", err);
  }
};

export default {
  transitionSubStatus,
  autoTransitionSubStatus
};
