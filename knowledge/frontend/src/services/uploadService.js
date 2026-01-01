/**
 * Upload Service - Handle image uploads to backend
 */
import api from './api';
import { Platform } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const uploadService = {
    /**
     * Upload image using base64 encoding
     * @param {string} base64 - Base64 encoded image (with or without data URI prefix)
     * @param {string} entityType - 'menuItem' or 'restaurant'
     * @param {string} entityId - ID of the menu item or restaurant
     * @param {string} type - For restaurants: 'logo' or 'banner' (optional)
     * @returns {Promise<{imageUrl: string}>}
     */
    uploadImage: async (base64, entityType, entityId, type = 'logo') => {
        const response = await api.post('/uploads/base64', {
            base64,
            entityType,
            entityId,
            type
        });
        return response.data;
    },

    /**
     * Upload menu item image
     */
    uploadMenuItemImage: async (base64, menuItemId) => {
        return uploadService.uploadImage(base64, 'menuItem', menuItemId);
    },

    /**
     * Upload restaurant logo
     */
    uploadRestaurantLogo: async (base64, restaurantId) => {
        return uploadService.uploadImage(base64, 'restaurant', restaurantId, 'logo');
    },

    /**
     * Upload restaurant banner
     */
    uploadRestaurantBanner: async (base64, restaurantId) => {
        return uploadService.uploadImage(base64, 'restaurant', restaurantId, 'banner');
    },

    /**
     * Get full URL for an uploaded image
     * @param {string} imageUrl - Relative or absolute URL
     * @returns {string} Full URL for the image
     */
    getImageUrl: (imageUrl) => {
        if (!imageUrl) return null;

        // Already a full URL
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }

        // Local upload - prepend base URL
        if (imageUrl.startsWith('/uploads/')) {
            return `${API_BASE_URL}${imageUrl}`;
        }

        return imageUrl;
    },

    /**
     * Convert local file URI to base64
     * Works for both web and native platforms
     */
    fileToBase64: async (uri) => {
        // For web
        if (Platform.OS === 'web') {
            const response = await fetch(uri);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }

        // For React Native - we'll use Expo FileSystem if available
        // Otherwise fall back to fetch + base64 conversion
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error converting file to base64:', error);
            throw error;
        }
    }
};

export default uploadService;
