/**
 * Ingredient Service - Ingredient and allergen information API calls
 */

import apiClient from './api';

const INGREDIENT_ENDPOINT = '/ingredients';
const MENU_ENDPOINT = '/menu-items';

export const ingredientService = {
  /**
   * Get all ingredients for a restaurant (for owner management)
   */
  getRestaurantIngredients: async (restaurantId) => {
    const response = await apiClient.get(`${INGREDIENT_ENDPOINT}/restaurant/${restaurantId}`);
    return response.data;
  },

  /**
   * Create a new ingredient (restaurant owner only)
   */
  createIngredient: async (data) => {
    const response = await apiClient.post(INGREDIENT_ENDPOINT, data);
    return response.data;
  },

  /**
   * Update an ingredient (restaurant owner only)
   */
  updateIngredient: async (id, data) => {
    const response = await apiClient.put(`${INGREDIENT_ENDPOINT}/${id}`, data);
    return response.data;
  },

  /**
   * Delete an ingredient (restaurant owner only)
   */
  deleteIngredient: async (id) => {
    const response = await apiClient.delete(`${INGREDIENT_ENDPOINT}/${id}`);
    return response.data;
  },

  /**
   * Get all ingredients for a menu item
   */
  getMenuItemIngredients: async (menuItemId) => {
    const response = await apiClient.get(`${MENU_ENDPOINT}/${menuItemId}/ingredients`);
    return response.data;
  },

  /**
   * Get allergen information
   */
  getAllergenInfo: async (ingredientId) => {
    const response = await apiClient.get(`${INGREDIENT_ENDPOINT}/${ingredientId}`);
    return response.data;
  },

  /**
   * Get all allergen types
   */
  getAllergens: async () => {
    const response = await apiClient.get(`${INGREDIENT_ENDPOINT}/allergens`);
    return response.data;
  },

  /**
   * Get menu item with allergen warnings
   */
  getMenuItemWithWarnings: async (menuItemId, userAllergies = []) => {
    const response = await apiClient.get(
      `${MENU_ENDPOINT}/${menuItemId}/allergen-warnings`,
      {
        params: { allergies: userAllergies.join(',') },
      }
    );
    return response.data;
  },

  /**
   * Get safe menu items for user allergies
   */
  getSafeMenuItems: async (restaurantId, userAllergies = []) => {
    const response = await apiClient.get(
      `${MENU_ENDPOINT}/safe-items`,
      {
        params: {
          restaurantId,
          allergies: userAllergies.join(','),
        },
      }
    );
    return response.data;
  },

  /**
   * Get ingredient exclusion options for menu item
   */
  getExclusionOptions: async (menuItemId) => {
    const response = await apiClient.get(
      `${MENU_ENDPOINT}/${menuItemId}/exclusion-options`
    );
    return response.data;
  },

  /**
   * Validate exclusions for menu item
   */
  validateExclusions: async (menuItemId, exclusionIds = []) => {
    const response = await apiClient.post(
      `${MENU_ENDPOINT}/${menuItemId}/validate-exclusions`,
      { exclusionIds }
    );
    return response.data;
  },
};

export default ingredientService;

