// backend/src/routes/cart.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  addExclusions,
  setExclusions,
  removeExclusions
} = require('../controllers/cart.controller');

// All routes protected
router.use(authMiddleware);

// Cart operations
router.get('/', getCart);
router.post('/items', addToCart);
router.put('/items/:itemId', updateCartItem);
router.delete('/items/:itemId', removeFromCart);
router.delete('/', clearCart);

// Exclusions management
router.post('/items/:itemId/exclusions', addExclusions);
router.put('/items/:itemId/exclusions', setExclusions);
router.delete('/items/:itemId/exclusions/:ingredientId', removeExclusions);

module.exports = router;
