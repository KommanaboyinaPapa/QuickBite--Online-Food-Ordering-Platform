/**
 * Restaurant Service - Restaurant API calls
 */

import apiClient from './api';
import { normalizeImageUrl } from '../utils/image';

const RESTAURANT_ENDPOINT = '/restaurants';

export const restaurantService = {
  /**
   * Get list of restaurants with pagination
   */
  getRestaurants: async (page = 1, limit = 20) => {
    const response = await apiClient.get(RESTAURANT_ENDPOINT, {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Search restaurants by name, cuisine, rating
   */
  searchRestaurants: async (query) => {
    const response = await apiClient.get(`${RESTAURANT_ENDPOINT}/search`, {
      params: { q: query },
    });
    return response.data;
  },

  /**
   * Update restaurant details
   */
  updateRestaurant: async (id, data) => {
    const response = await apiClient.put(`${RESTAURANT_ENDPOINT}/${id}`, data);
    return response.data;
  },

  /**
   * Create a restaurant for the current owner
   */
  createRestaurant: async (data) => {
    const response = await apiClient.post(`${RESTAURANT_ENDPOINT}`, data);
    return response.data;
  },

  /**
   * Get nearby restaurants by location
   */
  getNearbyRestaurants: async (latitude, longitude, radius = 5) => {
    const response = await apiClient.get(`${RESTAURANT_ENDPOINT}/nearby`, {
      params: { latitude, longitude, radius },
    });
    return response.data;
  },

  /**
   * Get detailed restaurant information
   */
  getRestaurantDetails: async (restaurantId) => {
    const response = await apiClient.get(`${RESTAURANT_ENDPOINT}/${restaurantId}`);
    const data = response.data?.data || response.data;

    // Normalize cuisineTypes to cuisines array for UI
    let cuisines = [];
    if (data?.cuisineTypes) {
      if (Array.isArray(data.cuisineTypes)) {
        cuisines = data.cuisineTypes;
      } else if (typeof data.cuisineTypes === 'string') {
        try {
          const parsed = JSON.parse(data.cuisineTypes);
          cuisines = Array.isArray(parsed) ? parsed : [];
        } catch (_) {
          cuisines = data.cuisineTypes.split(',').map(c => c.trim()).filter(Boolean);
        }
      }
    }

    return {
      ...data,
      cuisines,
      bannerUrl: normalizeImageUrl(data?.bannerUrl || data?.logoUrl || data?.imageUrl),
      logoUrl: normalizeImageUrl(data?.logoUrl || data?.imageUrl),
    };
  },

  /**
   * Get restaurant menu with categories and items
   */
  getRestaurantMenu: async (restaurantId) => {
    const response = await apiClient.get(`${RESTAURANT_ENDPOINT}/${restaurantId}/menu`);
    console.log('=== DEBUG: restaurantService.getRestaurantMenu ===');
    console.log('Raw API response:', JSON.stringify(response.data, null, 2));
    
    // Backend returns { success, data: { items, categories } }
    const payload = response.data?.data || response.data;
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    const items = (payload?.items || payload || []).map(item => ({
      ...item,
      image: normalizeImageUrl(item.image || item.imageUrl),
      imageUrl: normalizeImageUrl(item.imageUrl || item.image),
      // Preserve ingredients field from backend
      ingredients: item.ingredients || [],
    }));
    
    console.log('Processed items count:', items.length);
    if (items.length > 0) {
      console.log('First item has ingredients?:', !!items[0].ingredients);
      console.log('First item ingredients count:', items[0].ingredients?.length || 0);
    }
    
    return { items, categories: payload?.categories || [] };
  },

  /**
   * Get restaurant reviews and ratings
   */
  getRestaurantReviews: async (restaurantId, page = 1, limit = 10) => {
    const response = await apiClient.get(`${RESTAURANT_ENDPOINT}/${restaurantId}/reviews`, {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Add restaurant to favorites
   */
  addToFavorites: async (restaurantId) => {
    const response = await apiClient.post(`${RESTAURANT_ENDPOINT}/${restaurantId}/favorites`);
    return response.data;
  },

  /**
   * Remove restaurant from favorites
   */
  removeFromFavorites: async (restaurantId) => {
    const response = await apiClient.delete(`${RESTAURANT_ENDPOINT}/${restaurantId}/favorites`);
    return response.data;
  },

  /**
   * Get user favorite restaurants
   */
  getFavorites: async () => {
    const response = await apiClient.get(`${RESTAURANT_ENDPOINT}/favorites`);
    return response.data;
  },
  /**
   * Get restaurant statistics
   */
  getRestaurantStats: async (restaurantId) => {
    const response = await apiClient.get(`${RESTAURANT_ENDPOINT}/${restaurantId}/stats`);
    return response.data;
  },

  /**
   * Get restaurant owned by the current user
   */
  getMyRestaurant: async () => {
    const response = await apiClient.get(`${RESTAURANT_ENDPOINT}/my`);
    return response.data;
  },
};

export default restaurantService;
