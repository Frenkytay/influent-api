import User from "../models/User.js";
import Campaign from "../models/Campaign.js";
import CampaignUsers from "../models/CampaignUsers.js";
import Transaction from "../models/Transaction.js";
import Notification from "../models/Notification.js";
import sequelize from "../config/db.js";

/**
 * Distribute payment to a specific student for a campaign
 * @param {number} campaignUserId - The campaign_users record ID
 * @param {number} amount - Amount to pay the student
 * @param {string} description - Payment description
 */
export const payStudentForCampaign = async (
  campaignUserId,
  amount,
  description = null
) => {
  const t = await sequelize.transaction();

  try {
    console.log("Looking up campaignUser with ID:", campaignUserId);
    // Get campaign user details
    const campaignUser = await CampaignUsers.findByPk(campaignUserId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "name", "email", "balance"],
        },
        {
          model: Campaign,
          as: "campaign",
          attributes: ["campaign_id", "title"],
        },
      ],
      transaction: t,
    });

    if (!campaignUser) {
      throw new Error(
        `Campaign user record with id ${campaignUserId} not found. Make sure to use the campaignUsers.id value, not student_id.`
      );
    }

    const student = campaignUser.user;
    const campaign = campaignUser.campaign;

    // Update student balance
    const balanceBefore = parseFloat(student.balance || 0);
    const paymentAmount = parseFloat(amount);
    const balanceAfter = balanceBefore + paymentAmount;

    await student.update({ balance: balanceAfter }, { transaction: t });

    // Record transaction
    const transaction = await Transaction.create(
      {
        user_id: student.user_id,
        amount: paymentAmount,
        type: "credit",
        category: "campaign_payment",
        reference_type: "campaign_users",
        reference_id: campaignUserId,
        description: description || `Payment for campaign: ${campaign.title}`,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
      },
      { transaction: t }
    );

    // Create notification
    await Notification.create(
      {
        user_id: student.user_id,
        title: "Campaign Payment Received",
        message: `You received Rp ${paymentAmount.toLocaleString(
          "id-ID"
        )} for completing campaign: ${campaign.title}`,
        type: "payment",
        is_read: false,
      },
      { transaction: t }
    );

    // Update campaign_users payment status if field exists
    if (campaignUser.payment_status !== undefined) {
      await campaignUser.update({ payment_status: "paid" }, { transaction: t });
    }

    await t.commit();

    return {
      success: true,
      transaction,
      student: {
        user_id: student.user_id,
        name: student.name,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
      },
    };
  } catch (error) {
    await t.rollback();
    console.error("Error paying student for campaign:", error);
    throw error;
  }
};

/**
 * Distribute payments to all students in a campaign
 * @param {number} campaignId - The campaign ID
 * @param {number} amountPerStudent - Amount to pay each student
 */
export const payAllStudentsInCampaign = async (
  campaignId,
  amountPerStudent
) => {
  try {
    // Get all students in the campaign
    const campaignUsers = await CampaignUsers.findAll({
      where: {
        campaign_id: campaignId,
        application_status: "accepted", // Only pay accepted students
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "name", "email"],
        },
        {
          model: Campaign,
          as: "campaign",
          attributes: ["campaign_id", "title"],
        },
      ],
    });

    if (campaignUsers.length === 0) {
      return {
        success: false,
        message: "No accepted students found in this campaign",
        paid_count: 0,
      };
    }

    const results = [];
    const errors = [];

    // Pay each student
    for (const campaignUser of campaignUsers) {
      try {
        console.log("Paying campaignUser:", {
          id: campaignUser.id,
          student_id: campaignUser.student_id,
        });
        const result = await payStudentForCampaign(
          campaignUser.id,
          amountPerStudent,
          `Payment for campaign: ${campaignUser.campaign.title}`
        );
        results.push(result);
      } catch (error) {
        errors.push({
          student_name: campaignUser.user.name,
          error: error.message,
        });
      }
    }

    return {
      success: true,
      total_students: campaignUsers.length,
      paid_count: results.length,
      failed_count: errors.length,
      total_paid: amountPerStudent * results.length,
      results,
      errors,
    };
  } catch (error) {
    console.error("Error paying all students in campaign:", error);
    throw error;
  }
};

/**
 * Pay specific students with custom amounts
 * @param {Array} payments - Array of {campaign_user_id, amount, description}
 */
export const payStudentsCustom = async (payments) => {
  const results = [];
  const errors = [];

  for (const payment of payments) {
    try {
      const result = await payStudentForCampaign(
        payment.campaign_user_id,
        payment.amount,
        payment.description
      );
      results.push(result);
    } catch (error) {
      errors.push({
        campaign_user_id: payment.campaign_user_id,
        error: error.message,
      });
    }
  }

  return {
    success: true,
    paid_count: results.length,
    failed_count: errors.length,
    results,
    errors,
  };
};

export default {
  payStudentForCampaign,
  payAllStudentsInCampaign,
  payStudentsCustom,
};
