// backend/src/routes/menu.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, roleCheck } = require('../middleware/auth.middleware');
const {
  getMenuByRestaurant,
  getMenuItemDetails,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuCategories
} = require('../controllers/menu.controller');
const { validateRequest } = require('../middleware/validateRequest.middleware');
const { menuItemSchema } = require('../utils/validators');

// Public routes
router.get('/restaurant/:restaurantId', getMenuByRestaurant);
router.get('/restaurant/:restaurantId/categories', getMenuCategories);
router.get('/:id', getMenuItemDetails);

// Protected routes (restaurant owner only)
router.post('/', authMiddleware, roleCheck('restaurant'), validateRequest(menuItemSchema), createMenuItem);
router.put('/:id', authMiddleware, roleCheck('restaurant'), validateRequest(menuItemSchema), updateMenuItem);
router.delete('/:id', authMiddleware, roleCheck('restaurant'), deleteMenuItem);

module.exports = router;
