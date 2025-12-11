import BaseController from "../core/BaseController.js";
import WithdrawalService from "../services/WithdrawalService.js";

class WithdrawalController extends BaseController {
  constructor() {
    super(WithdrawalService);
  }

  requestWithdrawal = this.asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
      return this.sendError(res, "Unauthorized", 401);
    }

    const result = await this.service.requestWithdrawal(req.user.id, req.body);
    this.sendSuccess(res, {
      message: "Withdrawal request submitted successfully",
      ...result,
    }, 201);
  });

  getAllWithdrawals = this.asyncHandler(async (req, res) => {
    const { status } = req.query;
    const withdrawals = await this.service.getAllWithdrawals({ status });
    this.sendSuccess(res, { withdrawals });
  });

  getMyWithdrawals = this.asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
      return this.sendError(res, "Unauthorized", 401);
    }

    const withdrawals = await this.service.getMyWithdrawals(req.user.id);
    this.sendSuccess(res, { withdrawals });
  });

  getWithdrawalById = this.asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
      return this.sendError(res, "Unauthorized", 401);
    }

    const withdrawal = await this.service.getById(
      req.params.id,
      req.user.id,
      req.user.role
    );
    this.sendSuccess(res, { withdrawal });
  });

  approveWithdrawal = this.asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
      return this.sendError(res, "Unauthorized", 401);
    }

    const { review_notes } = req.body;
    const withdrawal = await this.service.approveWithdrawal(
      req.params.id,
      req.user.id,
      review_notes
    );
    
    this.sendSuccess(res, {
      message: "Withdrawal approved successfully",
      withdrawal,
    });
  });

  completeWithdrawal = this.asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
      return this.sendError(res, "Unauthorized", 401);
    }

    const transferProofUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : null;

    const { review_notes } = req.body;
    const withdrawal = await this.service.completeWithdrawal(
      req.params.id,
      req.user.id,
      transferProofUrl,
      review_notes
    );
    
    this.sendSuccess(res, {
      message: "Withdrawal completed successfully",
      withdrawal,
    });
  });

  rejectWithdrawal = this.asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
      return this.sendError(res, "Unauthorized", 401);
    }

    const { rejection_reason } = req.body;
    const result = await this.service.rejectWithdrawal(
      req.params.id,
      req.user.id,
      rejection_reason
    );
    
    this.sendSuccess(res, {
      message: "Withdrawal rejected and balance refunded successfully",
      ...result,
    });
  });

  cancelWithdrawal = this.asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
      return this.sendError(res, "Unauthorized", 401);
    }

    await this.service.cancelWithdrawal(req.params.id, req.user.id);
    this.sendSuccess(res, { message: "Withdrawal cancelled successfully" });
  });
}

export default new WithdrawalController();
