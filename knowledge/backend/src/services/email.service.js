const axios = require('axios');
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/**
 * Email Service with multiple providers (Resend, SMTP, Console)
 */
class EmailService {
  constructor() {
    this.provider = 'console'; // default

    if (process.env.RESEND_API_KEY) {
      this.provider = 'resend';
      this.apiKey = process.env.RESEND_API_KEY;
      this.baseURL = 'https://api.resend.com';
    } else if (process.env.SMTP_HOST) {
      this.provider = 'smtp';
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }

    this.fromEmail = process.env.SENDER_EMAIL || 'noreply@foodorder.com';
    logger.info(`Email Service initialized using provider: ${this.provider}`);
  }

  async sendEmail(to, subject, html) {
    if (this.provider === 'resend') {
      return axios.post(`${this.baseURL}/emails`, {
        from: this.fromEmail,
        to,
        subject,
        html
      }, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
    } else if (this.provider === 'smtp') {
      return this.transporter.sendMail({
        from: this.fromEmail,
        to,
        subject,
        html
      });
    } else {
      // Console fallback
      console.log('---------------------------------------------------');
      console.log(`📧 EMAIL MOCK (To: ${to}, Subject: ${subject})`);
      console.log(html.replace(/<[^>]*>/g, ' ').substring(0, 100) + '...');
      console.log('---------------------------------------------------');
      return { data: { id: 'mock-email-id' } };
    }
  }

  async sendOrderConfirmation(email, orderDetails) {
    try {
      const htmlContent = `
        <h2>Order Confirmed!</h2>
        <p>Thank you for your order #${orderDetails.orderNumber}</p>
        <p>Restaurant: ${orderDetails.restaurantName}</p>
        <p>Total: ₹${orderDetails.total}</p>
        <p>Estimated Delivery: ${orderDetails.estimatedDeliveryTime}</p>
      `;

      await this.sendEmail(email, `Order Confirmed - #${orderDetails.orderNumber}`, htmlContent);

      logger.info(`Order confirmation email sent to ${email}`);
      return { success: true };
    } catch (error) {
      logger.error(`Failed to send order email: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async sendDeliveryNotification(email, deliveryInfo) {
    try {
      const htmlContent = `
        <h2>Your Food is On the Way!</h2>
        <p>Order #${deliveryInfo.orderNumber}</p>
        <p>Driver: ${deliveryInfo.driverName}</p>
        <p>Estimated Arrival: ${deliveryInfo.eta}</p>
      `;

      await this.sendEmail(email, `Delivery Update - Order #${deliveryInfo.orderNumber}`, htmlContent);

      logger.info(`Delivery notification sent to ${email}`);
      return { success: true };
    } catch (error) {
      logger.error(`Failed to send delivery email: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(email, userName) {
    try {
      const htmlContent = `
        <h2>Welcome to FoodOrder!</h2>
        <p>Hi ${userName},</p>
        <p>We're excited to have you on board.</p>
      `;

      await this.sendEmail(email, 'Welcome to FoodOrder', htmlContent);

      logger.info(`Welcome email sent to ${email}`);
      return { success: true };
    } catch (error) {
      logger.error(`Failed to send welcome email: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
