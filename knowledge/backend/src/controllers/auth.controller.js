// backend/src/controllers/auth.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { hashPassword, comparePassword, generateOrderNumber } = require('../utils/helpers');
const { generateTokens } = require('../utils/jwt.handler');
const logger = require('../utils/logger');

const register = async (req, res, next) => {
  try {
    console.log('🚀 Backend: POST /auth/register received');
    console.log('🚀 Backend: Request body:', req.body);

    const { email, phone, password, firstName, lastName, userType } = req.body;

    // Validate input
    if (!email || !phone || !password || !firstName || !lastName) {
      console.log('❌ Backend: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, phone, password, firstName, lastName'
      });
    }

    console.log('✅ Backend: All required fields present');

    // Check if user exists
    console.log('🔍 Backend: Checking if user exists with email');
    let existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      console.log('❌ Backend: User already exists (email)');
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    console.log('🔍 Backend: Checking if user exists with phone');
    existingUser = await prisma.user.findUnique({ where: { phone } });

    if (existingUser) {
      console.log('❌ Backend: User already exists (phone)');
      return res.status(409).json({
        success: false,
        message: 'User with this phone already exists'
      });
    }

    console.log('✅ Backend: User does not exist, creating new user');

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        passwordHash,
        firstName,
        lastName,
        userType: userType || 'customer',
        allergyProfile: (userType || 'customer') === 'customer' ? { create: {} } : undefined
      }
    });

    console.log('✅ Backend: User created:', user.id);

    // Generate tokens
    const tokens = generateTokens(user.id, user.userType);
    console.log('✅ Backend: Tokens generated');

    logger.info(`User registered: ${user.id}`);

    const responseData = {
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType
        },
        tokens
      }
    };

    console.log('📤 Backend: Sending response:', responseData);
    res.status(201).json(responseData);
  } catch (error) {
    console.error('🚨 Backend: Registration error:', error);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    // Generate tokens
    const tokens = generateTokens(user.id, user.userType);

    logger.info(`User logged in: ${user.id}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType
        },
        tokens
      }
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const { verifyToken } = require('../utils/jwt.handler');
    const decoded = verifyToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    const tokens = generateTokens(user.id, user.userType);

    res.status(200).json({
      success: true,
      message: 'Token refreshed',
      data: { tokens }
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // In a production app, you might want to invalidate tokens using Redis
    logger.info(`User logged out: ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

const sendOTP = async (req, res, next) => {
  try {
    const { phone } = req.body;

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // TODO: Send OTP via Fast2SMS
    // For now, log it
    logger.info(`OTP sent to ${phone}: ${otp}`);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      // Remove in production
      data: { otp }
    });
  } catch (error) {
    next(error);
  }
};

const verifyOTP = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    // TODO: Verify OTP from Redis storage
    // For now, accept any OTP for demo

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  sendOTP,
  verifyOTP
};
