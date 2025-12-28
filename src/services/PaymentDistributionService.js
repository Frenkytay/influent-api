import User from "../models/User.js";
import Campaign from "../models/Campaign.js";
import CampaignUsers from "../models/CampaignUsers.js";
import Transaction from "../models/Transaction.js";
import Payment from "../models/Payment.js";
import Notification from "../models/Notification.js";
import WorkSubmission from "../models/WorkSubmission.js";
import sequelize from "../config/db.js";
import { Op } from "sequelize";

/**
 * PaymentDistributionService - Handles payment distribution to students for campaigns
 */
class PaymentDistributionService {
  /**
   * Check if all accepted students are paid and update campaign status
   */
  async checkAndUpdateCampaignStatus(campaignId, transaction = null) {
    try {
      console.log(`[DEBUG] checkAndUpdateCampaignStatus for Campaign ${campaignId}`);
      // 1. Get all accepted students
      const acceptedCount = await CampaignUsers.count({
        where: { campaign_id: campaignId, application_status: "accepted" },
        transaction,
      });

      console.log(`[DEBUG] Campaign ${campaignId}: Accepted Students = ${acceptedCount}`);

      if (acceptedCount === 0) return;

      // 2. Get accepted students IDs
      const acceptedUsers = await CampaignUsers.findAll({
        where: { campaign_id: campaignId, application_status: "accepted" },
        attributes: ["id"],
        transaction,
      });
      const acceptedIds = acceptedUsers.map((u) => u.id);

      // 3. Count distinct payments for these users
      const paymentCount = await Transaction.count({
        where: {
          reference_type: "campaign_users",
          reference_id: { [Op.in]: acceptedIds },
          type: "credit",
        },
        distinct: true,
        col: "reference_id",
        transaction,
      });

      console.log(`[DEBUG] Campaign ${campaignId}: Paid Students Count = ${paymentCount}`);

      // 4. Compare and Update
      if (paymentCount >= acceptedCount) {
        console.log(`[DEBUG] All students paid for Campaign ${campaignId}. Updating status to 'paid'.`);
        await Campaign.update(
          { status: "paid" },
          { where: { campaign_id: campaignId }, transaction }
        );

        // Refund remaining budget
        await this.refundRemainingBudget(campaignId, transaction);
      }
    } catch (error) {
      console.error("Error updating campaign status:", error);
    }
  }

  /**
   * Refund remaining campaign budget to company wallet
   */
  async refundRemainingBudget(campaignId, transaction = null) {
    try {
      const campaign = await Campaign.findByPk(campaignId, { 
        attributes: ["campaign_id", "user_id", "title"], 
        transaction 
      });
      if (!campaign || !campaign.user_id) return;

      // 1. Calculate Total Payment (Budget)
      const totalBudget = await Payment.sum("amount", {
        where: { campaign_id: campaignId, status: "success" },
        transaction,
      }) || 0;
      
      console.log(`[DEBUG] Campaign ${campaignId} (${campaign.title}): Total Budget = ${totalBudget}`);

      // 2. Calculate Total Distributed (Spending)
      // Get all CampaignUser IDs for this campaign
      const campaignUserIds = await CampaignUsers.findAll({
         where: { campaign_id: campaignId },
         attributes: ["id"],
         transaction
      });
      const ids = campaignUserIds.map(cu => cu.id);
      
      let totalDistributed = 0;
      if (ids.length > 0) {
        totalDistributed = await Transaction.sum("amount", {
          where: {
             reference_type: "campaign_users",
             reference_id: { [Op.in]: ids },
             type: "credit"
          },
          transaction
        }) || 0;
      }

      console.log(`[DEBUG] Campaign ${campaignId}: Total Distributed = ${totalDistributed}`);

      const remaining = parseFloat(totalBudget) - parseFloat(totalDistributed);
      console.log(`[DEBUG] Campaign ${campaignId}: Remaining = ${remaining}`);

      if (remaining > 0) {
         // Create Refund Transaction
         console.log(`[DEBUG] Processing refund of ${remaining} to user ${campaign.user_id}`);
         const companyUser = await User.findByPk(campaign.user_id, { transaction });
         const balanceBefore = parseFloat(companyUser.balance || 0);
         const balanceAfter = balanceBefore + remaining;

         await companyUser.update({ balance: balanceAfter }, { transaction });

         await Transaction.create({
           user_id: campaign.user_id,
           amount: remaining,
           type: "credit",
           category: "refund", // Ensure 'refund' is in enum
           reference_type: "campaign_refund",
           reference_id: campaignId,
           description: `Refund of remaining budget for campaign: ${campaign.title}`,
           balance_before: balanceBefore,
           balance_after: balanceAfter,
         }, { transaction });

         // Notify Company
         await Notification.create({
            user_id: campaign.user_id,
            type: "refund",
            title: "Campaign Budget Refund",
            message: `A refund of Rp ${remaining.toLocaleString("id-ID")} has been credited to your wallet from campaign "${campaign.title}".`,
            is_read: false
         }, { transaction });
      } else {
        console.log(`[DEBUG] No remaining budget to refund.`);
      }

    } catch (error) {
      console.error("Error refunding budget:", error);
    }
  }

  /**
   * Pay a single student for their campaign work
   */
  async payStudentForCampaign(
    campaignUserId,
    amount,
    description = null,
    checkStatus = true
  ) {
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

      // Check campaign status after commit (new transaction scope)
      if (checkStatus) {
        await this.checkAndUpdateCampaignStatus(campaign.campaign_id);
      }

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
        {
          model: WorkSubmission,
          where: { status: "approved" },
          required: true,
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
          `Batch payment for campaign: ${campaign.title}`,
          false // Skip individual status check for optimization
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

    // Check status once after batch processing
    if (paidCount > 0) {
      await this.checkAndUpdateCampaignStatus(campaignId);
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
