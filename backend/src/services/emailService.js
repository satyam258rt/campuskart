const nodemailer = require('nodemailer');
const config = require('../config/env');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.isMock = config.email.service === 'mock' || !config.email.smtpUser;
    if (!this.isMock) {
      this.transporter = nodemailer.createTransport({
        host: config.email.smtpHost,
        port: config.email.smtpPort,
        auth: {
          user: config.email.smtpUser,
          pass: config.email.smtpPass
        }
      });
    }
  }

  async sendEmail({ to, subject, html, text }) {
    if (this.isMock) {
      logger.info(`[MOCK EMAIL DISPATCH]`);
      logger.info(`To: ${to}`);
      logger.info(`Subject: ${subject}`);
      logger.info(`Content preview: ${text || html?.substring(0, 150)}...`);
      return { messageId: `mock-${Date.now()}` };
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"${config.email.fromName}" <${config.email.fromEmail}>`,
        to,
        subject,
        text,
        html
      });
      logger.info(`Email sent: ${info.messageId} to ${to}`);
      return info;
    } catch (error) {
      logger.error(`Error sending email to ${to}: ${error.message}`);
      // Don't crash request if email sending fails
      return null;
    }
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${config.clientUrl}/reset-password/${resetToken}`;
    const subject = 'CampusKart - Password Reset Request';
    const text = `Hi ${user.name},\n\nYou requested a password reset for your CampusKart account. Please use the following link to reset your password:\n${resetUrl}\n\nThis link will expire in 1 hour.\nIf you did not make this request, you can safely ignore this email.\n\nRegards,\nCampusKart Team`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #4f46e5;">CampusKart Password Reset</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>You requested a password reset for your CampusKart account. Click the button below to choose a new password:</p>
        <div style="margin: 25px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 13px; color: #64748b;">Or copy and paste this link into your browser:<br/><a href="${resetUrl}">${resetUrl}</a></p>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 30px;">This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
      </div>
    `;

    return this.sendEmail({ to: user.email, subject, text, html });
  }

  async sendVerificationEmail(user, verificationToken) {
    const verifyUrl = `${config.clientUrl}/verify-email/${verificationToken}`;
    const subject = 'CampusKart - Verify Your Campus Account';
    const text = `Hi ${user.name},\n\nWelcome to CampusKart! Please verify your email using this link:\n${verifyUrl}\n\nRegards,\nCampusKart Team`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #4f46e5;">Welcome to CampusKart!</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Thank you for joining your campus marketplace. Please verify your email address to unlock all buying, selling, and renting features:</p>
        <div style="margin: 25px 0;">
          <a href="${verifyUrl}" style="background-color: #10b981; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email</a>
        </div>
        <p style="font-size: 13px; color: #64748b;">Link: <a href="${verifyUrl}">${verifyUrl}</a></p>
      </div>
    `;

    return this.sendEmail({ to: user.email, subject, text, html });
  }
}

module.exports = new EmailService();
