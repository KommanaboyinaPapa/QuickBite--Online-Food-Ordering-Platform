// backend/src/controllers/tracking.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');
const { calculateDistance, calculateETA } = require('../utils/helpers');

const getOrderTracking = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const tracking = await prisma.tracking.findUnique({
      where: { orderId }
    });

    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: 'Tracking not found'
      });
    }

    // Verify access
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (order.customerId !== req.user.id && order.deliveryAgentId !== req.user.id && req.user.userType !== 'restaurant') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      data: tracking
    });
  } catch (error) {
    next(error);
  }
};

const updateDeliveryLocation = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { latitude, longitude } = req.body;

    // Verify delivery agent
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (order.deliveryAgentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Update tracking
    const tracking = await prisma.tracking.update({
      where: { orderId },
      data: {
        currentLatitude: parseFloat(latitude),
        currentLongitude: parseFloat(longitude)
      }
    });

    // Calculate distance remaining
    if (tracking.customerLatitude && tracking.customerLongitude) {
      const distance = calculateDistance(
        latitude,
        longitude,
        tracking.customerLatitude,
        tracking.customerLongitude
      );

      // Update with distance
      await prisma.tracking.update({
        where: { orderId },
        data: { distanceRemaining: distance }
      });
    }

    logger.info(`Delivery location updated: ${orderId}`);

    // Emit real-time update via Socket.io
    // This would be handled by the Socket.io handler in server.js

    res.status(200).json({
      success: true,
      message: 'Location updated',
      data: tracking
    });
  } catch (error) {
    next(error);
  }
};

const getDeliveryStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        tracking: true,
        deliveryAgent: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            profileImage: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify access
    if (order.customerId !== req.user.id && order.deliveryAgentId !== req.user.id && req.user.userType !== 'restaurant') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        orderId,
        status: order.status,
        tracking: order.tracking,
        deliveryAgent: order.deliveryAgent,
        estimatedDeliveryTime: order.estimatedDeliveryTime
      }
    });
  } catch (error) {
    next(error);
  }
};

const estimateArrival = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const tracking = await prisma.tracking.findUnique({
      where: { orderId }
    });

    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: 'Tracking not found'
      });
    }

    // Calculate ETA
    if (tracking.currentLatitude && tracking.currentLongitude && tracking.customerLatitude && tracking.customerLongitude) {
      const distance = calculateDistance(
        tracking.currentLatitude,
        tracking.currentLongitude,
        tracking.customerLatitude,
        tracking.customerLongitude
      );

      const eta = calculateETA(distance);

      res.status(200).json({
        success: true,
        data: {
          orderId,
          distance,
          estimatedMinutes: eta,
          estimatedArrival: new Date(Date.now() + eta * 60000)
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Location data unavailable'
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrderTracking,
  updateDeliveryLocation,
  getDeliveryStatus,
  estimateArrival
};
