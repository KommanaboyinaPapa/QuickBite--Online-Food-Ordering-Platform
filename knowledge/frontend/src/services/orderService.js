/**
 * Order Service - Order and cart API calls
 */

import apiClient from './api';

// API responses wrap data under `data`; unwrap for ease of use
const unwrap = (response) => response?.data?.data ?? response?.data;

const ORDER_ENDPOINT = '/orders';
const CART_ENDPOINT = '/cart';

export const orderService = {
  /**
   * Get current cart
   */
  getCart: async () => {
    const response = await apiClient.get(CART_ENDPOINT);
    return unwrap(response);
  },

  /**
   * Add item to cart
   */
  addToCart: async (cartData) => {
    const response = await apiClient.post(`${CART_ENDPOINT}/items`, cartData);
    return unwrap(response);
  },

  /**
   * Update cart item quantity
   */
  updateCartItem: async (itemId, quantity) => {
    const response = await apiClient.put(`${CART_ENDPOINT}/items/${itemId}`, { quantity });
    return unwrap(response);
  },

  /**
   * Replace exclusions for a cart item
   */
  setItemExclusions: async (itemId, ingredientIds = []) => {
    const response = await apiClient.put(`${CART_ENDPOINT}/items/${itemId}/exclusions`, {
      ingredientIds,
    });
    return unwrap(response);
  },

  /**
   * Add ingredient exclusion to cart item
   */
  addExclusion: async (itemId, ingredientId) => {
    const response = await apiClient.post(`${CART_ENDPOINT}/items/${itemId}/exclusions`, {
      ingredientId,
    });
    return unwrap(response);
  },

  /**
   * Remove ingredient exclusion from cart item
   */
  removeExclusion: async (itemId, ingredientId) => {
    const response = await apiClient.delete(
      `${CART_ENDPOINT}/items/${itemId}/exclusions/${ingredientId}`
    );
    return unwrap(response);
  },

  /**
   * Remove item from cart
   */
  removeFromCart: async (itemId) => {
    const response = await apiClient.delete(`${CART_ENDPOINT}/items/${itemId}`);
    return unwrap(response);
  },

  /**
   * Clear entire cart
   */
  clearCart: async () => {
    const response = await apiClient.delete(CART_ENDPOINT);
    return unwrap(response);
  },

  /**
   * Create order from cart
   */
  createOrder: async (orderData) => {
    const response = await apiClient.post(ORDER_ENDPOINT, orderData);
    return unwrap(response);
  },

  /**
   * Get user orders with filters
   */
  getOrders: async (filters = {}) => {
    const response = await apiClient.get(ORDER_ENDPOINT, { params: filters });
    return unwrap(response);
  },

  /**
   * Get specific order details
   */
  getOrderDetails: async (orderId) => {
    const response = await apiClient.get(`${ORDER_ENDPOINT}/${orderId}`);
    return unwrap(response);
  },

  /**
   * Get order tracking information
   */
  getOrderTracking: async (orderId) => {
    const response = await apiClient.get(`${ORDER_ENDPOINT}/${orderId}/tracking`);
    return unwrap(response);
  },

  // Alias for hooks expecting trackOrder
  trackOrder: async (orderId) => {
    const response = await apiClient.get(`${ORDER_ENDPOINT}/${orderId}/tracking`);
    return unwrap(response);
  },

  /**
   * Cancel order
   */
  cancelOrder: async (orderId, reason = '') => {
    const response = await apiClient.put(`${ORDER_ENDPOINT}/${orderId}/cancel`, { reason });
    return unwrap(response);
  },

  /**
   * Update special instructions for order
   */
  updateSpecialInstructions: async (orderId, instructions) => {
    const response = await apiClient.put(`${ORDER_ENDPOINT}/${orderId}/instructions`, {
      instructions,
    });
    return unwrap(response);
  },

  /**
   * Validate cart for allergies
   */
  validateCart: async () => {
    const response = await apiClient.get(`${CART_ENDPOINT}/validate`);
    return unwrap(response);
  },

  // Role-specific methods
  getRestaurantOrders: async (status) => {
    const params = status ? { status } : {};
    const response = await apiClient.get(`${ORDER_ENDPOINT}/restaurant`, { params });
    return unwrap(response);
  },

  getDeliveryAgentOrders: async (status) => {
    const params = status ? { status } : {};
    const response = await apiClient.get(`${ORDER_ENDPOINT}/delivery-agent`, { params });
    return unwrap(response);
  },

  getAvailableOrders: async () => {
    const response = await apiClient.get(`${ORDER_ENDPOINT}/available`);
    return unwrap(response);
  },

  acceptDelivery: async (orderId) => {
    const response = await apiClient.post(`${ORDER_ENDPOINT}/${orderId}/accept`);
    return unwrap(response);
  },

  updateDeliveryLocation: async (orderId, coords) => {
    const response = await apiClient.put(`/tracking/${orderId}/location`, coords);
    return unwrap(response);
  },

  updateOrderStatus: async (orderId, status) => {
    const response = await apiClient.put(`${ORDER_ENDPOINT}/${orderId}/status`, { status });
    return unwrap(response);
  },

  // Placeholder for submitReview if/when backend supports it
  submitReview: async (orderId, payload) => {
    const response = await apiClient.post(`${ORDER_ENDPOINT}/${orderId}/review`, payload);
    return unwrap(response);
  },
};

export default orderService;
