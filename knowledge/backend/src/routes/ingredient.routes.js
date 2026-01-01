// backend/src/routes/ingredient.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, roleCheck } = require('../middleware/auth.middleware');
const {
  getRestaurantIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  getAllergenTypes
} = require('../controllers/ingredient.controller');

// Public route
router.get('/allergens', getAllergenTypes);

// Protected routes (restaurant owner only)
router.get('/restaurant/:restaurantId', getRestaurantIngredients);
router.post('/', authMiddleware, roleCheck('restaurant'), createIngredient);
router.put('/:id', authMiddleware, roleCheck('restaurant'), updateIngredient);
router.delete('/:id', authMiddleware, roleCheck('restaurant'), deleteIngredient);

module.exports = router;
