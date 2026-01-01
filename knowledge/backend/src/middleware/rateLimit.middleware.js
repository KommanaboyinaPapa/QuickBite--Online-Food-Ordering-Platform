// backend/src/middleware/rateLimit.middleware.js
const rateLimit = require('express-rate-limit');

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 10000 : 100, // 10,000 requests in dev, 100 in production
  message: 'Too many requests from this IP, please try again later.',
  skip: isDevelopment ? () => false : undefined // In dev, still apply but with high limit
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 1000 : 5, // 1,000 in dev, 5 in production
  skipSuccessfulRequests: true
});

module.exports = { limiter, authLimiter };
