import {
  payStudentForCampaign,
  payAllStudentsInCampaign,
  payStudentsCustom,
} from "../utils/paymentService.js";
import CampaignRepository from "../repositories/CampaignRepository.js";
import PaymentRepository from "../repositories/PaymentRepository.js";
import Transaction from "../models/Transaction.js";
import CampaignUsers from "../models/CampaignUsers.js";
import User from "../models/User.js";
import Campaign from "../models/Campaign.js";
import { Op } from "sequelize";

class CampaignPaymentService {
  constructor() {
    this.campaignRepo = CampaignRepository;
    this.paymentRepo = PaymentRepository;
  }

  async getCompanyHistory(userId) {
    // 1. Fetch Inbound Payments (Money In)
    const payments = await this.paymentRepo.findByUserId(userId);
    const successfulPayments = payments.filter((p) =>
      ["success", "settlement", "capture"].includes(p.status)
    );

    const inboundTransactions = await Promise.all(
      successfulPayments.map(async (p) => {
        const campaign = await Campaign.findByPk(p.campaign_id);
        return {
          id: `payment-${p.payment_id}`,
          date: p.created_at,
          amount: parseFloat(p.amount),
          type: "money_in",
          description: `Campaign Funding: ${campaign ? campaign.title : "Unknown Campaign"}`,
          status: p.status,
          reference_id: p.order_id,
        };
      })
    );

    // 2. Fetch Outbound Distributions (Money Out)
    // Get all campaigns owned by this user
    const campaigns = await this.campaignRepo.findAll({
      where: { user_id: userId },
    });
    const campaignIds = campaigns.map((c) => c.campaign_id);

    let outboundTransactions = [];

    if (campaignIds.length > 0) {
      // Get all campaign users (students) linked to these campaigns
      const campaignUsers = await CampaignUsers.findAll({
        where: { campaign_id: { [Op.in]: campaignIds } },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["name", "email"],
          },
          {
            model: Campaign,
            as: "campaign",
            attributes: ["title"],
          },
        ],
      });
      
      const campaignUserIds = campaignUsers.map((cu) => cu.id);
      const campaignUserMap = new Map(campaignUsers.map((cu) => [cu.id, cu]));

      if (campaignUserIds.length > 0) {
        // Get transactions linked to these campaign users
        const transactions = await Transaction.findAll({
          where: {
            reference_type: "campaign_users",
            reference_id: { [Op.in]: campaignUserIds },
            type: "credit", // It's a credit to the student, but money out for company
          },
          order: [["created_at", "DESC"]],
        });

        outboundTransactions = transactions.map((t) => {
          const cu = campaignUserMap.get(t.reference_id);
          return {
            id: `txn-${t.transaction_id}`,
            date: t.created_at,
            amount: parseFloat(t.amount),
            type: "money_out",
            description: `Payout to ${cu?.user?.name || "Student"} for ${cu?.campaign?.title || "Campaign"}`,
            status: "completed",
            reference_id: t.transaction_id,
            details: {
              student_name: cu?.user?.name,
              campaign_title: cu?.campaign?.title,
            }
          };
        });
      }
    }

    // 3. Merge and Sort
    const allHistory = [...inboundTransactions, ...outboundTransactions].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    return allHistory;
  }

  async paySingleStudent(paymentData) {
    const { campaign_user_id, amount, description } = paymentData;

    if (!campaign_user_id || !amount) {
      throw new Error("campaign_user_id and amount are required");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    return await payStudentForCampaign(campaign_user_id, amount, description);
  }

  async payAllStudents(paymentData) {
    const { campaign_id } = paymentData;

    if (!campaign_id) {
      throw new Error("campaign_id is required");
    }

    const campaign = await this.campaignRepo.findById(campaign_id);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    const result = await payAllStudentsInCampaign(campaign_id);

    return {
      ...result,
      campaign: {
        id: campaign.campaign_id,
        title: campaign.title,
      },
    };
  }

  async payCustomAmounts(payments) {
    if (!payments || !Array.isArray(payments) || payments.length === 0) {
      throw new Error("payments array is required and must not be empty");
    }

    for (const payment of payments) {
      if (!payment.campaign_user_id || !payment.amount) {
        throw new Error("Each payment must have campaign_user_id and amount");
      }
      if (payment.amount <= 0) {
        throw new Error("All amounts must be greater than 0");
      }
    }

    return await payStudentsCustom(payments);
  }
}

export default new CampaignPaymentService();
