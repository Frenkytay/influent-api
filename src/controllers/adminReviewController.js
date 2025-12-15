// Admin Review Controller - ADD TO BACKEND
import Campaign from "../models/Campaign.js";
import User from "../models/User.js";
import { notifyCampaignApproved, notifyCampaignRejected } from "../utils/notificationHelper.js";
import { startPaymentTimer } from "./campaignPaymentTimerController.js";

// Get campaigns pending admin review
export const getPendingCampaigns = async (req, res) => {
  try {
    // Only admin can access
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    const { limit = 20, offset = 0, page } = req.query;
    
    const itemsPerPage = parseInt(limit);
    const calculatedOffset = page 
      ? (parseInt(page) - 1) * itemsPerPage 
      : parseInt(offset);

    const where = { 
      status: 'admin_review' // Campaign waiting for admin approval
    };

    const campaigns = await Campaign.findAll({
      where,
      limit: itemsPerPage,
      offset: calculatedOffset,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "name", "email", "profile_image", "role"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    const totalCount = await Campaign.count({ where });
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const currentPage = page ? parseInt(page) : Math.floor(calculatedOffset / itemsPerPage) + 1;

    res.json({
      data: campaigns,
      pagination: {
        total: totalCount,
        limit: itemsPerPage,
        offset: calculatedOffset,
        page: currentPage,
        totalPages: totalPages,
        hasMore: calculatedOffset + itemsPerPage < totalCount,
        hasPrevious: calculatedOffset > 0,
      },
    });
  } catch (err) {
    console.error("Error fetching pending campaigns:", err);
    res.status(500).json({ error: "Failed to fetch pending campaigns" });
  }
};

// Admin approve campaign
export const approveCampaign = async (req, res) => {
  try {
    // Only admin can approve
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    const { id } = req.params;
    const campaign = await Campaign.findByPk(id);

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    if (campaign.status !== 'admin_review') {
      return res.status(400).json({ 
        error: "Campaign is not in admin review",
        current_status: campaign.status 
      });
    }

    // Update status to pending_payment (waiting for UMKM to pay)
    await campaign.update({
      status: 'pending_payment',
      admin_review_at: new Date(),
      admin_reviewed_by: req.user.id,
    });

    console.log(`📢 Sending approval notification for campaign ${campaign.campaign_id} to UMKM user ${campaign.user_id}`);
    
    // Send notification to UMKM about approval
    try {
      await notifyCampaignApproved(campaign.campaign_id, campaign.title, campaign.user_id);
      console.log(`✅ Approval notification sent successfully`);
    } catch (notifError) {
      console.error(`❌ Failed to send approval notification:`, notifError);
    }

    // Start payment timer (1 minute for testing, should be longer in production)
    try {
      const paymentTimeoutMs = 60000; // 1 minute (60 seconds)
      await startPaymentTimer(campaign.campaign_id, paymentTimeoutMs);
      console.log(`⏰ Payment timer started for campaign ${campaign.campaign_id} (${paymentTimeoutMs}ms)`);
    } catch (timerError) {
      console.error(`❌ Failed to start payment timer:`, timerError);
    }

    res.json({
      message: "Campaign approved successfully. UMKM has 1 minute to complete payment.",
      data: campaign,
      payment_deadline: new Date(Date.now() + 60000).toISOString()
    });
  } catch (err) {
    console.error("Error approving campaign:", err);
    res.status(500).json({ error: "Failed to approve campaign" });
  }
};

// Admin reject campaign (now sets status to cancelled)
export const rejectCampaign = async (req, res) => {
  try {
    // Only admin can reject
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    const { id } = req.params;
    const { cancellation_reason } = req.body;

    if (!cancellation_reason) {
      return res.status(400).json({ error: "Cancellation reason is required" });
    }

    const campaign = await Campaign.findByPk(id);

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    if (campaign.status !== 'admin_review') {
      return res.status(400).json({ 
        error: "Campaign is not in admin review",
        current_status: campaign.status 
      });
    }

    // Update status to cancelled (instead of rejected)
    await campaign.update({
      status: 'cancelled',
      cancellation_reason: cancellation_reason,
      admin_review_at: new Date(),
      admin_reviewed_by: req.user.id,
    });

    // Send notification to UMKM about cancellation
    await notifyCampaignRejected(campaign.campaign_id, campaign.title, campaign.user_id, cancellation_reason);

    res.json({
      message: "Campaign cancelled successfully",
      data: campaign,
    });
  } catch (err) {
    console.error("Error cancelling campaign:", err);
    res.status(500).json({ error: "Failed to cancel campaign" });
  }
};

export default {
  getPendingCampaigns,
  approveCampaign,
  rejectCampaign,
};
