import apiClient from './api';

export const deliveryService = {
    getAvailableOrders: async () => {
        const response = await apiClient.get('/orders/available');
        return response.data;
    },

    getMyDeliveries: async () => {
        const response = await apiClient.get('/orders/delivery-agent');
        return response.data;
    },

    acceptOrder: async (orderId) => {
        const response = await apiClient.post(`/orders/${orderId}/accept`);
        return response.data;
    },

    updateStatus: async (orderId, status) => {
        const response = await apiClient.put(`/orders/${orderId}/status`, { status });
        return response.data;
    },

    updateDeliveryLocation: async (orderId, coords) => {
        const response = await apiClient.put(`/tracking/${orderId}/location`, coords);
        return response.data;
    },

    toggleStatus: async (isOnline) => {
        // Ideally update user status in backend
        return { success: true, isOnline };
    }
};
