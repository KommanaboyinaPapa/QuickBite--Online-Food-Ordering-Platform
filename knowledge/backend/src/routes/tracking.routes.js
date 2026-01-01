// backend/src/routes/tracking.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const {
  getOrderTracking,
  updateDeliveryLocation,
  getDeliveryStatus,
  estimateArrival
} = require('../controllers/tracking.controller');

// Protected routes
router.use(authMiddleware);

router.get('/:orderId', getOrderTracking);
router.get('/:orderId/status', getDeliveryStatus);
router.get('/:orderId/eta', estimateArrival);
router.put('/:orderId/location', updateDeliveryLocation);

module.exports = router;
