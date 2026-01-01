const axios = require('axios');
const logger = require('../utils/logger');

/**
 * SMS Service (Fast2SMS or Console)
 */
class SMSService {
  constructor() {
    this.apiKey = process.env.FAST2SMS_API_KEY;
    this.baseURL = 'https://www.fast2sms.com/dev/bulkV2';

    if (!this.apiKey) {
      logger.info('SMS Service initialized in MOCK mode (Console Logging)');
    }
  }

  async sendOTP(phoneNumber, otp) {
    if (!this.apiKey) {
      console.log(`📱 SMS MOCK (To: ${phoneNumber}): Your OTP is ${otp}`);
      return { success: true, messageId: 'mock-sms-id' };
    }

    try {
      const response = await axios.post(this.baseURL, {}, {
        params: {
          authorization: this.apiKey,
          variables_values: otp,
          route: 'otp',
          numbers: phoneNumber
        }
      });

      logger.info(`OTP sent to ${phoneNumber}`);
      return {
        success: true,
        messageId: response.data.message_id
      };
    } catch (error) {
      logger.error(`Failed to send OTP: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendOrderConfirmation(phoneNumber, orderNumber) {
    const message = `Your order #${orderNumber} has been confirmed! Track it in the app.`;

    if (!this.apiKey) {
      console.log(`📱 SMS MOCK (To: ${phoneNumber}): ${message}`);
      return { success: true, messageId: 'mock-sms-id' };
    }

    try {
      const response = await axios.post(this.baseURL, {}, {
        params: {
          authorization: this.apiKey,
          message: message,
          language: 'english',
          route: 'p',
          numbers: phoneNumber
        }
      });

      logger.info(`Order confirmation sent to ${phoneNumber}`);
      return {
        success: true,
        messageId: response.data.message_id
      };
    } catch (error) {
      logger.error(`Failed to send order confirmation: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendDeliveryUpdate(phoneNumber, status, eta) {
    const message = `Your food is ${status}. ETA: ${eta} minutes.`;

    if (!this.apiKey) {
      console.log(`📱 SMS MOCK (To: ${phoneNumber}): ${message}`);
      return { success: true, messageId: 'mock-sms-id' };
    }

    try {
      const response = await axios.post(this.baseURL, {}, {
        params: {
          authorization: this.apiKey,
          message: message,
          language: 'english',
          route: 'p',
          numbers: phoneNumber
        }
      });

      logger.info(`Delivery update sent to ${phoneNumber}`);
      return {
        success: true,
        messageId: response.data.message_id
      };
    } catch (error) {
      logger.error(`Failed to send delivery update: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new SMSService();
