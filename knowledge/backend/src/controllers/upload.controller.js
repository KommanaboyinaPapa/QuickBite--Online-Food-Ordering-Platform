/**
 * Upload Controller - Handle file uploads for restaurant images
 */
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
const menuImagesDir = path.join(uploadsDir, 'menu');
const restaurantImagesDir = path.join(uploadsDir, 'restaurants');

[uploadsDir, menuImagesDir, restaurantImagesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

/**
 * Upload menu item image
 */
const uploadMenuItemImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const { menuItemId } = req.params;

        // Verify ownership
        const menuItem = await prisma.menuItem.findUnique({
            where: { id: menuItemId },
            include: { restaurant: true }
        });

        if (!menuItem) {
            // Delete uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        if (menuItem.restaurant.ownerId !== req.user.id) {
            fs.unlinkSync(req.file.path);
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Generate image URL
        const imageUrl = `/uploads/menu/${req.file.filename}`;

        // Update menu item
        const updated = await prisma.menuItem.update({
            where: { id: menuItemId },
            data: { imageUrl }
        });

        // Delete old image if exists and is a local file
        if (menuItem.imageUrl && menuItem.imageUrl.startsWith('/uploads/')) {
            const oldPath = path.join(__dirname, '../..', menuItem.imageUrl);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        logger.info(`Menu item image uploaded: ${menuItemId}`);

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                imageUrl,
                menuItem: updated
            }
        });
    } catch (error) {
        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
};

/**
 * Upload restaurant image (logo/banner)
 */
const uploadRestaurantImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const { restaurantId } = req.params;
        const { type = 'logo' } = req.body; // 'logo' or 'banner'

        // Verify ownership
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId }
        });

        if (!restaurant) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        if (restaurant.ownerId !== req.user.id) {
            fs.unlinkSync(req.file.path);
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Generate image URL
        const imageUrl = `/uploads/restaurants/${req.file.filename}`;

        // Update restaurant
        const updateData = type === 'banner'
            ? { bannerUrl: imageUrl }
            : { logoUrl: imageUrl };

        const updated = await prisma.restaurant.update({
            where: { id: restaurantId },
            data: updateData
        });

        // Delete old image if exists
        const oldUrl = type === 'banner' ? restaurant.bannerUrl : restaurant.logoUrl;
        if (oldUrl && oldUrl.startsWith('/uploads/')) {
            const oldPath = path.join(__dirname, '../..', oldUrl);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        logger.info(`Restaurant ${type} image uploaded: ${restaurantId}`);

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                imageUrl,
                type,
                restaurant: updated
            }
        });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
};

/**
 * Upload image via base64 (for React Native compatibility)
 */
const uploadBase64Image = async (req, res, next) => {
    try {
        const { base64, filename, type, entityId, entityType } = req.body;

        if (!base64 || !entityId || !entityType) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: base64, entityId, entityType'
            });
        }

        // Validate entity type
        if (!['menuItem', 'restaurant'].includes(entityType)) {
            return res.status(400).json({
                success: false,
                message: 'entityType must be "menuItem" or "restaurant"'
            });
        }

        // Decode base64 - support data URI or raw base64
        let imageData = base64;
        let extension = 'jpg';

        if (base64.startsWith('data:image/')) {
            const matches = base64.match(/^data:image\/(\w+);base64,(.+)$/);
            if (matches) {
                extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
                imageData = matches[2];
            }
        }

        const buffer = Buffer.from(imageData, 'base64');

        // Verify ownership based on entity type
        if (entityType === 'menuItem') {
            const menuItem = await prisma.menuItem.findUnique({
                where: { id: entityId },
                include: { restaurant: true }
            });

            if (!menuItem) {
                return res.status(404).json({ success: false, message: 'Menu item not found' });
            }
            if (menuItem.restaurant.ownerId !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }

            // Generate filename and save
            const newFilename = `menu_${entityId}_${Date.now()}.${extension}`;
            const filePath = path.join(menuImagesDir, newFilename);
            fs.writeFileSync(filePath, buffer);

            const imageUrl = `/uploads/menu/${newFilename}`;

            // Delete old image
            if (menuItem.imageUrl && menuItem.imageUrl.startsWith('/uploads/')) {
                const oldPath = path.join(__dirname, '../..', menuItem.imageUrl);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }

            await prisma.menuItem.update({
                where: { id: entityId },
                data: { imageUrl }
            });

            logger.info(`Menu item base64 image uploaded: ${entityId}`);

            return res.status(200).json({
                success: true,
                message: 'Image uploaded successfully',
                data: { imageUrl }
            });

        } else if (entityType === 'restaurant') {
            const restaurant = await prisma.restaurant.findUnique({
                where: { id: entityId }
            });

            if (!restaurant) {
                return res.status(404).json({ success: false, message: 'Restaurant not found' });
            }
            if (restaurant.ownerId !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }

            const imageType = type || 'logo';
            const newFilename = `rest_${entityId}_${imageType}_${Date.now()}.${extension}`;
            const filePath = path.join(restaurantImagesDir, newFilename);
            fs.writeFileSync(filePath, buffer);

            const imageUrl = `/uploads/restaurants/${newFilename}`;

            // Delete old image
            const oldUrl = imageType === 'banner' ? restaurant.bannerUrl : restaurant.logoUrl;
            if (oldUrl && oldUrl.startsWith('/uploads/')) {
                const oldPath = path.join(__dirname, '../..', oldUrl);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }

            const updateData = imageType === 'banner'
                ? { bannerUrl: imageUrl }
                : { logoUrl: imageUrl };

            await prisma.restaurant.update({
                where: { id: entityId },
                data: updateData
            });

            logger.info(`Restaurant ${imageType} base64 image uploaded: ${entityId}`);

            return res.status(200).json({
                success: true,
                message: 'Image uploaded successfully',
                data: { imageUrl, type: imageType }
            });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    uploadMenuItemImage,
    uploadRestaurantImage,
    uploadBase64Image
};
