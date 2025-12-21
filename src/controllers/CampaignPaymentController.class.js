import BaseController from "../core/BaseController.js";
import CampaignPaymentService from "../services/CampaignPaymentService.js";

class CampaignPaymentController extends BaseController {
  constructor() {
    super(CampaignPaymentService);
  }

  paySingleStudent = this.asyncHandler(async (req, res) => {
    const result = await this.service.paySingleStudent(req.body);
    this.sendSuccess(res, {
      message: "Payment processed successfully",
      ...result,
    });
  });

  payAllStudents = this.asyncHandler(async (req, res) => {
    const result = await this.service.payAllStudents(req.body);
    this.sendSuccess(res, {
      message: "Batch payment processed",
      ...result,
    });
  });

  payCustomAmounts = this.asyncHandler(async (req, res) => {
    const { payments } = req.body;
    const result = await this.service.payCustomAmounts(payments);
    this.sendSuccess(res, {
      message: "Custom payments processed",
      ...result,
    });
  });

  getCompanyHistory = this.asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
      return this.sendError(res, "Unauthorized", 401);
    }
    const result = await this.service.getCompanyHistory(req.user.id);
    this.sendSuccess(res, result);
  });
}

export default new CampaignPaymentController();
