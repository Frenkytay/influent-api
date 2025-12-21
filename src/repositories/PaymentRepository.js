import BaseRepository from "../core/BaseRepository.js";
import Payment from "../models/Payment.js";
import Campaign from "../models/Campaign.js";
import User from "../models/User.js";

class PaymentRepository extends BaseRepository {
  constructor() {
    super(Payment);
  }

  /**
   * Find by order ID
   */
  async findByOrderId(orderId) {
    return await this.findOne({
      where: { order_id: orderId },
    });
  }

  /**
   * Find by campaign ID
   */
  async findByCampaignId(campaignId) {
    return await this.findAll({
      where: { campaign_id: campaignId },
      order: [["created_at", "DESC"]],
    });
  }

  /**
   * Find by user ID
   */
  async findByUserId(userId) {
    return await this.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
    });
  }

  /**
   * Find by Campaign Owner (User ID via Campaign)
   */
  async findByCampaignOwner(userId) {
    return await this.findAll({
      include: [
        {
          model: Campaign,
          where: { user_id: userId },
          attributes: ["campaign_id", "title", "user_id"],
        },
      ],
      order: [["created_at", "DESC"]],
    });
  }

  /**
   * Find by status
   */
  async findByStatus(status) {
    return await this.findAll({
      where: { status },
      order: [["created_at", "DESC"]],
    });
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(orderId, statusData) {
    const payment = await this.findByOrderId(orderId);
    if (!payment) return null;

    return await payment.update(statusData);
  }
}

export default new PaymentRepository();
