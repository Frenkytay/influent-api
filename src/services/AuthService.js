import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserRepository from "../repositories/UserRepository.js";
import EmailService from "./EmailService.js";

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
    const { name, email, password, role } = userData;

    // Validate required fields
    if (!name || !email || !password || !role) {
      throw new Error("name, email, password and role are required");
    }

    // Validate student email domain
    if (role === "student" && !email.toLowerCase().endsWith(".ac.id")) {
      throw new Error(
        "Student accounts must use an academic email ending with .ac.id"
      );
    }

    // Check if user already exists
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new Error("User with this email already exists");
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
      throw new Error("User not found");
    }

    if (user.status === "active") {
      throw new Error("User already verified");
    }

    // Check OTP attempts
    if (user.otp_attempts >= MAX_OTP_ATTEMPTS) {
      throw new Error("Maximum OTP attempts exceeded. Please request a new OTP.");
    }

    // Check OTP expiry
    if (!user.otp_expires_at || new Date() > new Date(user.otp_expires_at)) {
      throw new Error("OTP has expired. Please request a new one.");
    }

    // Verify OTP
    if (user.otp_code !== otp) {
      await this.userRepository.incrementOTPAttempts(user.user_id);
      throw new Error("Invalid OTP");
    }

    // Update user status and clear OTP
    await this.userRepository.update(user.user_id, {
      status: "active",
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
      throw new Error("User not found");
    }

    if (user.status === "active") {
      throw new Error("User already verified");
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
      throw new Error("Email and password are required");
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    // Check if user is verified
    console.log(user.email_verified);
    if(user.email_verified == false){
      throw new Error("Please verify your email before logging in");
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
      // Don't reveal if user exists
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
      throw new Error("Invalid request");
    }

    // Check OTP attempts
    if (user.otp_attempts >= MAX_OTP_ATTEMPTS) {
      throw new Error("Maximum OTP attempts exceeded. Please request a new OTP.");
    }

    // Check OTP expiry
    if (!user.otp_expires_at || new Date() > new Date(user.otp_expires_at)) {
      throw new Error("OTP has expired. Please request a new one.");
    }

    // Verify OTP
    if (user.otp_code !== otp) {
      await this.userRepository.incrementOTPAttempts(user.user_id);
      throw new Error("Invalid OTP");
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
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }
}

export default new AuthService();
