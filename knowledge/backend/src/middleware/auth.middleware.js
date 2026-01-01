// backend/src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.userId,
      userType: decoded.userType
    };
    next();
  } catch (error) {
    logger.error('Auth error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    next();
  };
};

module.exports = { authMiddleware, roleCheck };
