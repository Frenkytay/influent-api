import nodemailer from "nodemailer";

/**
 * EmailService - Handles all email sending operations
 */
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      authMethod: "LOGIN",
      debug: true,
      logger: true,
      tls: {
        rejectUnauthorized: false,
      },
    });

    this.fromName = process.env.SMTP_FROM_NAME || "Influent Platform";
    this.fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
  }

  /**
   * Get from address
   */
  getFromAddress() {
    return `"${this.fromName}" <${this.fromEmail}>`;
  }

  /**
   * Send OTP email
   */
  async sendOTPEmail(email, name, otp) {
    const mailOptions = {
      from: this.getFromAddress(),
      to: email,
      subject: "Verify Your Email - Influent Platform",
      html: this.getOTPTemplate(name, otp),
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send password reset OTP
   */
  async sendPasswordResetOTP(email, name, otp) {
    const mailOptions = {
      from: this.getFromAddress(),
      to: email,
      subject: "Reset Your Password - Influent Platform",
      html: this.getPasswordResetTemplate(name, otp),
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email, name) {
    const mailOptions = {
      from: this.getFromAddress(),
      to: email,
      subject: "Welcome to Influent Platform!",
      html: this.getWelcomeTemplate(name),
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send withdrawal request email
   */
  async sendWithdrawalRequestEmail(email, name, amount, withdrawalId) {
    const mailOptions = {
      from: this.getFromAddress(),
      to: email,
      subject: "Withdrawal Request Received - Influent Platform",
      html: this.getWithdrawalRequestTemplate(name, amount, withdrawalId),
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send withdrawal completed email
   */
  async sendWithdrawalCompletedEmail(email, name, amount, withdrawalId, transferProofUrl) {
    const mailOptions = {
      from: this.getFromAddress(),
      to: email,
      subject: "Withdrawal Completed - Influent Platform",
      html: this.getWithdrawalCompletedTemplate(name, amount, withdrawalId, transferProofUrl),
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send withdrawal rejected email
   */
  async sendWithdrawalRejectedEmail(email, name, amount, withdrawalId, reason) {
    const mailOptions = {
      from: this.getFromAddress(),
      to: email,
      subject: "Withdrawal Request Rejected - Influent Platform",
      html: this.getWithdrawalRejectedTemplate(name, amount, withdrawalId, reason),
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * OTP Email Template
   */
  getOTPTemplate(name, otp) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .otp-box { background: white; border: 2px dashed #4F46E5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 10px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Email Verification</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${name}</strong>,</p>
            <p>Thank you for registering with Influent Platform! To complete your registration, please verify your email address using the OTP code below:</p>
            <div class="otp-box">
              <p style="margin: 0; font-size: 14px; color: #666;">Your OTP Code:</p>
              <p class="otp-code">${otp}</p>
              <p style="margin: 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
            </div>
            <div class="warning">
              <strong>⚠️ Security Note:</strong> Never share this OTP with anyone. Our team will never ask for your OTP.
            </div>
            <p>If you didn't request this verification, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2025 Influent Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Password Reset Template
   */
  getPasswordResetTemplate(name, otp) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #DC2626; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .otp-box { background: white; border: 2px dashed #DC2626; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #DC2626; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${name}</strong>,</p>
            <p>We received a request to reset your password. Use the OTP code below:</p>
            <div class="otp-box">
              <p style="margin: 0; font-size: 14px; color: #666;">Your OTP Code:</p>
              <p class="otp-code">${otp}</p>
              <p style="margin: 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
            </div>
            <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>© 2025 Influent Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Welcome Email Template
   */
  getWelcomeTemplate(name) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Influent!</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${name}</strong>,</p>
            <p>Congratulations! Your email has been successfully verified and your account is now active.</p>
            <p>You can now:</p>
            <ul>
              <li>Browse and apply for campaigns</li>
              <li>Connect with brands</li>
              <li>Start earning money</li>
            </ul>
            <p>Thank you for joining Influent Platform!</p>
          </div>
          <div class="footer">
            <p>© 2025 Influent Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Withdrawal Request Template
   */
  getWithdrawalRequestTemplate(name, amount, withdrawalId) {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Withdrawal Request Received</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>We have received your withdrawal request:</p>
          <ul>
            <li><strong>Amount:</strong> Rp ${parseFloat(amount).toLocaleString("id-ID")}</li>
            <li><strong>Reference ID:</strong> ${withdrawalId}</li>
            <li><strong>Status:</strong> Pending Review</li>
          </ul>
          <p>Your request is being processed and will be reviewed by our team shortly.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Withdrawal Completed Template
   */
  getWithdrawalCompletedTemplate(name, amount, withdrawalId, transferProofUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>✅ Withdrawal Completed</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your withdrawal has been successfully processed:</p>
          <ul>
            <li><strong>Amount:</strong> Rp ${parseFloat(amount).toLocaleString("id-ID")}</li>
            <li><strong>Reference ID:</strong> ${withdrawalId}</li>
          </ul>
          ${transferProofUrl ? `<p><a href="${transferProofUrl}">View Transfer Proof</a></p>` : ""}
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Withdrawal Rejected Template
   */
  getWithdrawalRejectedTemplate(name, amount, withdrawalId, reason) {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>❌ Withdrawal Request Rejected</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Unfortunately, your withdrawal request has been rejected:</p>
          <ul>
            <li><strong>Amount:</strong> Rp ${parseFloat(amount).toLocaleString("id-ID")}</li>
            <li><strong>Reference ID:</strong> ${withdrawalId}</li>
            <li><strong>Reason:</strong> ${reason}</li>
          </ul>
          <p>The amount has been refunded to your account balance.</p>
        </div>
      </body>
      </html>
    `;
  }
}

export default new EmailService();
