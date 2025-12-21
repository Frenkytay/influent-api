import BaseController from "../core/BaseController.js";
import AuthService from "../services/AuthService.js";

/**
 * AuthController - Handles authentication HTTP requests
 */
class AuthController extends BaseController {
  constructor() {
    super(AuthService);
  }

  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  register = this.asyncHandler(async (req, res) => {
    const result = await this.service.register(req.body);
    this.sendSuccess(res, result, 201);
  });

  /**
   * Verify OTP
   * POST /api/v1/auth/verify-otp
   */
  verifyOTP = this.asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return this.sendError(res, "Email and OTP are required", 400);
    }

    const result = await this.service.verifyOTP(email, otp);
    this.sendSuccess(res, result);
  });

  /**
   * Resend OTP
   * POST /api/v1/auth/resend-otp
   */
  resendOTP = this.asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return this.sendError(res, "Email is required", 400);
    }

    const result = await this.service.resendOTP(email);
    this.sendSuccess(res, result);
  });

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  login = this.asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return this.sendError(res, "Email and password are required", 400);
    }

    const result = await this.service.login(email, password);
    this.sendSuccess(res,  result );
  });

  /**
   * Request password reset
   * POST /api/v1/auth/forgot-password
   */
  forgotPassword = this.asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return this.sendError(res, "Email is required", 400);
    }

    const result = await this.service.requestPasswordReset(email);
    this.sendSuccess(res, result);
  });

  /**
   * Reset password with OTP
   * POST /api/v1/auth/reset-password
   */
  resetPassword = this.asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return this.sendError(res, "Email, OTP, and new password are required", 400);
    }

    const result = await this.service.resetPassword(email, otp, newPassword);
    this.sendSuccess(res, result);
  });

  /**
   * Get current user
   * GET /api/v1/auth/me
   */
  getMe = this.asyncHandler(async (req, res) => {
    if (!req.user) {
      return this.sendError(res, "Unauthorized", 401);
    }

    const result = await this.service.getMe(req.user.id);
    this.sendSuccess(res, { user: result });
  });

  /**
   * Change password
   * POST /api/v1/auth/change-password
   */
  changePassword = this.asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return this.sendError(res, "Old password and new password are required", 400);
    }

    if (!req.user) {
      return this.sendError(res, "Unauthorized", 401);
    }

    const result = await this.service.changePassword(req.user.id, oldPassword, newPassword);
    this.sendSuccess(res, result);
  });
}

export default new AuthController();
