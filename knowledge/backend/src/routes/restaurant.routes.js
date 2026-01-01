// backend/src/routes/restaurant.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, roleCheck } = require('../middleware/auth.middleware');
const {
  listRestaurants,
  getRestaurantDetails,
  searchRestaurants,
  createRestaurant,
  updateRestaurant,
  getRestaurantStats,
  getNearbyRestaurants,
  getRestaurantMenu,
  getMyRestaurant
} = require('../controllers/restaurant.controller');

// Protected routes (restaurant owner only)
router.get('/my', authMiddleware, roleCheck('restaurant'), getMyRestaurant);
router.post('/', authMiddleware, roleCheck('restaurant'), createRestaurant);
router.put('/:id', authMiddleware, roleCheck('restaurant'), updateRestaurant);
router.get('/:id/stats', authMiddleware, roleCheck('restaurant'), getRestaurantStats);

// Public routes
router.get('/', listRestaurants);
router.get('/nearby', getNearbyRestaurants);
router.get('/search', searchRestaurants);
router.get('/:id', getRestaurantDetails);
router.get('/:id/menu', getRestaurantMenu);

module.exports = router;
