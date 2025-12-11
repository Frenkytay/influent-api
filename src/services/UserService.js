import BaseService from "../core/BaseService.js";
import UserRepository from "../repositories/UserRepository.js";
import bcrypt from "bcryptjs";

/**
 * UserService - Contains business logic for User operations
 */
class UserService extends BaseService {
  constructor() {
    super(UserRepository);
  }

  /**
   * Get all users with filters
   */
  async getAll(filters = {}, options = {}) {
    const { name, email, role, status } = filters;
    
    const queryFilters = {};
    if (name) queryFilters.name_like = name;
    if (email) queryFilters.email_like = email;
    if (role) queryFilters.role = role;
    if (status) queryFilters.status = status;

    return await super.getAll(queryFilters, options);
  }

  /**
   * Get user by email
   */
  async getByEmail(email) {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  /**
   * Create a new user
   */
  async create(userData) {
    // Validate required fields
    this.validateRequired(userData, ["name", "email", "password", "role"]);

    // Check if user already exists
    const existing = await this.repository.findByEmail(userData.email);
    if (existing) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    return await this.repository.create({
      ...userData,
      password: hashedPassword,
      status: "pending", // Default status
    });
  }

  /**
   * Update user
   */
  async update(id, userData) {
    // If password is being updated, hash it
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    return await this.repository.update(id, userData);
  }

  /**
   * Verify user credentials
   */
  async verifyCredentials(email, password) {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    return user;
  }

  /**
   * Update user balance
   */
  async updateBalance(userId, amount, operation = "add") {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const currentBalance = parseFloat(user.balance || 0);
    let newBalance;

    if (operation === "add") {
      newBalance = currentBalance + amount;
    } else if (operation === "subtract") {
      if (currentBalance < amount) {
        throw new Error("Insufficient balance");
      }
      newBalance = currentBalance - amount;
    } else {
      throw new Error("Invalid operation");
    }

    return await this.repository.update(userId, { balance: newBalance });
  }

  /**
   * Get users by role
   */
  async getByRole(role, options = {}) {
    return await this.repository.findByRole(role, options);
  }

  /**
   * Get users by status
   */
  async getByStatus(status, options = {}) {
    return await this.repository.findByStatus(status, options);
  }
}

export default new UserService();
