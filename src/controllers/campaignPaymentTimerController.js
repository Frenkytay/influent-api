/**
 * Campaign Payment Timer Controller
 * Handle UMKM payment for approved campaigns with timeout mechanism
 */

import Campaign from "../models/Campaign.js";
import User from "../models/User.js";
import { notifyPaymentSuccess, notifyCampaignCancelled } from "../utils/notificationHelper.js";

// Store active payment timers with deadline info
// Format: Map<campaignId, { timer: timeoutId, deadline: Date }>
const paymentTimers = new Map();

/**
 * Start payment timer when campaign is approved
 * Automatically called when campaign status changes to 'pending_payment'
 */
export const startPaymentTimer = async (campaignId, durationMs = 60000) => {
  try {
    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      console.error(`Campaign ${campaignId} not found`);
      return;
    }

    // Clear existing timer if any
    if (paymentTimers.has(campaignId)) {
      const existing = paymentTimers.get(campaignId);
      clearTimeout(existing.timer);
    }

    // Calculate deadline
    const deadline = new Date(Date.now() + durationMs);

    console.log(`⏰ Starting payment timer for campaign ${campaignId} (${durationMs}ms)`);
    console.log(`⏰ Payment deadline: ${deadline.toISOString()}`);

    // Set timer
    const timer = setTimeout(async () => {
      try {
        // Reload campaign to check current status
        await campaign.reload();

        // Only cancel if still in pending_payment status
        if (campaign.status === 'pending_payment') {
          console.log(`⏱️ Payment timeout for campaign ${campaignId}, cancelling...`);

          // Update campaign status to cancelled
          await campaign.update({
            status: 'cancelled',
            sub_status: null,
            cancellation_reason: 'Melewati batas waktu pembayaran'
          });

          // Get all admin users
          const adminUsers = await User.findAll({
            where: { role: "admin" },
            attributes: ["user_id"],
          });
          const adminUserIds = adminUsers.map(admin => admin.user_id);

          // Send cancellation notifications
          await notifyCampaignCancelled(
            campaign.campaign_id,
            campaign.title,
            campaign.user_id,
            adminUserIds
          );

          console.log(`✅ Campaign ${campaignId} cancelled due to payment timeout`);
        } else {
          console.log(`ℹ️ Campaign ${campaignId} status is ${campaign.status}, no cancellation needed`);
        }

        // Remove timer from map
        paymentTimers.delete(campaignId);
      } catch (error) {
        console.error(`Error cancelling campaign ${campaignId}:`, error);
      }
    }, durationMs);

    // Store timer with deadline
    paymentTimers.set(campaignId, { timer, deadline });
  } catch (error) {
    console.error('Error starting payment timer:', error);
  }
};

/**
 * Process campaign payment (simulated)
 * POST /api/v1/campaign-payment/process
 */
export const processPayment = async (req, res) => {
  try {
    const { campaign_id } = req.body;

    // Validate input
    if (!campaign_id) {
      return res.status(400).json({ error: "campaign_id is required" });
    }

    // Find campaign
    const campaign = await Campaign.findByPk(campaign_id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "name", "email", "role"],
        },
      ],
    });

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    // Check if requester is the campaign owner
    if (req.user && campaign.user_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden: You can only pay for your own campaigns" });
    }

    // Check if campaign is in pending_payment status
    if (campaign.status !== 'pending_payment') {
      return res.status(400).json({ 
        error: "Campaign is not waiting for payment",
        current_status: campaign.status 
      });
    }

    console.log(`💳 Processing payment for campaign ${campaign_id}`);

    // Calculate payment amount
    const totalInfluencerCost = campaign.price_per_post * campaign.total_slots;
    const adminFee = 5000;
    const totalAmount = totalInfluencerCost + adminFee;

    // Update campaign status to active
    await campaign.update({
      status: 'active',
      sub_status: 'registration_open',
      payment_date: new Date(),
      payment_amount: totalAmount
    });

    // Clear payment timer if exists
    if (paymentTimers.has(campaign_id)) {
      const timerData = paymentTimers.get(campaign_id);
      clearTimeout(timerData.timer);
      paymentTimers.delete(campaign_id);
      console.log(`✅ Payment timer cleared for campaign ${campaign_id}`);
    }

    // Get all admin users
    const adminUsers = await User.findAll({
      where: { role: "admin" },
      attributes: ["user_id"],
    });
    const adminUserIds = adminUsers.map(admin => admin.user_id);

    // Send payment success notifications
    await notifyPaymentSuccess(
      campaign.campaign_id,
      campaign.title,
      campaign.user_id,
      adminUserIds,
      totalAmount
    );

    console.log(`✅ Payment processed successfully for campaign ${campaign_id}`);

    res.json({
      message: "Pembayaran berhasil! Campaign kini aktif untuk pendaftaran student.",
      data: {
        campaign_id: campaign.campaign_id,
        title: campaign.title,
        status: campaign.status,
        sub_status: campaign.sub_status,
        payment_amount: totalAmount,
        payment_breakdown: {
          influencer_cost: totalInfluencerCost,
          admin_fee: adminFee,
          total: totalAmount
        }
      }
    });
  } catch (err) {
    console.error("Error processing payment:", err);
    res.status(500).json({ 
      error: "Failed to process payment",
      details: err.message 
    });
  }
};

/**
 * Check payment status
 * GET /api/v1/campaign-payment/status/:id
 */
export const checkPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await Campaign.findByPk(id, {
      attributes: [
        'campaign_id', 
        'title', 
        'status', 
        'sub_status', 
        'payment_date',
        'payment_amount',
        'price_per_post',
        'total_slots',
        'created_at',
        'updated_at'
      ]
    });

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    // Check if requester is the campaign owner or admin
    if (req.user && campaign.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Check if payment timer is active and get deadline
    const timerData = paymentTimers.get(parseInt(id));
    const hasActiveTimer = !!timerData;
    const paymentDeadline = timerData ? timerData.deadline : null;

    // Calculate expected payment amount
    const totalInfluencerCost = campaign.price_per_post * campaign.total_slots;
    const adminFee = 5000;
    const expectedAmount = totalInfluencerCost + adminFee;

    res.json({
      campaign_id: campaign.campaign_id,
      title: campaign.title,
      status: campaign.status,
      sub_status: campaign.sub_status,
      payment_status: campaign.status === 'active' ? 'paid' : 
                      campaign.status === 'pending_payment' ? 'waiting' : 
                      campaign.status === 'cancelled' ? 'cancelled' : 'unknown',
      payment_date: campaign.payment_date,
      payment_amount: campaign.payment_amount,
      expected_amount: expectedAmount,
      payment_breakdown: {
        influencer_cost: totalInfluencerCost,
        admin_fee: adminFee,
        total: expectedAmount
      },
      has_active_timer: hasActiveTimer,
      payment_deadline: paymentDeadline ? paymentDeadline.toISOString() : null,
      can_pay: campaign.status === 'pending_payment'
    });
  } catch (err) {
    console.error("Error checking payment status:", err);
    res.status(500).json({ 
      error: "Failed to check payment status",
      details: err.message 
    });
  }
};

/**
 * Cancel payment manually (Admin only)
 * POST /api/v1/campaign-payment/cancel/:id
 */
export const cancelPayment = async (req, res) => {
  try {
    // Only admin can cancel manually
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    const { id } = req.params;
    const campaign = await Campaign.findByPk(id);

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    if (campaign.status !== 'pending_payment') {
      return res.status(400).json({ 
        error: "Campaign is not waiting for payment",
        current_status: campaign.status 
      });
    }

    // Update campaign status
    await campaign.update({
      status: 'cancelled',
      sub_status: null,
      cancellation_reason: 'Dibatalkan oleh admin'
    });

    // Clear payment timer
    if (paymentTimers.has(parseInt(id))) {
      const timerData = paymentTimers.get(parseInt(id));
      clearTimeout(timerData.timer);
      paymentTimers.delete(parseInt(id));
    }

    // Get all admin users
    const adminUsers = await User.findAll({
      where: { role: "admin" },
      attributes: ["user_id"],
    });
    const adminUserIds = adminUsers.map(admin => admin.user_id);

    // Send cancellation notifications
    await notifyCampaignCancelled(
      campaign.campaign_id,
      campaign.title,
      campaign.user_id,
      adminUserIds
    );

    res.json({
      message: "Campaign payment cancelled",
      data: campaign
    });
  } catch (err) {
    console.error("Error cancelling payment:", err);
    res.status(500).json({ 
      error: "Failed to cancel payment",
      details: err.message 
    });
  }
};

export default {
  startPaymentTimer,
  processPayment,
  checkPaymentStatus,
  cancelPayment
};
