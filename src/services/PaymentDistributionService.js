import User from "../models/User.js";
import Campaign from "../models/Campaign.js";
import CampaignUsers from "../models/CampaignUsers.js";
import Transaction from "../models/Transaction.js";
import Notification from "../models/Notification.js";
import sequelize from "../config/db.js";

/**
 * PaymentDistributionService - Handles payment distribution to students for campaigns
 */
class PaymentDistributionService {
  /**
   * Pay a single student for their campaign work
   */
  async payStudentForCampaign(campaignUserId, amount, description = null) {
    const t = await sequelize.transaction();

    try {
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
          `Campaign user record with id ${campaignUserId} not found`
        );
      }

      const student = campaignUser.user;
      const campaign = campaignUser.campaign;

      const balanceBefore = parseFloat(student.balance || 0);
      const paymentAmount = parseFloat(amount);
      const balanceAfter = balanceBefore + paymentAmount;

      await student.update({ balance: balanceAfter }, { transaction: t });

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

      if (campaignUser.payment_status !== undefined) {
        await campaignUser.update(
          { payment_status: "paid" },
          { transaction: t }
        );
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
        campaign: {
          campaign_id: campaign.campaign_id,
          title: campaign.title,
        },
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  /**
   * Pay all accepted students in a campaign with the same amount
   */
  /**
   * Pay all accepted students in a campaign using campaign's price_per_post
   */
  async payAllStudentsInCampaign(campaignId) {
    // 1. Fetch Campaign to get price_per_post
    const campaign = await Campaign.findByPk(campaignId, {
      attributes: ["campaign_id", "title", "price_per_post"],
    });

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    const amountPerStudent = parseFloat(campaign.price_per_post);

    if (!amountPerStudent || amountPerStudent <= 0) {
      throw new Error(
        "Campaign has no valid price_per_post set. Cannot process automatic payments."
      );
    }

    // 2. Fetch all accepted students
    const acceptedStudents = await CampaignUsers.findAll({
      where: {
        campaign_id: campaignId,
        application_status: "accepted",
        // Optional: Exclude already paid users?
        // payment_status: { [Op.ne]: 'paid' } // If you want to avoid double paying
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "name"],
        },
      ],
    });

    if (acceptedStudents.length === 0) {
      return {
        success: true,
        message: "No accepted students found for this campaign",
        paid_count: 0,
        failed_count: 0,
        results: [],
      };
    }

    const results = [];
    let paidCount = 0;
    let failedCount = 0;

    for (const campaignUser of acceptedStudents) {
      try {
        // Skip if already paid? (Logic depends on your requirements, assuming Pay All pays everyone found)
        
        const result = await this.payStudentForCampaign(
          campaignUser.id,
          amountPerStudent,
          `Batch payment for campaign: ${campaign.title}`
        );
        results.push({
          student_id: campaignUser.user.user_id,
          student_name: campaignUser.user.name,
          status: "success",
          ...result,
        });
        paidCount++;
      } catch (error) {
        results.push({
          student_id: campaignUser.user.user_id,
          student_name: campaignUser.user.name,
          status: "failed",
          error: error.message,
        });
        failedCount++;
      }
    }

    return {
      success: true,
      paid_count: paidCount,
      failed_count: failedCount,
      total_amount: paidCount * amountPerStudent,
      results,
    };
  }

  /**
   * Pay multiple students with custom amounts
   */
  async payStudentsCustom(payments) {
    const results = [];
    let paidCount = 0;
    let failedCount = 0;
    let totalAmount = 0;

    for (const payment of payments) {
      try {
        const result = await this.payStudentForCampaign(
          payment.campaign_user_id,
          payment.amount,
          payment.description || "Custom payment"
        );
        results.push({
          campaign_user_id: payment.campaign_user_id,
          status: "success",
          ...result,
        });
        paidCount++;
        totalAmount += parseFloat(payment.amount);
      } catch (error) {
        results.push({
          campaign_user_id: payment.campaign_user_id,
          status: "failed",
          error: error.message,
        });
        failedCount++;
      }
    }

    return {
      success: true,
      paid_count: paidCount,
      failed_count: failedCount,
      total_amount: totalAmount,
      results,
    };
  }
}

export default new PaymentDistributionService();
