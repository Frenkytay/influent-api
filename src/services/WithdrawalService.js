import WithdrawalRepository from "../repositories/WithdrawalRepository.js";
import UserRepository from "../repositories/UserRepository.js";
import TransactionRepository from "../repositories/TransactionRepository.js";
import NotificationRepository from "../repositories/NotificationRepository.js";
import sequelize from "../config/db.js";
import EmailService from "./EmailService.js";

class WithdrawalService {
  constructor() {
    this.withdrawalRepo = WithdrawalRepository;
    this.userRepo = UserRepository;
    this.transactionRepo = TransactionRepository;
    this.notificationRepo = NotificationRepository;
  }

  async requestWithdrawal(userId, withdrawalData) {
    const { amount, bank_name, account_number, account_holder_name } = withdrawalData;

    if (!amount || !bank_name || !account_number || !account_holder_name) {
      throw new Error(
        "amount, bank_name, account_number, and account_holder_name are required"
      );
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const currentBalance = parseFloat(user.balance || 0);
    const requestAmount = parseFloat(amount);

    if (currentBalance < requestAmount) {
      throw new Error("Insufficient balance");
    }

    const t = await sequelize.transaction();

    try {
      const balanceBefore = currentBalance;
      const balanceAfter = balanceBefore - requestAmount;

      await this.userRepo.update(userId, { balance: balanceAfter }, { transaction: t });

      const withdrawal = await this.withdrawalRepo.create(
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

      await this.transactionRepo.create(
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

      await EmailService.sendWithdrawalRequestEmail(
        user.email,
        user.name,
        amount,
        withdrawal.withdrawal_id
      );

      await this.notificationRepo.create({
        user_id: userId,
        title: "Permintaan Penarikan Dikirim",
        message: `Permintaan penarikan Anda sebesar Rp ${parseFloat(amount).toLocaleString(
          "id-ID"
        )} telah dikirim dan sedang menunggu tinjauan.`,
        type: "withdrawal",
        is_read: false,
      });

      const admins = await this.userRepo.findByRole("admin");
      for (const admin of admins) {
        await this.notificationRepo.create({
          user_id: admin.user_id,
          title: "Permintaan Penarikan Baru",
          message: `${user.name} telah meminta penarikan sebesar Rp ${parseFloat(
            amount
          ).toLocaleString("id-ID")}`,
          type: "withdrawal",
          is_read: false,
        });
      }

      return {
        withdrawal,
        new_balance: balanceAfter,
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getAllWithdrawals(filters = {}) {
    const { status } = filters;
    const options = {
      order: [["request_date", "DESC"]],
    };

    if (status) {
      return await this.withdrawalRepo.findByStatus(status, options);
    }

    return await this.withdrawalRepo.findAllWithRelations(options);
  }

  async getMyWithdrawals(userId) {
    return await this.withdrawalRepo.findByUserId(userId, {
      order: [["request_date", "DESC"]],
    });
  }

  async getById(id, userId, userRole) {
    const withdrawal = await this.withdrawalRepo.findByIdWithRelations(id);

    if (!withdrawal) {
      throw new Error("Withdrawal not found");
    }

    if (userRole !== "admin" && withdrawal.user_id !== userId) {
      throw new Error("Access denied");
    }

    return withdrawal;
  }

  async approveWithdrawal(id, adminId, reviewNotes) {
    const withdrawal = await this.withdrawalRepo.findByIdWithRelations(id);

    if (!withdrawal) {
      throw new Error("Withdrawal not found");
    }

    if (withdrawal.status !== "pending") {
      throw new Error("Only pending withdrawals can be approved");
    }

    await this.withdrawalRepo.update(id, {
      status: "approved",
      reviewed_by: adminId,
      reviewed_date: new Date(),
      review_notes: reviewNotes,
    });

    await this.notificationRepo.create({
      user_id: withdrawal.user_id,
      title: "Penarikan Disetujui",
      message: `Permintaan penarikan Anda sebesar Rp ${parseFloat(
        withdrawal.amount
      ).toLocaleString("id-ID")} telah disetujui dan akan segera diproses.`,
      type: "withdrawal",
      is_read: false,
    });

    return await this.withdrawalRepo.findByIdWithRelations(id);
  }

  async completeWithdrawal(id, adminId, transferProofUrl, reviewNotes) {
    if (!transferProofUrl) {
      throw new Error("Transfer proof image is required");
    }

    const withdrawal = await this.withdrawalRepo.findByIdWithRelations(id);

    if (!withdrawal) {
      throw new Error("Withdrawal not found");
    }

    if (withdrawal.status !== "pending" && withdrawal.status !== "approved") {
      throw new Error("Only pending or approved withdrawals can be completed");
    }

    await this.withdrawalRepo.update(id, {
      status: "completed",
      reviewed_by: adminId,
      reviewed_date: new Date(),
      review_notes: reviewNotes,
      transfer_proof_url: transferProofUrl,
      completed_date: new Date(),
    });

    await EmailService.sendWithdrawalCompletedEmail(
      withdrawal.user.email,
      withdrawal.user.name,
      withdrawal.amount,
      withdrawal.withdrawal_id,
      transferProofUrl
    );

    await this.notificationRepo.create({
      user_id: withdrawal.user_id,
      title: "Penarikan Selesai",
      message: `Permintaan penarikan Anda sebesar Rp ${parseFloat(
        withdrawal.amount
      ).toLocaleString("id-ID")} telah selesai.`,
      type: "withdrawal",
      is_read: false,
    });

    return await this.withdrawalRepo.findByIdWithRelations(id);
  }

  async rejectWithdrawal(id, adminId, rejectionReason) {
    if (!rejectionReason) {
      throw new Error("rejection_reason is required");
    }

    const withdrawal = await this.withdrawalRepo.findByIdWithRelations(id);

    if (!withdrawal) {
      throw new Error("Withdrawal not found");
    }

    if (withdrawal.status !== "pending") {
      throw new Error("Only pending withdrawals can be rejected");
    }

    const t = await sequelize.transaction();

    try {
      const user = await this.userRepo.findById(withdrawal.user_id);
      const balanceBefore = parseFloat(user.balance || 0);
      const refundAmount = parseFloat(withdrawal.amount);
      const balanceAfter = balanceBefore + refundAmount;

      await this.userRepo.update(withdrawal.user_id, { balance: balanceAfter }, { transaction: t });

      await this.withdrawalRepo.update(
        id,
        {
          status: "rejected",
          reviewed_by: adminId,
          reviewed_date: new Date(),
          rejection_reason: rejectionReason,
        },
        { transaction: t }
      );

      await this.transactionRepo.create(
        {
          user_id: withdrawal.user_id,
          amount: refundAmount,
          type: "credit",
          category: "refund",
          reference_type: "withdrawal",
          reference_id: withdrawal.withdrawal_id,
          description: `Refund for rejected withdrawal - ${rejectionReason}`,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
        },
        { transaction: t }
      );

      await t.commit();

      await EmailService.sendWithdrawalRejectedEmail(
        withdrawal.user.email,
        withdrawal.user.name,
        withdrawal.amount,
        withdrawal.withdrawal_id,
        rejectionReason
      );

      await this.notificationRepo.create({
        user_id: withdrawal.user_id,
        title: "Penarikan Ditolak - Saldo Dikembalikan",
        message: `Permintaan penarikan Anda sebesar Rp ${parseFloat(
          withdrawal.amount
        ).toLocaleString("id-ID")} telah ditolak. Alasan: ${rejectionReason}`,
        type: "withdrawal",
        is_read: false,
      });

      return {
        withdrawal: await this.withdrawalRepo.findByIdWithRelations(id),
        refunded_amount: refundAmount,
        new_balance: balanceAfter,
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async cancelWithdrawal(id, userId) {
    const withdrawal = await this.withdrawalRepo.findById(id);

    if (!withdrawal) {
      throw new Error("Withdrawal not found");
    }

    if (withdrawal.user_id !== userId) {
      throw new Error("Access denied");
    }

    if (withdrawal.status !== "pending") {
      throw new Error("Only pending withdrawals can be cancelled");
    }

    await this.withdrawalRepo.delete(id);
  }
}

export default new WithdrawalService();
