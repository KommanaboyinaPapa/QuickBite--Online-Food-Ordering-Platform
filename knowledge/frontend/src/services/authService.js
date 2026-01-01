/**
 * Auth Service - Authentication API calls
 */

import apiClient from './api';

const AUTH_ENDPOINT = '/auth';

const authService = {
  /**
   * Register new user
   */
  register: async (userData) => {
    try {
      console.log('📡 Auth Service: Sending POST to /auth/register with:', userData);
      const response = await apiClient.post(`${AUTH_ENDPOINT}/register`, userData);
      console.log('📡 Auth Service: Register response:', response);
      return response.data;
    } catch (error) {
      console.error('🚨 Auth Service: Register error:', error.message);
      console.error('🚨 Auth Service: Error status:', error.response?.status);
      console.error('🚨 Auth Service: Error data:', error.response?.data);
      throw error;
    }
  },

  /**
   * Login user
   */
  login: async (credentials) => {
    const response = await apiClient.post(`${AUTH_ENDPOINT}/login`, credentials);
    return response.data;
  },

  /**
   * Send OTP to phone
   */
  sendOTP: async (phone) => {
    const response = await apiClient.post(`${AUTH_ENDPOINT}/send-otp`, { phone });
    return response.data;
  },

  /**
   * Verify OTP
   */
  verifyOTP: async (phone, otp) => {
    const response = await apiClient.post(`${AUTH_ENDPOINT}/verify-otp`, { phone, otp });
    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken) => {
    const response = await apiClient.post(`${AUTH_ENDPOINT}/refresh-token`, { refreshToken });
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async () => {
    const response = await apiClient.post(`${AUTH_ENDPOINT}/logout`);
    return response.data;
  },

  /**
   * Forgot password - send reset link
   */
  forgotPassword: async (email) => {
    const response = await apiClient.post(`${AUTH_ENDPOINT}/forgot-password`, { email });
    return response.data;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post(`${AUTH_ENDPOINT}/reset-password`, {
      token,
      newPassword,
    });
    return response.data;
  },
};

export default authService;
