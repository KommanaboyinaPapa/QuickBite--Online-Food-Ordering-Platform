/**
 * Helpers - General utility functions
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Estimate delivery time based on distance and speed
 */
export const estimateDeliveryTime = (distanceKm, speedKmh = 30) => {
  const timeHours = distanceKm / speedKmh;
  const timeMinutes = Math.round(timeHours * 60);
  return Math.max(15, timeMinutes); // Minimum 15 minutes
};

/**
 * Calculate order total with tax and delivery fee
 */
export const calculateOrderTotal = (subtotal, tax = 0, deliveryFee = 0, discount = 0) => {
  const total = subtotal + tax + deliveryFee - discount;
  return Math.max(0, total);
};

/**
 * Calculate tax based on subtotal
 */
export const calculateTax = (subtotal, taxPercentage = 5) => {
  return (subtotal * taxPercentage) / 100;
};

/**
 * Get initials from name
 */
export const getInitials = (firstName, lastName) => {
  const first = firstName?.charAt(0).toUpperCase() || '';
  const last = lastName?.charAt(0).toUpperCase() || '';
  return `${first}${last}`;
};

/**
 * Generate random color for avatar
 */
export const generateAvatarColor = (seed) => {
  const colors = [
    '#FF6B35',
    '#004E89',
    '#F7D60D',
    '#2ECC71',
    '#F39C12',
    '#E74C3C',
    '#3498DB',
    '#9B59B6',
    '#1ABC9C',
    '#E67E22',
  ];
  return colors[seed % colors.length];
};

/**
 * Retry async function with exponential backoff
 */
export const retryAsync = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError;
};

/**
 * Debounce function
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;

  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function
 */
export const throttle = (func, limit = 1000) => {
  let inThrottle;

  return function throttled(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Check if email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if phone number is valid (Indian format)
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone?.replace(/\D/g, ''));
};

/**
 * Deep merge objects
 */
export const mergeDeep = (target, source) => {
  const output = Object.assign({}, target);

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }

  return output;
};

/**
 * Check if value is object
 */
export const isObject = (item) => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

/**
 * Sleep for specified milliseconds
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Generate unique ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Group array by property
 */
export const groupBy = (array, property) => {
  return array.reduce((groups, item) => {
    const key = item[property];
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
};

/**
 * Sort array by property
 */
export const sortBy = (array, property, ascending = true) => {
  return [...array].sort((a, b) => {
    if (a[property] < b[property]) return ascending ? -1 : 1;
    if (a[property] > b[property]) return ascending ? 1 : -1;
    return 0;
  });
};

export default {
  calculateDistance,
  estimateDeliveryTime,
  calculateOrderTotal,
  calculateTax,
  getInitials,
  generateAvatarColor,
  retryAsync,
  debounce,
  throttle,
  isValidEmail,
  isValidPhone,
  mergeDeep,
  isObject,
  sleep,
  generateId,
  groupBy,
  sortBy,
};
