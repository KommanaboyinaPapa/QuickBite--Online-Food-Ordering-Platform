// backend/src/services/notification.service.js
const admin = require('firebase-admin');
const logger = require('../utils/logger');

/**
 * Firebase Cloud Messaging Service for Push Notifications
 */
class NotificationService {
  constructor() {
    // Initialize Firebase Admin SDK
    // Make sure to set FIREBASE_CONFIG environment variable with service account JSON
    if (!admin.apps.length) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG || '{}');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    this.messaging = admin.messaging();
  }

  async sendToDevice(deviceToken, title, body, data = {}) {
    try {
      const message = {
        notification: {
          title,
          body
        },
        data,
        token: deviceToken
      };

      const response = await this.messaging.send(message);

      logger.info(`Notification sent: ${response}`);
      return {
        success: true,
        messageId: response
      };
    } catch (error) {
      logger.error(`Failed to send notification: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendToTopic(topic, title, body, data = {}) {
    try {
      const message = {
        notification: {
          title,
          body
        },
        data,
        topic
      };

      const response = await this.messaging.send(message);

      logger.info(`Topic notification sent to ${topic}`);
      return {
        success: true,
        messageId: response
      };
    } catch (error) {
      logger.error(`Failed to send topic notification: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async subscribeToTopic(deviceTokens, topic) {
    try {
      const response = await this.messaging.subscribeToTopic(deviceTokens, topic);

      logger.info(`Subscribed to topic: ${topic}`);
      return {
        success: true,
        response
      };
    } catch (error) {
      logger.error(`Failed to subscribe to topic: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async unsubscribeFromTopic(deviceTokens, topic) {
    try {
      const response = await this.messaging.unsubscribeFromTopic(deviceTokens, topic);

      logger.info(`Unsubscribed from topic: ${topic}`);
      return {
        success: true,
        response
      };
    } catch (error) {
      logger.error(`Failed to unsubscribe from topic: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Notification templates
  async sendOrderConfirmation(deviceToken, orderNumber) {
    return this.sendToDevice(
      deviceToken,
      'Order Confirmed',
      `Your order #${orderNumber} has been confirmed!`,
      {
        type: 'order_confirmation',
        orderId: orderNumber
      }
    );
  }

  async sendOrderReady(deviceToken, restaurantName) {
    return this.sendToDevice(
      deviceToken,
      'Order Ready',
      `Your order from ${restaurantName} is ready for pickup!`,
      {
        type: 'order_ready'
      }
    );
  }

  async sendDeliveryUpdate(deviceToken, status, eta) {
    return this.sendToDevice(
      deviceToken,
      'Delivery Update',
      `Your order is ${status}. ETA: ${eta} minutes`,
      {
        type: 'delivery_update',
        status,
        eta
      }
    );
  }

  async sendOrderDelivered(deviceToken) {
    return this.sendToDevice(
      deviceToken,
      'Order Delivered',
      'Your order has been delivered. Enjoy your meal!',
      {
        type: 'order_delivered'
      }
    );
  }
}

module.exports = new NotificationService();
