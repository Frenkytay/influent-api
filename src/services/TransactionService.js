import TransactionRepository from "../repositories/TransactionRepository.js";
import UserRepository from "../repositories/UserRepository.js";

class TransactionService {
  constructor() {
    this.transactionRepo = TransactionRepository;
    this.userRepo = UserRepository;
  }

  async getMyTransactions(userId, filters = {}) {
    const { type, category } = filters;
    
    const where = { user_id: userId };
    if (type) where.type = type;
    if (category) where.category = category;

    const transactions = await this.transactionRepo.findAll({
      where,
      order: [["created_at", "DESC"]],
    });

    const user = await this.userRepo.findById(userId);
    const currentBalance = parseFloat(user.balance || 0);

    return {
      transactions,
      current_balance: currentBalance,
    };
  }

  async getById(id, userId, userRole) {
    const transaction = await this.transactionRepo.findOne({
      where: { transaction_id: id },
      include: [
        {
          model: await import("../models/User.js").then((m) => m.default),
          as: "user",
          attributes: ["user_id", "name", "email"],
        },
      ],
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (userRole !== "admin" && transaction.user_id !== userId) {
      throw new Error("Access denied");
    }

    return transaction;
  }

  async getAllTransactions(filters = {}) {
    const { user_id, type, category } = filters;
    
    const where = {};
    if (user_id) where.user_id = user_id;
    if (type) where.type = type;
    if (category) where.category = category;

    return await this.transactionRepo.findAllWithRelations({
      where,
      order: [["created_at", "DESC"]],
    });
  }

  async getUserBalance(userId) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return parseFloat(user.balance || 0);
  }
}

export default new TransactionService();
