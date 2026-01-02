import BaseRepository from "../core/BaseRepository.js";
import User from "../models/User.js";
import Student from "../models/Student.js";

/**
 * UserRepository - Handles all database operations for User model
 */
class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async getAll(queryFilters = {}, options = {}) {
    // Check if we should include student data
    const include = [];
    if (options.includeStudent) {
        include.push({ model: Student });
    }

    const { sort, order, ...restOptions } = options;
    const where = this.buildWhereClause(queryFilters);
    const orderClause = this.buildOrderClause(sort, order);

    return await this.findAll({
      where,
      order: orderClause,
      include,
      ...restOptions,
    });
  }

  /**
   * Find user by ID
   */
  async findById(id, options = {}) {
    // Check if we should include student data
    const include = [];
    if (options.includeStudent) {
        include.push({ model: Student });
    }

    // Pass include array to Sequelize findByPk
    // Note: findByPk supports include directly
    return await this.model.findByPk(id, {
        include: include.length ? include : undefined,
        ...options
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    return await this.findOne({ where: { email } });
  }

  /**
   * Find user with specific status
   */
  async findByStatus(status, options = {}) {
    return await this.findAll({
      where: { status },
      ...options,
    });
  }

  /**
   * Find user by role
   */
  async findByRole(role, options = {}) {
    const include = [];
    // If searching for students or if explicitly requested, include student profile
    if (role === 'student' || options.includeStudent) {
        include.push({ model: Student });
    }

    return await this.findAll({
      where: { role },
      include,
      ...options,
    });
  }

  /**
   * Update OTP for user
   */
  async updateOTP(userId, otp, expiresAt) {
    return await this.update(userId, {
      otp,
      otp_expires: expiresAt,
    });
  }

  /**
   * Clear OTP for user
   */
  async clearOTP(userId) {
    return await this.update(userId, {
      otp: null,
      otp_expires: null,
      otp_attempts: 0,
    });
  }

  /**
   * Increment OTP attempts
   */
  async incrementOTPAttempts(userId) {
    const user = await this.findById(userId);
    if (!user) throw new Error("User not found");
    
    return await this.update(userId, {
      otp_attempts: (user.otp_attempts || 0) + 1,
    });
  }
}

export default new UserRepository();
