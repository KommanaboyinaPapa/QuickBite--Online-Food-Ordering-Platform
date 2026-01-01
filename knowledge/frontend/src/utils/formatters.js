/**
 * Formatters - Data formatting utilities for display
 */

import moment from 'moment';

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = '₹') => {
  if (!amount && amount !== 0) return `${currency}0.00`;
  return `${currency}${parseFloat(amount).toFixed(2)}`;
};

/**
 * Format time to HH:MM format
 */
export const formatTime = (date) => {
  return moment(date).format('HH:mm');
};

/**
 * Format date to readable format
 */
export const formatDate = (date, format = 'DD MMM YYYY') => {
  return moment(date).format(format);
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  return moment(date).fromNow();
};

/**
 * Format address object to single line
 */
export const formatAddress = (address) => {
  if (!address) return '';
  const { street, city, postalCode } = address;
  return `${street}, ${city} ${postalCode}`.trim();
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  // Remove non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return phone;
};

/**
 * Format rating with stars
 */
export const formatRating = (rating) => {
  if (!rating) return 'N/A';
  return `★ ${parseFloat(rating).toFixed(1)}`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format order number
 */
export const formatOrderNumber = (orderNumber) => {
  if (!orderNumber) return '';
  return `#${orderNumber}`;
};

/**
 * Format distance in km with proper decimal places
 */
export const formatDistance = (distance) => {
  if (!distance && distance !== 0) return '0 km';
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)} m`;
  }
  return `${parseFloat(distance).toFixed(1)} km`;
};

/**
 * Format delivery time
 */
export const formatDeliveryTime = (minutes) => {
  if (!minutes) return '';
  if (minutes < 60) {
    return `${minutes} mins`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

/**
 * Format percentage
 */
export const formatPercentage = (value) => {
  if (!value && value !== 0) return '0%';
  return `${parseFloat(value).toFixed(1)}%`;
};

/**
 * Format health score
 */
export const formatHealthScore = (score) => {
  if (!score && score !== 0) return 'N/A';
  return `${parseFloat(score).toFixed(1)}/10`;
};

/**
 * Capitalize first letter of word
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Format allergen string
 */
export const formatAllergen = (allergen) => {
  const allergenNames = {
    peanuts: 'Peanuts',
    tree_nuts: 'Tree Nuts',
    dairy: 'Dairy',
    eggs: 'Eggs',
    shellfish: 'Shellfish',
    fish: 'Fish',
    soy: 'Soy',
    wheat: 'Wheat',
    sesame: 'Sesame',
    mustard: 'Mustard',
  };
  
  return allergenNames[allergen] || capitalize(allergen);
};

/**
 * Format cart total with breakdown
 */
export const formatOrderSummary = (cart) => {
  return {
    items: cart.items?.length || 0,
    subtotal: formatCurrency(cart.subtotal),
    tax: formatCurrency(cart.tax),
    delivery: formatCurrency(cart.deliveryFee),
    discount: formatCurrency(cart.discount),
    total: formatCurrency(cart.total),
  };
};

export default {
  formatCurrency,
  formatTime,
  formatDate,
  formatRelativeTime,
  formatAddress,
  formatPhoneNumber,
  formatRating,
  truncateText,
  formatOrderNumber,
  formatDistance,
  formatDeliveryTime,
  formatPercentage,
  formatHealthScore,
  capitalize,
  formatAllergen,
};
