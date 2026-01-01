/**
 * Payment Service - Payment processing API calls
 */

import apiClient from './api';

const PAYMENT_ENDPOINT = '/payments';

export const paymentService = {
  /**
   * Get available payment methods for user
   */
  getPaymentMethods: async () => {
    const response = await apiClient.get(`${PAYMENT_ENDPOINT}/methods`);
    return response.data;
  },

  /**
   * Initiate payment for order
   */
  initiatePayment: async (orderId, paymentData) => {
    const response = await apiClient.post(`${PAYMENT_ENDPOINT}/initiate/${orderId}`, paymentData);
    return response.data;
  },

  /**
   * Verify payment signature from Razorpay
   */
  verifyPayment: async (paymentData) => {
    const response = await apiClient.post(`${PAYMENT_ENDPOINT}/verify`, paymentData);
    return response.data;
  },

  /**
   * Get payment status
   */
  getPaymentStatus: async (paymentId) => {
    const response = await apiClient.get(`${PAYMENT_ENDPOINT}/${paymentId}/status`);
    return response.data;
  },

  /**
   * Refund payment
   */
  refundPayment: async (paymentId, reason = '') => {
    const response = await apiClient.post(`${PAYMENT_ENDPOINT}/${paymentId}/refund`, { reason });
    return response.data;
  },

  /**
   * Save payment method
   */
  savePaymentMethod: async (methodData) => {
    const response = await apiClient.post(`${PAYMENT_ENDPOINT}/methods/save`, methodData);
    return response.data;
  },

  /**
   * Delete saved payment method
   */
  deletePaymentMethod: async (methodId) => {
    const response = await apiClient.delete(`${PAYMENT_ENDPOINT}/methods/${methodId}`);
    return response.data;
  },

  /**
   * Get payment history
   */
  getPaymentHistory: async (filters = {}) => {
    const response = await apiClient.get(`${PAYMENT_ENDPOINT}/history`, { params: filters });
    return response.data;
  },
};

export default paymentService;
