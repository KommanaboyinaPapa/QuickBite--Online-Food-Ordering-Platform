// backend/src/utils/jwt.handler.js
const jwt = require('jsonwebtoken');
const logger = require('./logger');

const generateTokens = (userId, userType) => {
  try {
    const accessToken = jwt.sign(
      { userId, userType },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    const refreshToken = jwt.sign(
      { userId, userType },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE }
    );

    return { accessToken, refreshToken };
  } catch (error) {
    logger.error('Token generation error:', error);
    throw error;
  }
};

const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    logger.error('Token verification error:', error);
    throw error;
  }
};

module.exports = { generateTokens, verifyToken };
