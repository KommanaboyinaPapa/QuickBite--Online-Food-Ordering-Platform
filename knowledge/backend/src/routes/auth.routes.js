// backend/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const { register, login, refreshToken, logout, sendOTP, verifyOTP } = require('../controllers/auth.controller');
const { validateRequest } = require('../middleware/validateRequest.middleware');
const { userRegistrationSchema, loginSchema } = require('../utils/validators');

// Public routes
router.post('/register', validateRequest(userRegistrationSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/refresh-token', refreshToken);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

// Protected routes
router.post('/logout', authMiddleware, logout);

module.exports = router;
