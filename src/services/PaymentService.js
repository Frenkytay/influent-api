import BaseService from "../core/BaseService.js";
import PaymentRepository from "../repositories/PaymentRepository.js";
import midtransClient from "midtrans-client";
import Campaign from "../models/Campaign.js";
import User from "../models/User.js";

class PaymentService extends BaseService {
  constructor() {
    super(PaymentRepository);
    
    this.isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
    this.serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    this.clientKey = process.env.MIDTRANS_CLIENT_KEY || "";
    
    this.snap = new midtransClient.Snap({
      isProduction: this.isProduction,
      serverKey: this.serverKey,
      clientKey: this.clientKey,
    });

    this.coreApi = new midtransClient.CoreApi({
      isProduction: this.isProduction,
      serverKey: this.serverKey,
      clientKey: this.clientKey,
    });
  }

  /**
   * Create payment transaction
   */
  async createPayment(campaignId, userId = null) {
    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    // Determine amount
    let amount = 0;
    if (campaign.campaign_price) {
      amount = Number(campaign.campaign_price);
    } else if (campaign.price_per_post && campaign.influencer_count) {
      amount = Number(campaign.price_per_post) * Number(campaign.influencer_count);
    } else {
      throw new Error("No price configured for this campaign");
    }

    // Build order ID
    const order_id = `CAMPAIGN-${campaignId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Get customer details if user exists
    const customer = {};
    if (userId) {
      const user = await User.findByPk(userId);
      if (user) {
        customer.first_name = user.name || "";
        customer.email = user.email || "";
      }
    }

    // Create Midtrans transaction
    const parameter = {
      transaction_details: {
        order_id,
        gross_amount: Math.round(amount),
      },
      item_details: [
        {
          id: `campaign-${campaignId}`,
          price: Math.round(amount),
          quantity: 1,
          name: campaign.title || `Campaign ${campaignId}`,
        },
      ],
      customer_details: customer,
    };

    const snapResponse = await this.snap.createTransaction(parameter);

    // Save payment record
    const payment = await this.repository.create({
      order_id,
      campaign_id: campaignId,
      user_id: userId || null,
      amount: amount,
      status: "pending",
      raw_response: snapResponse,
    });

    return {
      payment,
      snap: snapResponse,
    };
  }

  /**
   * Handle Midtrans notification
   */
  async handleNotification(notificationJson) {
    const statusResponse = await this.coreApi.transaction.notification(notificationJson);
    
    const orderId = statusResponse.order_id;
    const payment = await this.repository.findByOrderId(orderId);
    
    if (!payment) {
      throw new Error(`Payment not found for order_id: ${orderId}`);
    }

    // Update payment
    await payment.update({
      status: statusResponse.transaction_status,
      payment_type: statusResponse.payment_type,
      transaction_time: statusResponse.transaction_time
        ? new Date(statusResponse.transaction_time)
        : null,
      raw_response: statusResponse,
    });

    return payment;
  }

  /**
   * Get payment by ID or order ID
   */
  async getPayment(id) {
    // Try by payment ID first (numeric)
    let payment = null;
    if (/^\d+$/.test(id)) {
      payment = await this.repository.findById(Number(id));
    }

    // If not found, try by order ID
    if (!payment) {
      payment = await this.repository.findByOrderId(id);
    }

    if (!payment) {
      throw new Error("Payment not found");
    }

    // Get latest status from Midtrans
    try {
      const status = await this.coreApi.transaction.status(payment.order_id);
      return { payment, midtrans: status };
    } catch (err) {
      console.warn("Midtrans status check failed:", err.message);
      return { payment };
    }
  }

  /**
   * Handle return from Midtrans redirect
   */
  async handleReturn(orderId) {
    if (!orderId) {
      throw new Error("order_id is required");
    }

    // Get latest status from Midtrans
    let statusResponse;
    try {
      statusResponse = await this.coreApi.transaction.status(orderId);
    } catch (err) {
      console.warn("Failed to fetch Midtrans status:", err.message);
      const payment = await this.repository.findByOrderId(orderId);
      if (!payment) {
        throw new Error("Payment not found");
      }
      return { payment, status: "pending", redirect: "pending" };
    }

    const payment = await this.repository.findByOrderId(statusResponse.order_id || orderId);
    
    if (!payment) {
      // Payment not in DB but Midtrans has it
      return {
        orderId: statusResponse.order_id || orderId,
        status: statusResponse.transaction_status,
        redirect: this.getRedirectType(statusResponse.transaction_status),
      };
    }

    // Normalize status
    let newStatus = statusResponse.transaction_status;
    if (newStatus === "settlement" || newStatus === "capture") {
      newStatus = "success";
    }
    if (newStatus === "deny" || newStatus === "cancel" || newStatus === "expire") {
      newStatus = "failed";
    }

    // Update payment
    await payment.update({
      status: newStatus,
      payment_type: statusResponse.payment_type || payment.payment_type,
      transaction_time: statusResponse.transaction_time
        ? new Date(statusResponse.transaction_time)
        : payment.transaction_time,
      raw_response: statusResponse,
    });

    return {
      payment,
      status: newStatus,
      redirect: this.getRedirectType(newStatus),
    };
  }

  /**
   * Get redirect type based on status
   */
  getRedirectType(status) {
    if (status === "success" || status === "settlement" || status === "capture") {
      return "success";
    }
    if (status === "failed" || status === "deny" || status === "cancel" || status === "expire") {
      return "failed";
    }
    return "pending";
  }

  /**
   * Get payments by campaign
   */
  async getPaymentsByCampaign(campaignId) {
    return await this.repository.findByCampaignId(campaignId);
  }

  /**
   * Get payments by user
   */
  async getPaymentsByUser(userId) {
    return await this.repository.findByUserId(userId);
  }
}

export default new PaymentService();
