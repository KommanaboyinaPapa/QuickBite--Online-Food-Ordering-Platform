/**
 * Upload Routes - File upload endpoints
 */
const express = require('express');
const router = express.Router();
const { authMiddleware, roleCheck } = require('../middleware/auth.middleware');
const {
    uploadMenuItemImage,
    uploadRestaurantImage,
    uploadBase64Image
} = require('../controllers/upload.controller');

// All routes require authentication and restaurant owner role
router.use(authMiddleware);
router.use(roleCheck('restaurant'));

// Base64 upload (recommended for React Native)
router.post('/base64', uploadBase64Image);

// Direct file upload for menu item (when using multer)
router.post('/menu/:menuItemId', uploadMenuItemImage);

// Direct file upload for restaurant (when using multer)
router.post('/restaurant/:restaurantId', uploadRestaurantImage);

module.exports = router;
