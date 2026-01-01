/**
 * User Service - User profile and preferences API calls
 */

import apiClient from './api';

// API responses wrap actual data under `data`; fall back to the full payload if absent
const unwrap = (response) => response?.data?.data ?? response?.data;

const USER_ENDPOINT = '/users';

export const userService = {
  /**
   * Get user profile
   */
  getUserProfile: async () => {
    const response = await apiClient.get(`${USER_ENDPOINT}/profile`);
    return unwrap(response);
  },

  /**
   * Update user profile
   */
  updateUserProfile: async (userData) => {
    const response = await apiClient.put(`${USER_ENDPOINT}/profile`, userData);
    return unwrap(response);
  },

  /**
   * Get all user addresses
   */
  getAddresses: async () => {
    const response = await apiClient.get(`${USER_ENDPOINT}/addresses`);
    return unwrap(response);
  },

  /**
   * Add new address
   */
  addAddress: async (addressData) => {
    const response = await apiClient.post(`${USER_ENDPOINT}/addresses`, addressData);
    return unwrap(response);
  },

  /**
   * Update existing address
   */
  updateAddress: async (addressId, addressData) => {
    const response = await apiClient.put(`${USER_ENDPOINT}/addresses/${addressId}`, addressData);
    return unwrap(response);
  },

  /**
   * Delete address
   */
  deleteAddress: async (addressId) => {
    const response = await apiClient.delete(`${USER_ENDPOINT}/addresses/${addressId}`);
    return unwrap(response);
  },

  /**
   * Get allergy and dietary preferences
   */
  getAllergies: async () => {
    const response = await apiClient.get(`${USER_ENDPOINT}/allergies`);
    return unwrap(response);
  },

  /**
   * Update allergy and dietary preferences
   */
  updateAllergies: async (allergyData) => {
    const response = await apiClient.put(`${USER_ENDPOINT}/allergies`, allergyData);
    return unwrap(response);
  },

  /**
   * Upload profile picture
   */
  uploadProfilePicture: async (formData) => {
    const response = await apiClient.post(
      `${USER_ENDPOINT}/profile-picture`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return unwrap(response);
  },
};

export default userService;
