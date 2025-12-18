import {
  payStudentForCampaign,
  payAllStudentsInCampaign,
  payStudentsCustom,
} from "../utils/paymentService.js";
import CampaignRepository from "../repositories/CampaignRepository.js";

class CampaignPaymentService {
  constructor() {
    this.campaignRepo = CampaignRepository;
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
