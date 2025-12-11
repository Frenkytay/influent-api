import BaseService from "../core/BaseService.js";
import CampaignUsersRepository from "../repositories/CampaignUsersRepository.js";

class CampaignUsersService extends BaseService {
  constructor() {
    super(CampaignUsersRepository);
  }

  async getAll(filters = {}, options = {}) {
    const { campaign_id, student_id, application_status } = filters;
    
    const queryFilters = {};
    if (campaign_id) queryFilters.campaign_id = campaign_id;
    if (student_id) queryFilters.student_id = student_id;
    if (application_status) queryFilters.application_status = application_status;

    const where = this.repository.buildWhereClause(queryFilters);
    const order = this.repository.buildOrderClause(options.sort, options.order);

    return await this.repository.findAllWithRelations({ where, order });
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
}

export default new CampaignUsersService();
