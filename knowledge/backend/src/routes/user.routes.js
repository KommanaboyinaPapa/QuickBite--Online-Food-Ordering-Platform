// backend/src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const { 
  getProfile, 
  updateProfile, 
  getAddresses, 
  addAddress, 
  updateAddress, 
  deleteAddress, 
  getAllergies, 
  updateAllergies 
} = require('../controllers/user.controller');
const { validateRequest } = require('../middleware/validateRequest.middleware');
const { addressSchema, allergySchema } = require('../utils/validators');

// All routes protected
router.use(authMiddleware);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Address routes
router.get('/addresses', getAddresses);
router.post('/addresses', validateRequest(addressSchema), addAddress);
router.put('/addresses/:id', validateRequest(addressSchema), updateAddress);
router.delete('/addresses/:id', deleteAddress);

// Allergy routes
router.get('/allergies', getAllergies);
router.put('/allergies', validateRequest(allergySchema), updateAllergies);

module.exports = router;
