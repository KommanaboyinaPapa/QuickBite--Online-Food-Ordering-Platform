// backend/src/routes/order.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, roleCheck } = require('../middleware/auth.middleware');
const {
  createOrder,
  getOrders,
  getOrderDetails,
  updateOrderStatus,
  cancelOrder,
  getRestaurantOrders,
  getDeliveryAgentOrders,
  getAvailableOrders,
  acceptDelivery
} = require('../controllers/order.controller');
const { validateRequest } = require('../middleware/validateRequest.middleware');
const { orderSchema } = require('../utils/validators');

// Specific routes (MUST be before /:id)
// Restaurant routes
router.get('/restaurant', authMiddleware, roleCheck('restaurant'), getRestaurantOrders);
// Delivery Agent routes
router.get('/available', authMiddleware, roleCheck('delivery_agent'), getAvailableOrders);
router.get('/delivery-agent', authMiddleware, roleCheck('delivery_agent'), getDeliveryAgentOrders); // mapped to /agent/orders -> /delivery-agent in service
router.post('/:id/accept', authMiddleware, roleCheck('delivery_agent'), acceptDelivery);

// Customer routes (and general ID routes)
router.post('/', authMiddleware, validateRequest(orderSchema), createOrder);
router.get('/', authMiddleware, getOrders);
// Generic ID routes
router.get('/:id', authMiddleware, getOrderDetails);
router.put('/:id/cancel', authMiddleware, cancelOrder);
router.put('/:id/status', authMiddleware, roleCheck(['restaurant', 'delivery_agent']), updateOrderStatus);

module.exports = router;
