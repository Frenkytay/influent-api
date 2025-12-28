import BaseService from "../core/BaseService.js";
import CampaignRepository from "../repositories/CampaignRepository.js";
import CampaignUsers from "../models/CampaignUsers.js";
import { Op } from "sequelize";
import NotificationService from "./NotificationService.js";

/**
 * CampaignService - Contains business logic for Campaign operations
 */
class CampaignService extends BaseService {
  constructor() {
    super(CampaignRepository);
  }

  /**
   * Get all campaigns with filters
   */
  async getAll(filters = {}, options = {}, requestUser = null) {
    const { status, user_id, title, campaign_category } = filters;
    
    const where = {};
    if (status) where.status = status;
    
    // If requester is not admin
    if (requestUser && requestUser.role !== "admin") {
      if (requestUser.role === "student") {
        // Students see ALL active campaigns, sorted by newest
        where.status = "active";
        
        // Exclude campaigns the student has already applied to
        const appliedCampaigns = await CampaignUsers.findAll({
          where: { student_id: requestUser.id },
          attributes: ["campaign_id"],
        });
        
        const appliedCampaignIds = appliedCampaigns.map(c => c.campaign_id);
        
        if (appliedCampaignIds.length > 0) {
          where.campaign_id = { [Op.notIn]: appliedCampaignIds };
        }

        options.sort = "created_at";
        options.order = "DESC";
      } else {
        // Other roles (e.g. brands) only see their own campaigns
        where.user_id = requestUser.id;
      }
    } else if (user_id) {
      where.user_id = user_id;
    }
    
    if (title) where.title = { [Op.like]: `%${title}%` };
    if (campaign_category) where.campaign_category = campaign_category;

    const order = this.repository.buildOrderClause(
      options.sort || "campaign_id",
      options.order || "DESC"
    );

    return await this.repository.findAllWithRelations({
      where,
      order,
    });
  }

  /**
   * Get campaign by ID with relations
   */
  async getById(id) {
    const campaign = await this.repository.findByIdWithRelations(id);
    if (!campaign) {
      throw new Error("Campaign not found");
    }
    return campaign;
  }

  /**
   * Get campaigns by category
   */
  async getByCategory(category, options = {}) {
    const order = this.repository.buildOrderClause(
      options.sort || "campaign_id",
      options.order || "DESC"
    );

    return await this.repository.findByCategory(category, { order });
  }

  /**
   * Create new campaign
   */
  async create(campaignData, userId) {
    // Validate required fields
    this.validateRequired(campaignData, ["title", "description"]);

    // Handle contentTypes -> content_types mapping
    if (campaignData.contentTypes) {
      let contentTypes = campaignData.contentTypes;
      if (typeof contentTypes === "string") {
        try {
          contentTypes = JSON.parse(contentTypes);
        } catch (e) {
          // Keep as string if parsing fails, or handle error
        }
      }
      campaignData.content_types = contentTypes;
    }

    // Set user_id from authenticated user
    return await this.repository.create({
      ...campaignData,
      user_id: userId,
    });
  }

  /**
   * Update campaign
   */
  async update(id, campaignData, requestUser = null) {
    const campaign = await this.repository.findById(id);
    
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    // Check if user owns the campaign (unless admin)
    if (
      requestUser &&
      requestUser.role !== "admin" &&
      campaign.user_id !== requestUser.id
    ) {
      throw new Error("Unauthorized to update this campaign");
    }

    // Handle contentTypes -> content_types mapping
    if (campaignData.contentTypes) {
      let contentTypes = campaignData.contentTypes;
      if (typeof contentTypes === "string") {
        try {
          contentTypes = JSON.parse(contentTypes);
        } catch (e) {
          // Keep as string if parsing fails
        }
      }
      campaignData.content_types = contentTypes;
    }

    return await this.repository.update(id, campaignData);
  }

  /**
   * Delete campaign
   */
  async delete(id, requestUser = null) {
    const campaign = await this.repository.findById(id);
    
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    // Check if user owns the campaign (unless admin)
    if (
      requestUser &&
      requestUser.role !== "admin" &&
      campaign.user_id !== requestUser.id
    ) {
      throw new Error("Unauthorized to delete this campaign");
    }

    return await this.repository.delete(id);
  }

  /**
   * Get campaigns by user
   */
  async getByUserId(userId, options = {}) {
    const order = this.repository.buildOrderClause(
      options.sort || "campaign_id",
      options.order || "DESC"
    );

    return await this.repository.findByUserId(userId, { order });
  }

  /**
   * Get campaigns by status
   */
  async getByStatus(status, options = {}) {
    const order = this.repository.buildOrderClause(
      options.sort || "campaign_id",
      options.order || "DESC"
    );

    return await this.repository.findByStatus(status, { order });
  }

  /**
   * Approve campaign (admin only)
   * Changes status to pending_payment
   */
  async approveCampaign(id) {
    const campaign = await this.repository.findById(id);
    
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    if (campaign.status === "pending_payment") {
      throw new Error("Campaign is already approved");
    }

    // You might want to update other fields like approval_date if you have them
    const updated = await this.repository.update(id, {
      status: "pending_payment",
      updated_at: new Date()
    });

    // Notify Company
    if (campaign && campaign.user_id) {
       await NotificationService.createNotification({
        user_id: campaign.user_id,
        type: "campaign_status",
        title: "Campaign Approved",
        message: `Your campaign "${campaign.title}" has been approved. You can now proceed with payment.`,
        is_read: false,
      });
    }

    return updated;
  }

  /**
   * Reject campaign (admin only)
   * Changes status to draft (so user can edit) or cancelled
   */
  async rejectCampaign(id, reason) {
    const campaign = await this.repository.findById(id);
    
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    // Update status to 'draft' so user can fix issues, or 'cancelled' if appropriate.
    // Let's assume 'draft' to allow re-submission.
    const updated = await this.repository.update(id, {
      status: "draft", // Send back to draft
      updated_at: new Date()
    });

    // Notify Company
    if (campaign && campaign.user_id) {
       await NotificationService.createNotification({
        user_id: campaign.user_id,
        type: "campaign_status",
        title: "Campaign Rejected/Returned",
        message: `Your campaign "${campaign.title}" has been returned for review.${reason ? ` Reason: ${reason}` : ''}`,
        is_read: false,
      });
    }

    return updated;
  }
}

export default new CampaignService();
