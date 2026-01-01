// backend/src/routes/review.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const {
  createReview,
  getRestaurantReviews,
  getOrderReview,
  updateReview,
  deleteReview
} = require('../controllers/review.controller');
const { validateRequest } = require('../middleware/validateRequest.middleware');

// Public routes
router.get('/restaurant/:restaurantId', getRestaurantReviews);

// Protected routes
router.use(authMiddleware);
router.post('/:orderId', createReview);
router.get('/:orderId', getOrderReview);
router.put('/:reviewId', updateReview);
router.delete('/:reviewId', deleteReview);

module.exports = router;
