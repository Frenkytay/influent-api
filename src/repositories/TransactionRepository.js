import BaseRepository from "../core/BaseRepository.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

class TransactionRepository extends BaseRepository {
  constructor() {
    super(Transaction);
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
      ],
    });
  }

  async findByUserId(userId, options = {}) {
    return await this.findAll({
      where: { user_id: userId },
      ...options,
    });
  }

  async findByType(type, options = {}) {
    return await this.findAll({
      where: { type },
      ...options,
    });
  }

  async findByCategory(category, options = {}) {
    return await this.findAll({
      where: { category },
      ...options,
    });
  }
}

export default new TransactionRepository();
