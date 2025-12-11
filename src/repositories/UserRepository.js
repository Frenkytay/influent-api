import BaseRepository from "../core/BaseRepository.js";
import User from "../models/User.js";

/**
 * UserRepository - Handles all database operations for User model
 */
class UserRepository extends BaseRepository {
  constructor() {
    super(User);
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
    return await this.findAll({
      where: { role },
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
