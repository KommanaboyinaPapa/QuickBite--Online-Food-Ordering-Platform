// frontend/src/services/statsService.js
import api from './api';

const statsService = {
    /**
     * Get restaurant owner stats
     * Returns today/weekly/lifetime orders, revenue, rating
     */
    getRestaurantStats: async () => {
        const response = await api.get('/stats/restaurant');
        return response.data?.data || response.data;
    },

    /**
     * Get delivery agent stats
     * Returns today/weekly/lifetime deliveries, earnings, rating
     */
    getDeliveryAgentStats: async () => {
        const response = await api.get('/stats/delivery');
        return response.data?.data || response.data;
    },
};

export default statsService;
