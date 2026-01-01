
import { useState, useEffect, useRef } from 'react';
import apiClient from '@services/api';

export const useOrderTracking = (orderId, initialOrder = null) => {
    const [order, setOrder] = useState(initialOrder);
    const [loading, setLoading] = useState(!initialOrder);
    const [error, setError] = useState(null);

    // Ref for polling interval
    const pollRef = useRef(null);

    useEffect(() => {
        // Initial fetch
        fetchOrder();

        // Start polling every 10 seconds
        pollRef.current = setInterval(fetchOrder, 10000);

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            // Avoid loading state on poll updates to prevent flicker
            // Only set loading if no order yet
            if (!order) setLoading(true);

            const response = await apiClient.get(`/orders/${orderId}`);
            if (response.data.success) {
                setOrder(response.data.data);
            }
        } catch (err) {
            console.error('Tracking poll error:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return { order, loading, error, refresh: fetchOrder };
};
