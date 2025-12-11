import BaseRepository from "../core/BaseRepository.js";
import Withdrawal from "../models/Withdrawal.js";
import User from "../models/User.js";

class WithdrawalRepository extends BaseRepository {
  constructor() {
    super(Withdrawal);
  }

  async findAllWithRelations(options = {}) {
    return await this.findAll({
      ...options,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "name", "email"],
        },
        {
          model: User,
          as: "reviewer",
          attributes: ["user_id", "name", "email"],
        },
      ],
    });
  }

  async findByIdWithRelations(id) {
    return await this.model.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "name", "email"],
        },
        {
          model: User,
          as: "reviewer",
          attributes: ["user_id", "name", "email"],
        },
      ],
    });
  }

  async findByUserId(userId, options = {}) {
    return await this.findAll({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: "reviewer",
          attributes: ["user_id", "name"],
        },
      ],
      ...options,
    });
  }

  async findByStatus(status, options = {}) {
    return await this.findAllWithRelations({
      where: { status },
      ...options,
    });
  }
}

export default new WithdrawalRepository();
