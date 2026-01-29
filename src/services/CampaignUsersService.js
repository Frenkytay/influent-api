import BaseService from "../core/BaseService.js";
import CampaignUsersRepository from "../repositories/CampaignUsersRepository.js";
import NotificationService from "./NotificationService.js";

class CampaignUsersService extends BaseService {
  constructor() {
    super(CampaignUsersRepository);
  }

  async getAll(filters = {}, options = {}, requestUser = null) {
    const { campaign_id, student_id, application_status } = filters;
    
    const queryFilters = {};
    if (campaign_id) queryFilters.campaign_id = campaign_id;
    if (student_id) queryFilters.student_id = student_id;
    if (application_status) queryFilters.application_status = application_status;
    // Filter by student_id if user is student
    if (requestUser && requestUser.role === "student") {
      queryFilters.student_id = requestUser.id;
    }

    const where = this.repository.buildWhereClause(queryFilters);
    
    // Default sort by applied_at DESC (newest first)
    if (!options.sort) {
      options.sort = "applied_at";
      options.order = "DESC";
    }
    const order = this.repository.buildOrderClause(options.sort, options.order);

    const repoOptions = { where, order };
    
    // If user is company, preload student data
    if (requestUser && (requestUser.role === "company" || requestUser.role === "business")) {
        repoOptions.includeStudent = true;
    }

    return await this.repository.findAllWithRelations(repoOptions);
  }

  async getById(id) {
    const record = await this.repository.findByIdWithRelations(id);
    if (!record) {
      throw new Error("Campaign user not found");
    }
    return record;
  }

  async getByCampaignId(campaignId, options = {}) {
    const order = this.repository.buildOrderClause(options.sort, options.order);
    return await this.repository.findByCampaignId(campaignId, { order });
  }

  async getByStudentId(studentId, options = {}) {
    const order = this.repository.buildOrderClause(options.sort, options.order);
    return await this.repository.findByStudentId(studentId, { order });
  }

  async approve(id, applicationNotes = null) {
    const campaignUser = await this.getById(id);
    
    // Check campaign influencer limit
    const campaign = campaignUser.campaign;
    if (campaign && campaign.influencer_count > 0) {
      const acceptedCount = await this.repository.count({
        where: { 
          campaign_id: campaignUser.campaign_id, 
          application_status: "accepted" 
        }
      });

      if (acceptedCount >= campaign.influencer_count) {
        throw new Error("Tidak dapat menerima: Kampanye telah mencapai batas influencer.");
      }
    }

    // Check current status if needed, or just overwrite
    // if (campaignUser.application_status !== 'pending') ...

    const updated = await this.repository.update(id, {
      application_status: "accepted",
      accepted_at: new Date(),
      ...(applicationNotes && { application_notes: applicationNotes }),
    });

    // Notify user
    await NotificationService.createNotification({
      user_id: campaignUser.student_id,
      type: "application_status",
      title: "Lamaran Diterima!",
      message: `Selamat! Lamaran Anda untuk kampanye "${campaignUser.campaign.title}" telah diterima.${applicationNotes ? ` Catatan: ${applicationNotes}` : ''}`,
    });

    return updated;
  }

  async reject(id, applicationNotes = null) {
    const updated = await this.repository.update(id, {
      application_status: "rejected",
      rejected_at: new Date(),
      ...(applicationNotes && { application_notes: applicationNotes }),
    });

    // Notify user
    const campaignUser = await this.getById(id);
    await NotificationService.createNotification({
      user_id: campaignUser.student_id,
      type: "application_status",
      title: "Pembaruan Lamaran",
      message: `Lamaran Anda untuk kampanye "${campaignUser.campaign.title}" belum berhasil.${applicationNotes ? ` Catatan: ${applicationNotes}` : ''}`,
    });

    return updated;
  }
}

export default new CampaignUsersService();
