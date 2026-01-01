/**
 * Constants - App-wide constants and configuration values
 */

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000';
export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';
export const RAZORPAY_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '';
export const ENVIRONMENT = process.env.EXPO_PUBLIC_ENVIRONMENT || 'development';

/**
 * User roles
 */
export const USER_ROLES = {
  CUSTOMER: 'customer',
  RESTAURANT: 'restaurant',
  DELIVERY_AGENT: 'delivery_agent',
};

/**
 * Order status
 */
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  PICKED_UP: 'picked_up',
  IN_DELIVERY: 'in_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

/**
 * Payment methods
 */
export const PAYMENT_METHODS = {
  CARD: 'card',
  WALLET: 'wallet',
  UPI: 'upi',
  CASH: 'cash',
  RAZORPAY: 'razorpay',
};

/**
 * Payment status
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

/**
 * Address types
 */
export const ADDRESS_TYPES = {
  HOME: 'home',
  WORK: 'work',
  OTHER: 'other',
};

/**
 * Allergen types
 */
export const ALLERGENS = {
  PEANUTS: 'peanuts',
  TREE_NUTS: 'tree_nuts',
  DAIRY: 'dairy',
  EGGS: 'eggs',
  SHELLFISH: 'shellfish',
  FISH: 'fish',
  SOY: 'soy',
  WHEAT: 'wheat',
  SESAME: 'sesame',
  MUSTARD: 'mustard',
};

/**
 * Dietary restrictions
 */
export const DIETARY_RESTRICTIONS = {
  VEGETARIAN: 'vegetarian',
  VEGAN: 'vegan',
  GLUTEN_FREE: 'gluten_free',
  DAIRY_FREE: 'dairy_free',
  KETO: 'keto',
  PALEO: 'paleo',
};

/**
 * Spice levels
 */
export const SPICE_LEVELS = {
  MILD: 'mild',
  MEDIUM: 'medium',
  SPICY: 'spicy',
  VERY_SPICY: 'very_spicy',
};

/**
 * Health conditions
 */
export const HEALTH_CONDITIONS = {
  DIABETES: 'diabetes',
  HYPERTENSION: 'hypertension',
  HEART_DISEASE: 'heart_disease',
  OBESITY: 'obesity',
  CELIAC: 'celiac',
};

/**
 * Tracking status
 */
export const TRACKING_STATUS = {
  RESTAURANT_TO_CUSTOMER: 'restaurant_to_customer',
  COMPLETED: 'completed',
};

/**
 * API timeout in milliseconds
 */
export const API_TIMEOUT = 30000;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  LIMIT: 20,
  DEFAULT_PAGE: 1,
};

/**
 * Cache durations in milliseconds
 */
export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000,      // 5 minutes
  MEDIUM: 30 * 60 * 1000,    // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
};

/**
 * Map defaults
 */
export const MAP_DEFAULTS = {
  ZOOM_LEVEL: 14,
  NEARBY_RADIUS: 5,
};

/**
 * Voice input settings
 */
export const VOICE_SETTINGS = {
  LANGUAGE: 'en-IN',
  TIMEOUT: 10000,
};

export default {
  API_URL,
  SOCKET_URL,
  GOOGLE_MAPS_API_KEY,
  RAZORPAY_KEY_ID,
  USER_ROLES,
  ORDER_STATUS,
  PAYMENT_METHODS,
  ALLERGENS,
  DIETARY_RESTRICTIONS,
};
