// backend/src/services/payment.service.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * Razorpay Payment Processing Service
 */
class PaymentService {
  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }

  async createOrder(amount, orderId) {
    try {
      const order = await this.razorpay.orders.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        receipt: `order_${orderId}`,
        notes: {
          orderId: orderId
        }
      });

      logger.info(`Razorpay order created: ${order.id}`);
      return {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency
      };
    } catch (error) {
      logger.error(`Failed to create Razorpay order: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    try {
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
      const generatedSignature = hmac.digest('hex');

      const isValid = generatedSignature === razorpaySignature;

      if (isValid) {
        logger.info(`Payment signature verified: ${razorpayPaymentId}`);
      } else {
        logger.warn(`Payment signature verification failed: ${razorpayPaymentId}`);
      }

      return isValid;
    } catch (error) {
      logger.error(`Signature verification error: ${error.message}`);
      return false;
    }
  }

  async getPaymentDetails(paymentId) {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);

      return {
        success: true,
        data: {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          method: payment.method
        }
      };
    } catch (error) {
      logger.error(`Failed to fetch payment details: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async refundPayment(paymentId, amount) {
    try {
      const refund = await this.razorpay.payments.refund(paymentId, {
        amount: Math.round(amount * 100)
      });

      logger.info(`Payment refunded: ${refund.id}`);
      return {
        success: true,
        refundId: refund.id,
        status: refund.status
      };
    } catch (error) {
      logger.error(`Failed to refund payment: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new PaymentService();
