import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

/**
 * Get user's transaction history
 * GET /api/v1/transactions/my-transactions
 */
export const getMyTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, type, category } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { user_id: userId };
    if (type) whereClause.type = type;
    if (category) whereClause.category = category;

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: whereClause,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Get current balance
    const user = await User.findByPk(userId, {
      attributes: ["balance"],
    });

    return res.status(200).json({
      transactions,
      current_balance: parseFloat(user.balance || 0),
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get transaction by ID
 * GET /api/v1/transactions/:id
 */
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const transaction = await Transaction.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "name", "email"],
        },
      ],
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Only admin or the transaction owner can view
    if (userRole !== "admin" && transaction.user_id !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    return res.status(200).json({ transaction });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all transactions (admin only)
 * GET /api/v1/transactions/admin/all
 */
export const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 50, user_id, type, category } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (user_id) whereClause.user_id = user_id;
    if (type) whereClause.type = type;
    if (category) whereClause.category = category;

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "name", "email"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      transactions,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching all transactions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get user's balance
 * GET /api/v1/transactions/balance
 */
export const getBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: ["user_id", "name", "email", "balance"],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get summary
    const [creditSum, debitSum] = await Promise.all([
      Transaction.sum("amount", {
        where: { user_id: userId, type: "credit" },
      }),
      Transaction.sum("amount", {
        where: { user_id: userId, type: "debit" },
      }),
    ]);

    return res.status(200).json({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      current_balance: parseFloat(user.balance || 0),
      total_earned: parseFloat(creditSum || 0),
      total_withdrawn: parseFloat(debitSum || 0),
    });
  } catch (error) {
    console.error("Error fetching balance:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default {
  getMyTransactions,
  getTransactionById,
  getAllTransactions,
  getBalance,
};
