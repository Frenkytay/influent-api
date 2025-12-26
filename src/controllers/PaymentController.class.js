import BaseController from "../core/BaseController.js";
import PaymentService from "../services/PaymentService.js";

class PaymentController extends BaseController {
  constructor() {
    super(PaymentService);
  }

  /**
   * Create payment
   */
  createPayment = this.asyncHandler(async (req, res) => {
    const { campaign_id, user_id } = req.body;
    
    if (!campaign_id) {
      return this.sendError(res, "campaign_id is required", 400);
    }

    const result = await this.service.createPayment(campaign_id, user_id);
    this.sendSuccess(res, result, 201);
  });

  /**
   * Handle Midtrans notification
   */
  handleNotification = this.asyncHandler(async (req, res) => {
    const notificationJson = req.body;
    await this.service.handleNotification(notificationJson);
    
    // Midtrans expects 200 OK
    res.status(200).json({ ok: true });
  });

  /**
   * Get payment by ID or order ID
   */
  getPayment = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await this.service.getPayment(id);
    this.sendSuccess(res, result);
  });

  /**
   * Handle return from Midtrans
   */
  handleReturn = this.asyncHandler(async (req, res) => {
    const { order_id, orderId: orderIdParam, transaction_id } = req.query;
    const lookupOrderId = order_id || orderIdParam || req.query.order || req.query.orderId;

    if (!lookupOrderId) {
      return res.status(400).send("order_id is required");
    }

    const result = await this.service.handleReturn(lookupOrderId);
    
    // Build redirect URL
    const baseUrls = {
      success: process.env.FRONTEND_SUCCESS_URL || process.env.FRONTEND_URL || "/",
      failed: process.env.FRONTEND_FAILURE_URL || process.env.FRONTEND_URL || "/",
      pending: process.env.FRONTEND_PENDING_URL || process.env.FRONTEND_URL || "/",
    };

    const redirectUrl = baseUrls[result.redirect] || baseUrls.pending;
    const finalOrderId = result.payment?.order_id || result.orderId || lookupOrderId;
    
    const status = result.status || "pending";

    res.redirect(
      `${redirectUrl}?order_id=${encodeURIComponent(finalOrderId)}&status=${encodeURIComponent(status)}`
    );
  });

  /**
   * Get payments by campaign
   */
  getPaymentsByCampaign = this.asyncHandler(async (req, res) => {
    const { campaign_id } = req.params;
    const payments = await this.service.getPaymentsByCampaign(campaign_id);
    this.sendSuccess(res, payments);
  });

  /**
   * Get payments by user
   */
  getPaymentsByUser = this.asyncHandler(async (req, res) => {
    const { user_id } = req.params;
    const payments = await this.service.getPaymentsByUser(user_id);
    this.sendSuccess(res, payments);
  });

  /**
   * Get my payments (authenticated user)
   */
  getMyPayments = this.asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
      return this.sendError(res, "Unauthorized", 401);
    }
    const payments = await this.service.getPaymentsByUser(req.user.id);
    this.sendSuccess(res, payments);
  });
}

export default new PaymentController();
