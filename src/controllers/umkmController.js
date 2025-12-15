import Campaign from "../models/Campaign.js";
import CampaignUsers from "../models/CampaignUsers.js";
import WorkSubmission from "../models/WorkSubmission.js";
import db from "../config/db.js";

/**
 * Get dashboard statistics for UMKM
 * Returns aggregated stats for the authenticated UMKM user's dashboard
 * 
 * Status explanation:
 * - Ongoing Campaigns: All 'active' campaigns (registration, selection, confirmation, content collection, revision, posting)
 * - Total Spend This Month: Total price_per_post * influencer_count for campaigns created this month
 * - Influencers Engaged: Unique influencers who have been accepted and submitted content or completed work
 * - Completed Campaigns: Campaigns with status 'completed'
 */
const getDashboardStats = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const umkmId = req.user.id;
    
    console.log('📊 Fetching dashboard stats for UMKM user_id:', umkmId);

    // Get current month date range
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Use Promise.all for parallel queries to improve performance
    const [
      ongoingCampaignsResult,
      totalSpendResult,
      influencersEngagedResult,
      completedCampaignsResult,
    ] = await Promise.all([
      // 1. Ongoing Campaigns - campaigns with status 'active' (includes all active sub-statuses)
      Campaign.count({
        where: {
          user_id: umkmId,
          status: "active",
        },
      }),

      // 2. Total Spend This Month - sum of (price_per_post * influencer_count) for campaigns created this month
      db.query(
        `SELECT COALESCE(SUM(price_per_post * influencer_count), 0) as total_spend
         FROM campaign
         WHERE user_id = ?
         AND created_at >= ?
         AND created_at <= ?`,
        {
          replacements: [umkmId, firstDayOfMonth, lastDayOfMonth],
          type: db.QueryTypes.SELECT,
        }
      ),

      // 3. Influencers Engaged - unique influencers who have been accepted and submitted content
      // Criteria: accepted in campaign AND (submitted content OR work completed)
      db.query(
        `SELECT COUNT(DISTINCT cu.student_id) as count
         FROM campaignUsers cu
         INNER JOIN campaign c ON cu.campaign_id = c.campaign_id
         LEFT JOIN work_submissions ws ON cu.id = ws.campaign_user_id
         WHERE c.user_id = ?
         AND cu.application_status = 'accepted'
         AND (ws.submission_id IS NOT NULL OR c.status IN ('active', 'completed'))`,
        {
          replacements: [umkmId],
          type: db.QueryTypes.SELECT,
        }
      ),

      // 4. Completed Campaigns - campaigns with status 'completed'
      Campaign.count({
        where: {
          user_id: umkmId,
          status: "completed",
        },
      }),
    ]);

    // Extract count values from query results
    const totalSpend = totalSpendResult[0]?.total_spend || 0;
    const influencersEngaged = influencersEngagedResult[0]?.count || 0;

    console.log('✅ Dashboard stats:', {
      ongoing_campaigns: ongoingCampaignsResult,
      total_spend_this_month: totalSpend,
      influencers_engaged: influencersEngaged,
      completed_campaigns: completedCampaignsResult
    });

    res.status(200).json({
      success: true,
      data: {
        ongoing_campaigns: ongoingCampaignsResult,
        total_spend_this_month: parseInt(totalSpend),
        influencers_engaged: parseInt(influencersEngaged),
        completed_campaigns: completedCampaignsResult,
      },
      message: "Dashboard statistics retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
};

export default {
  getDashboardStats,
};
