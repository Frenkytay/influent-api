import Withdrawal from "../models/Withdrawal.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Transaction from "../models/Transaction.js";
import sequelize from "../config/db.js";
import {
  sendWithdrawalRequestEmail,
  sendWithdrawalCompletedEmail,
  sendWithdrawalRejectedEmail,
} from "../utils/emailService.js";

/**
 * Request a new withdrawal
 * POST /api/v1/withdrawals/request
 */
export const requestWithdrawal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, bank_name, account_number, account_holder_name } = req.body;

    if (!amount || !bank_name || !account_number || !account_holder_name) {
      return res.status(400).json({
        error:
          "amount, bank_name, account_number, and account_holder_name are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        error: "Amount must be greater than 0",
      });
    }

    // Get user info
    console.log("Fetching user with ID:", userId);
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user has sufficient balance
    const currentBalance = parseFloat(user.balance || 0);
    const requestAmount = parseFloat(amount);

    if (currentBalance < requestAmount) {
      return res.status(400).json({
        error: "Insufficient balance",
        current_balance: currentBalance,
        requested_amount: requestAmount,
      });
    }

    // Use transaction to ensure atomicity
    const t = await sequelize.transaction();

    try {
      // Deduct balance immediately when requesting withdrawal
      const balanceBefore = currentBalance;
      const balanceAfter = balanceBefore - requestAmount;

      await user.update({ balance: balanceAfter }, { transaction: t });

      // Create withdrawal record
      const withdrawal = await Withdrawal.create(
        {
          user_id: userId,
          amount,
          bank_name,
          account_number,
          account_holder_name,
          status: "pending",
          request_date: new Date(),
        },
        { transaction: t }
      );

      // Record transaction
      await Transaction.create(
        {
          user_id: userId,
          amount: requestAmount,
          type: "debit",
          category: "withdrawal",
          reference_type: "withdrawal",
          reference_id: withdrawal.withdrawal_id,
          description: `Withdrawal request to ${bank_name} - ${account_number}`,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
        },
        { transaction: t }
      );

      await t.commit();

      // Send confirmation email
      await sendWithdrawalRequestEmail(
        user.email,
        user.name,
        amount,
        withdrawal.withdrawal_id
      );

      // Create notification for user
      await Notification.create({
        user_id: userId,
        title: "Withdrawal Request Submitted",
        message: `Your withdrawal request of Rp ${parseFloat(
          amount
        ).toLocaleString(
          "id-ID"
        )} has been submitted and is pending review. The amount has been deducted from your balance.`,
        type: "withdrawal",
        is_read: false,
      });

      // Notify admins
      const admins = await User.findAll({ where: { role: "admin" } });
      for (const admin of admins) {
        await Notification.create({
          user_id: admin.user_id,
          title: "New Withdrawal Request",
          message: `${user.name} has requested a withdrawal of Rp ${parseFloat(
            amount
          ).toLocaleString("id-ID")}`,
          type: "withdrawal",
          is_read: false,
        });
      }

      return res.status(201).json({
        message: "Withdrawal request submitted successfully",
        withdrawal,
        new_balance: balanceAfter,
      });
    } catch (error) {
      await t.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error requesting withdrawal:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all withdrawals (admin only)
 * GET /api/v1/withdrawals/admin/all
 */
export const getAllWithdrawals = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: withdrawals } = await Withdrawal.findAndCountAll({
      where: whereClause,
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
      order: [["request_date", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      withdrawals,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get user's withdrawal history
 * GET /api/v1/withdrawals/my-withdrawals
 */
export const getMyWithdrawals = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: withdrawals } = await Withdrawal.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: "reviewer",
          attributes: ["user_id", "name"],
        },
      ],
      order: [["request_date", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      withdrawals,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching user withdrawals:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get withdrawal by ID
 * GET /api/v1/withdrawals/:id
 */
export const getWithdrawalById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const withdrawal = await Withdrawal.findByPk(id, {
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

    if (!withdrawal) {
      return res.status(404).json({ error: "Withdrawal not found" });
    }

    // Only admin or the withdrawal owner can view
    if (userRole !== "admin" && withdrawal.user_id !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    return res.status(200).json({ withdrawal });
  } catch (error) {
    console.error("Error fetching withdrawal:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Approve withdrawal and upload transfer proof
 * PUT /api/v1/withdrawals/:id/complete
 * Admin only
 */
export const completeWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const { review_notes } = req.body;

    // Get transfer proof from uploaded file
    const transferProofUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : null;

    if (!transferProofUrl) {
      return res
        .status(400)
        .json({ error: "Transfer proof image is required" });
    }

    const withdrawal = await Withdrawal.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "name", "email"],
        },
      ],
    });

    if (!withdrawal) {
      return res.status(404).json({ error: "Withdrawal not found" });
    }

    if (withdrawal.status !== "pending" && withdrawal.status !== "approved") {
      return res.status(400).json({
        error: "Only pending or approved withdrawals can be completed",
      });
    }

    // Update withdrawal
    await withdrawal.update({
      status: "completed",
      reviewed_by: adminId,
      reviewed_date: new Date(),
      review_notes,
      transfer_proof_url: transferProofUrl,
      completed_date: new Date(),
    });

    // Send completion email
    await sendWithdrawalCompletedEmail(
      withdrawal.user.email,
      withdrawal.user.name,
      withdrawal.amount,
      withdrawal.withdrawal_id,
      transferProofUrl
    );

    // Create notification for user
    await Notification.create({
      user_id: withdrawal.user_id,
      title: "Withdrawal Completed",
      message: `Your withdrawal request of Rp ${parseFloat(
        withdrawal.amount
      ).toLocaleString(
        "id-ID"
      )} has been completed. The money has been transferred to your account.`,
      type: "withdrawal",
      is_read: false,
    });

    return res.status(200).json({
      message: "Withdrawal completed successfully",
      withdrawal,
    });
  } catch (error) {
    console.error("Error completing withdrawal:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Reject withdrawal
 * PUT /api/v1/withdrawals/:id/reject
 * Admin only
 */
export const rejectWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const { rejection_reason } = req.body;

    if (!rejection_reason) {
      return res.status(400).json({ error: "rejection_reason is required" });
    }

    const withdrawal = await Withdrawal.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "name", "email"],
        },
      ],
    });

    if (!withdrawal) {
      return res.status(404).json({ error: "Withdrawal not found" });
    }

    if (withdrawal.status !== "pending") {
      return res.status(400).json({
        error: "Only pending withdrawals can be rejected",
      });
    }

    // Use transaction to ensure atomicity
    const t = await sequelize.transaction();

    try {
      // Refund the amount to user's balance
      const user = await User.findByPk(withdrawal.user_id, { transaction: t });
      const balanceBefore = parseFloat(user.balance || 0);
      const refundAmount = parseFloat(withdrawal.amount);
      const balanceAfter = balanceBefore + refundAmount;

      await user.update({ balance: balanceAfter }, { transaction: t });

      // Update withdrawal
      await withdrawal.update(
        {
          status: "rejected",
          reviewed_by: adminId,
          reviewed_date: new Date(),
          rejection_reason,
        },
        { transaction: t }
      );

      // Record refund transaction
      await Transaction.create(
        {
          user_id: withdrawal.user_id,
          amount: refundAmount,
          type: "credit",
          category: "refund",
          reference_type: "withdrawal",
          reference_id: withdrawal.withdrawal_id,
          description: `Refund for rejected withdrawal - ${rejection_reason}`,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
        },
        { transaction: t }
      );

      await t.commit();

      // Send rejection email
      await sendWithdrawalRejectedEmail(
        withdrawal.user.email,
        withdrawal.user.name,
        withdrawal.amount,
        withdrawal.withdrawal_id,
        rejection_reason
      );

      // Create notification for user
      await Notification.create({
        user_id: withdrawal.user_id,
        title: "Withdrawal Rejected - Balance Refunded",
        message: `Your withdrawal request of Rp ${parseFloat(
          withdrawal.amount
        ).toLocaleString(
          "id-ID"
        )} has been rejected. The amount has been refunded to your balance. Reason: ${rejection_reason}`,
        type: "withdrawal",
        is_read: false,
      });

      return res.status(200).json({
        message: "Withdrawal rejected and balance refunded successfully",
        withdrawal,
        refunded_amount: refundAmount,
        new_balance: balanceAfter,
      });
    } catch (error) {
      await t.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error rejecting withdrawal:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Approve withdrawal (move from pending to approved, before completing)
 * PUT /api/v1/withdrawals/:id/approve
 * Admin only
 */
export const approveWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const { review_notes } = req.body;

    const withdrawal = await Withdrawal.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "name", "email"],
        },
      ],
    });

    if (!withdrawal) {
      return res.status(404).json({ error: "Withdrawal not found" });
    }

    if (withdrawal.status !== "pending") {
      return res.status(400).json({
        error: "Only pending withdrawals can be approved",
      });
    }

    // Update withdrawal
    await withdrawal.update({
      status: "approved",
      reviewed_by: adminId,
      reviewed_date: new Date(),
      review_notes,
    });

    // Create notification for user
    await Notification.create({
      user_id: withdrawal.user_id,
      title: "Withdrawal Approved",
      message: `Your withdrawal request of Rp ${parseFloat(
        withdrawal.amount
      ).toLocaleString("id-ID")} has been approved and will be processed soon.`,
      type: "withdrawal",
      is_read: false,
    });

    return res.status(200).json({
      message: "Withdrawal approved successfully",
      withdrawal,
    });
  } catch (error) {
    console.error("Error approving withdrawal:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Cancel withdrawal (user can cancel their own pending withdrawal)
 * DELETE /api/v1/withdrawals/:id/cancel
 */
export const cancelWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const withdrawal = await Withdrawal.findByPk(id);

    if (!withdrawal) {
      return res.status(404).json({ error: "Withdrawal not found" });
    }

    if (withdrawal.user_id !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (withdrawal.status !== "pending") {
      return res.status(400).json({
        error: "Only pending withdrawals can be cancelled",
      });
    }

    await withdrawal.destroy();

    return res.status(200).json({
      message: "Withdrawal cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling withdrawal:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default {
  requestWithdrawal,
  getAllWithdrawals,
  getMyWithdrawals,
  getWithdrawalById,
  completeWithdrawal,
  rejectWithdrawal,
  approveWithdrawal,
  cancelWithdrawal,
};
