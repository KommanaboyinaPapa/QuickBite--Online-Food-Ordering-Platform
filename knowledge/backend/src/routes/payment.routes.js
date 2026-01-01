// backend/src/routes/payment.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const {
  initiatePayment,
  verifyPayment,
  getPaymentStatus,
  getPaymentMethods
} = require('../controllers/payment.controller');
const { validateRequest } = require('../middleware/validateRequest.middleware');

// Public route
router.get('/methods', getPaymentMethods);

// Protected routes
router.use(authMiddleware);
router.post('/initiate/:orderId', initiatePayment);
router.post('/verify', verifyPayment);
router.get('/:orderId', getPaymentStatus);

module.exports = router;
