import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserRepository from "../repositories/UserRepository.js";
import StudentRepository from "../repositories/StudentRepository.js";
import EmailService from "./EmailService.js";
import AppError from "../core/AppError.js";
import InstagramService from "./InstagramService.js";

const JWT_SECRET = process.env.JWT_SECRET || "please_change_me_in_production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "5h";
const RESET_EXPIRES = process.env.RESET_EXPIRES || "1h";
const OTP_EXPIRES_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

/**
 * AuthService - Handles authentication and authorization logic
 */
class AuthService {
  constructor() {
    this.userRepository = UserRepository;
  }

  /**
   * Generate JWT token
   */
  signAuthToken(user) {
    const payload = {
      sub: user.user_id || user.id,
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  /**
   * Generate random 6-digit OTP
   */
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Register a new user
   */
  async register(userData) {
    const { name, email, password, role, phoneNumber } = userData;

    // Validate required fields
    if (!name || !email || !password || !role) {
      throw new AppError("name, email, password and role are required", 400);
    }

    // Validate student email domain
    if (role === "student" && !email.toLowerCase().endsWith(".ac.id")) {
      throw new AppError(
        "Student accounts must use an academic email ending with .ac.id",
        400
      );
    }

    // Check if user already exists
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      if (!existing.email_verified) {
        throw new AppError("Account exists but is not verified", 403);
      }
      throw new AppError("User with this email already exists", 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = this.generateOTP();
    const otpExpires = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);

    // Create user
    const user = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      role,
      status: "inactive",
      otp_code: otp,
      otp_expires_at: otpExpires,
      otp_attempts: 0,
      phone_number: phoneNumber,
    });

    // Send OTP email
    try {
      await EmailService.sendOTPEmail(email, name, otp);
    } catch (error) {
      console.error("Failed to send OTP email:", error);
      // Don't fail registration if email fails
    }

    return {
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      message: "Registration successful. Please verify your email with the OTP sent.",
    };
  }

  /**
   * Verify OTP
   */
  async verifyOTP(email, otp) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.status === "active") {
      throw new AppError("User already verified", 400);
    }

    // Check OTP attempts
    if (user.otp_attempts >= MAX_OTP_ATTEMPTS) {
      throw new AppError("Maximum OTP attempts exceeded. Please request a new OTP.", 400);
    }

    // Check OTP expiry
    if (!user.otp_expires_at || new Date() > new Date(user.otp_expires_at)) {
      throw new AppError("OTP has expired. Please request a new one.", 400);
    }

    // Verify OTP
    if (user.otp_code !== otp) {
      await this.userRepository.incrementOTPAttempts(user.user_id);
      throw new AppError("Invalid OTP", 400);
    }

    // Update user status and clear OTP
    await this.userRepository.update(user.user_id, {
      status: "inactive",
      email_verified: true,
      otp_code: null,
      otp_expires_at: null,
      otp_attempts: 0,
    });

    // Send welcome email
    try {
      await EmailService.sendWelcomeEmail(user.email, user.name);
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }

    // Generate token
    const token = this.signAuthToken(user);

    return {
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: "active",
      },
    };
  }

  /**
   * Resend OTP
   */
  async resendOTP(email) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.status === "active") {
      throw new AppError("User already verified", 400);
    }

    // Generate new OTP
    const otp = this.generateOTP();
    const otpExpires = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);

    await this.userRepository.update(user.user_id, {
      otp_code: otp,
      otp_expires_at: otpExpires,
      otp_attempts: 0,
    });

    // Send OTP email
    await EmailService.sendOTPEmail(email, user.name, otp);

    return {
      message: "OTP resent successfully",
    };
  }

  /**
   * Login user
   */
  async login(email, password) {
    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new AppError("Invalid credentials", 401);
    }

    // Check if user is verified
    // Check if user is verified
    if(!user.email_verified){
      throw new AppError("Please verify your email before logging in", 403);
    }

    // Generate token
    const token = this.signAuthToken(user);

    return {
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        profile_image: user.profile_image,
      },
    };
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists - security best practice
      return {
        message: "If the email exists, a password reset link has been sent",
      };
    }

    // Generate OTP for password reset
    const otp = this.generateOTP();
    const otpExpires = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);

    await this.userRepository.update(user.user_id, {
      otp_code: otp,
      otp_expires_at: otpExpires,
      otp_attempts: 0,
    });

    // Send password reset email
    try {
      await EmailService.sendPasswordResetOTP(email, user.name, otp);
    } catch (error) {
      console.error("Failed to send password reset email:", error);
    }

    return {
      message: "If the email exists, a password reset link has been sent",
    };
  }

  /**
   * Reset password with OTP
   */
  async resetPassword(email, otp, newPassword) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError("Invalid request", 400);
    }

    // Check OTP attempts
    if (user.otp_attempts >= MAX_OTP_ATTEMPTS) {
      throw new AppError("Maximum OTP attempts exceeded. Please request a new OTP.", 400);
    }

    // Check OTP expiry
    if (!user.otp_expires_at || new Date() > new Date(user.otp_expires_at)) {
      throw new AppError("OTP has expired. Please request a new one.", 400);
    }

    // Verify OTP
    if (user.otp_code !== otp) {
      await this.userRepository.incrementOTPAttempts(user.user_id);
      throw new AppError("Invalid OTP", 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP
    await this.userRepository.update(user.user_id, {
      password: hashedPassword,
      otp_code: null,
      otp_expires_at: null,
      otp_attempts: 0,
    });

    return {
      message: "Password reset successfully",
    };
  }

  /**
   * Get current user
   */
  async getMe(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    let studentData = null;
    if (user.role === "student") {
      studentData = await StudentRepository.findByUserId(userId);
    }

    return {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      profile_image: user.profile_image,
      student: studentData,
    };
  }

  /**
   * Change password for logged in user
   */
  async changePassword(userId, oldPassword, newPassword) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      throw new AppError("Invalid old password", 401);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userRepository.update(userId, {
      password: hashedPassword,
    });

    return {
      message: "Password changed successfully",
    };
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  /**
   * Get Instagram Auth URL
   */
  getInstagramAuthUrl() {
    return InstagramService.getAuthUrl();
  }

  /**
   * Login with Instagram
   */
  async instagramLogin(code) {
    // 1. Get Access Token and Details from Instagram
    const accessToken = await InstagramService.getAccessToken(code);
    const igDetails = await InstagramService.getInstagramDetails(accessToken);

    // 2. Find Student with this Instagram ID
    const student = await StudentRepository.findOne({
      where: { instagram_id: igDetails.instagram_id },
    });

    if (!student) {
      throw new AppError(
        "No account linked with this Instagram connection. Please login to your account and link Instagram first.",
        404
      );
    }

    // 3. Update Student Data (followers, username, token)
    await StudentRepository.update(student.user_id, {
      instagram_username: igDetails.username,
      instagram_followers_count: igDetails.followers_count,
      facebook_access_token: accessToken,
    });

    // 4. Get User to generate token
    const user = await this.userRepository.findById(student.user_id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

     if (user.status !== "active") {
      throw new AppError("User account is not active", 403);
    }

    // 5. Generate Token
    const token = this.signAuthToken(user);

    return {
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        profile_image: user.profile_image,
        student: {
           ...student.toJSON(),
           instagram_username: igDetails.username,
           instagram_followers_count: igDetails.followers_count
        }
      },
    };
  }
}

export default new AuthService();
