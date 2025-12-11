import BaseRepository from "../core/BaseRepository.js";
import CampaignUsers from "../models/CampaignUsers.js";
import User from "../models/User.js";
import Campaign from "../models/Campaign.js";

class CampaignUsersRepository extends BaseRepository {
  constructor() {
    super(CampaignUsers);
  }

  async findAllWithRelations(options = {}) {
    return await this.findAll({
      ...options,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "name", "email", "profile_image", "role"],
        },
        { model: Campaign, as: "campaign" },
      ],
    });
  }

  async findByIdWithRelations(id) {
    return await this.findOne({
      where: { id },
      include: [
        { model: User, as: "user" },
        { model: Campaign, as: "campaign" },
      ],
    });
  }

  async findByCampaignId(campaignId, options = {}) {
    return await this.findAllWithRelations({
      where: { campaign_id: campaignId },
      ...options,
    });
  }

  async findByStudentId(studentId, options = {}) {
    return await this.findAllWithRelations({
      where: { student_id: studentId },
      ...options,
    });
  }
}

export default new CampaignUsersRepository();
