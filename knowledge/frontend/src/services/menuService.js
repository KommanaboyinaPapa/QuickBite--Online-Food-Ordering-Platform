
import apiClient from './api';

const MENU_ENDPOINT = '/menu-items';

const menuService = {
    getMenuByRestaurant: async (restaurantId, category) => {
        const params = category ? { category } : {};
        const response = await apiClient.get(`/restaurants/${restaurantId}/menu`, { params });
        // Backend returns { success: true, data: { items, categories } }
        return response.data?.data || response.data;
    },

    getMenuItemDetails: async (id) => {
        const response = await apiClient.get(`${MENU_ENDPOINT}/${id}`);
        return response.data;
    },

    createMenuItem: async (data) => {
        console.log('menuService.createMenuItem called with:', JSON.stringify(data, null, 2));
        const response = await apiClient.post(MENU_ENDPOINT, data);
        console.log('menuService.createMenuItem response:', JSON.stringify(response.data, null, 2));
        return response.data;
    },

    updateMenuItem: async (id, data) => {
        console.log('menuService.updateMenuItem called with:', id, JSON.stringify(data, null, 2));
        const response = await apiClient.put(`${MENU_ENDPOINT}/${id}`, data);
        console.log('menuService.updateMenuItem response:', JSON.stringify(response.data, null, 2));
        return response.data;
    },

    deleteMenuItem: async (id) => {
        const response = await apiClient.delete(`${MENU_ENDPOINT}/${id}`);
        return response.data;
    },

    // Helper to map ingredients to backend format
    formatIngredientsForUpdate: (selectedIngredients) => {
        return selectedIngredients.map(ing => ({
            ingredientId: ing.id,
            quantity: '1' // Default quantity
        }));
    }
};

export default menuService;
