// backend/src/controllers/payment.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'mock_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_key_secret'
});

// Check if we are using placeholder credentials
const IS_MOCK_PAYMENT = process.env.RAZORPAY_KEY_ID?.startsWith('your_') || !process.env.RAZORPAY_KEY_ID;


const paymentMethods = ['razorpay', 'cash'];

const getPaymentMethods = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: paymentMethods
    });
  } catch (error) {
    next(error);
  }
};

const initiatePayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { paymentMethod = 'razorpay' } = req.body;

    // Get order
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.customerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (paymentMethod === 'razorpay' || paymentMethod === 'card') {
      let razorpayOrderId;

      if (IS_MOCK_PAYMENT) {
        logger.info('Using Mock Payment Mode');
        razorpayOrderId = `order_mock_${Date.now()}`;
      } else {
        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
          amount: Math.round(order.total * 100), // Convert to paise
          currency: 'INR',
          receipt: order.orderNumber,
          notes: {
            orderId: order.id,
            customerId: req.user.id
          }
        });
        razorpayOrderId = razorpayOrder.id;
      }

      // Save payment record

      // Save payment record
      const payment = await prisma.payment.create({
        data: {
          orderId,
          amount: order.total,
          paymentMethod: 'razorpay',
          status: 'pending',
          razorpayOrderId: razorpayOrderId
        }
      });

      logger.info(`Payment initiated: ${payment.id}`);

      return res.status(200).json({
        success: true,
        data: {
          paymentId: payment.id,
          razorpayOrderId: razorpayOrderId,
          amount: order.total,
          currency: 'INR',
          key: IS_MOCK_PAYMENT ? 'mock_key' : process.env.RAZORPAY_KEY_ID,
          isMock: IS_MOCK_PAYMENT
        }
      });
    }

    // For cash payment
    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount: order.total,
        paymentMethod: 'cash',
        status: 'pending'
      }
    });

    logger.info(`Cash payment initiated: ${payment.id}`);

    res.status(200).json({
      success: true,
      message: 'Payment method set to cash',
      data: {
        paymentId: payment.id,
        amount: order.total,
        paymentMethod: 'cash'
      }
    });
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID required'
      });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.customerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Verify signature
    // Verify signature
    if (razorpayOrderId.startsWith('order_mock_')) {
      // Mock verification success
      logger.info('Mock payment verified successfully');
    } else {
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
      const generated_signature = hmac.digest('hex');

      if (generated_signature !== razorpaySignature) {
        logger.warn(`Payment verification failed: ${orderId}`);
        return res.status(400).json({
          success: false,
          message: 'Invalid payment signature'
        });
      }
    }

    // Update payment
    const payment = await prisma.payment.update({
      where: { orderId },
      data: {
        status: 'completed',
        razorpayPaymentId,
        razorpaySignature
      }
    });

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'completed',
        status: 'confirmed'
      }
    });

    logger.info(`Payment verified: ${payment.id}`);

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        orderId,
        paymentId: payment.id,
        status: 'completed'
      }
    });
  } catch (error) {
    next(error);
  }
};

const getPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const payment = await prisma.payment.findUnique({ where: { orderId } });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPaymentMethods,
  initiatePayment,
  verifyPayment,
  getPaymentStatus
};
