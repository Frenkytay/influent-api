import BaseController from "../core/BaseController.js";
import TransactionService from "../services/TransactionService.js";

class TransactionController extends BaseController {
  constructor() {
    super(TransactionService);
  }

  getMyTransactions = this.asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
      return this.sendError(res, "Unauthorized", 401);
    }

    const { type, category } = req.query;
    const result = await this.service.getMyTransactions(req.user.id, { type, category });
    this.sendSuccess(res, result);
  });

  getTransactionById = this.asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
      return this.sendError(res, "Unauthorized", 401);
    }

    const transaction = await this.service.getById(
      req.params.id,
      req.user.id,
      req.user.role
    );
    this.sendSuccess(res, { transaction });
  });

  getAllTransactions = this.asyncHandler(async (req, res) => {
    const { user_id, type, category } = req.query;
    const transactions = await this.service.getAllTransactions({ user_id, type, category });
    this.sendSuccess(res, { transactions });
  });

  getBalance = this.asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
      return this.sendError(res, "Unauthorized", 401);
    }

    const balance = await this.service.getUserBalance(req.user.id);
    this.sendSuccess(res, { current_balance: balance });
  });
}

export default new TransactionController();
