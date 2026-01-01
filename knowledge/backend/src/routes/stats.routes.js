// backend/src/routes/stats.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const {
    getRestaurantStats,
    getDeliveryAgentStats
} = require('../controllers/stats.controller');

// All routes require authentication
router.use(authMiddleware);

// Restaurant owner stats
router.get('/restaurant', getRestaurantStats);

// Delivery agent stats
router.get('/delivery', getDeliveryAgentStats);

module.exports = router;
