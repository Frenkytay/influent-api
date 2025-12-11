import BaseController from "../core/BaseController.js";
import UserService from "../services/UserService.js";

/**
 * UserController - Handles HTTP requests for User endpoints
 */
class UserController extends BaseController {
  constructor() {
    super(UserService);
  }

  /**
   * Get all users with filters
   * GET /api/v1/users
   */
  getAllUsers = this.asyncHandler(async (req, res) => {
    const { name, email, role, status, sort, order } = req.query;
    
    const users = await this.service.getAll(
      { name, email, role, status },
      { sort, order }
    );
    
    this.sendSuccess(res, users);
  });

  /**
   * Get user by ID
   * GET /api/v1/users/:id
   */
  getById = this.asyncHandler(async (req, res) => {
    const user = await this.service.getById(req.params.id);
    this.sendSuccess(res, user);
  });

  /**
   * Create new user
   * POST /api/v1/users
   */
  create = this.asyncHandler(async (req, res) => {
    const user = await this.service.create(req.body);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user.toJSON();
    
    this.sendSuccess(res, userWithoutPassword, 201);
  });

  /**
   * Update user
   * PUT /api/v1/users/:id
   */
  update = this.asyncHandler(async (req, res) => {
    const user = await this.service.update(req.params.id, req.body);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user.toJSON();
    
    this.sendSuccess(res, userWithoutPassword);
  });

  /**
   * Delete user
   * DELETE /api/v1/users/:id
   */
  delete = this.asyncHandler(async (req, res) => {
    await this.service.delete(req.params.id);
    this.sendSuccess(res, { message: "User deleted successfully" });
  });

  /**
   * Get current user profile
   * GET /api/v1/users/me
   */
  getMe = this.asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
      return this.sendError(res, "Unauthorized", 401);
    }

    const user = await this.service.getById(req.user.id);
    
    // Remove sensitive fields
    const { password, otp, otp_expires, ...safeUser } = user.toJSON();
    
    this.sendSuccess(res, safeUser);
  });

  /**
   * Update current user profile
   * PUT /api/v1/users/me
   */
  updateMe = this.asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
      return this.sendError(res, "Unauthorized", 401);
    }

    // Prevent updating sensitive fields
    const { password, balance, role, status, ...allowedUpdates } = req.body;

    const user = await this.service.update(req.user.id, allowedUpdates);
    
    // Remove sensitive fields
    const { password: pwd, otp, otp_expires, ...safeUser } = user.toJSON();
    
    this.sendSuccess(res, safeUser);
  });
}

export default new UserController();
