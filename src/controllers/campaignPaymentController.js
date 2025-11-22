import {
  payStudentForCampaign,
  payAllStudentsInCampaign,
  payStudentsCustom,
} from "../utils/paymentService.js";
import Campaign from "../models/Campaign.js";
import CampaignUsers from "../models/CampaignUsers.js";

/**
 * Pay a single student for their work on a campaign
 * POST /api/v1/campaign-payments/pay-student
 * Admin only
 */
export const paySingleStudent = async (req, res) => {
  try {
    const { campaign_user_id, amount, description } = req.body;

    if (!campaign_user_id || !amount) {
      return res.status(400).json({
        error: "campaign_user_id and amount are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        error: "Amount must be greater than 0",
      });
    }

    const result = await payStudentForCampaign(
      campaign_user_id,
      amount,
      description
    );

    return res.status(200).json({
      message: "Payment processed successfully",
      ...result,
    });
  } catch (error) {
    console.error("Error processing student payment:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

/**
 * Pay all accepted students in a campaign with the same amount
 * POST /api/v1/campaign-payments/pay-all
 * Admin only
 */
export const payAllStudents = async (req, res) => {
  try {
    const { campaign_id, amount_per_student } = req.body;

    if (!campaign_id || !amount_per_student) {
      return res.status(400).json({
        error: "campaign_id and amount_per_student are required",
      });
    }

    if (amount_per_student <= 0) {
      return res.status(400).json({
        error: "Amount must be greater than 0",
      });
    }

    // Check if campaign exists
    const campaign = await Campaign.findByPk(campaign_id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const result = await payAllStudentsInCampaign(
      campaign_id,
      amount_per_student
    );

    return res.status(200).json({
      message: "Batch payment processed",
      campaign: {
        id: campaign.campaign_id,
        title: campaign.title,
      },
      ...result,
    });
  } catch (error) {
    console.error("Error processing batch payment:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

/**
 * Pay multiple students with custom amounts
 * POST /api/v1/campaign-payments/pay-custom
 * Admin only
 * Body: { payments: [{campaign_user_id, amount, description}, ...] }
 */
export const payCustomAmounts = async (req, res) => {
  try {
    const { payments } = req.body;

    if (!payments || !Array.isArray(payments) || payments.length === 0) {
      return res.status(400).json({
        error: "payments array is required and must not be empty",
      });
    }

    // Validate each payment
    for (const payment of payments) {
      if (!payment.campaign_user_id || !payment.amount) {
        return res.status(400).json({
          error: "Each payment must have campaign_user_id and amount",
        });
      }
      if (payment.amount <= 0) {
        return res.status(400).json({
          error: "All amounts must be greater than 0",
        });
      }
    }

    const result = await payStudentsCustom(payments);

    return res.status(200).json({
      message: "Custom payments processed",
      ...result,
    });
  } catch (error) {
    console.error("Error processing custom payments:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

export default {
  paySingleStudent,
  payAllStudents,
  payCustomAmounts,
};
