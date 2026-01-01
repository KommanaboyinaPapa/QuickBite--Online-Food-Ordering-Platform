/**
 * useOrder Hook - Handle order management logic
 */

import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import orderService from '@services/orderService';
import * as orderSlice from '@redux/slices/orderSlice';

export const useOrder = () => {
  const dispatch = useDispatch();
  const { currentOrder, orders, loading, error } = useSelector(state => state.order);

  const createOrder = useCallback(async (orderData) => {
    try {
      dispatch(orderSlice.setLoading(true));
      const response = await orderService.createOrder(orderData);
      dispatch(orderSlice.setCurrentOrder(response));
      return response;
    } catch (err) {
      dispatch(orderSlice.setError(err.message));
      throw err;
    } finally {
      dispatch(orderSlice.setLoading(false));
    }
  }, [dispatch]);

  const fetchOrders = useCallback(async () => {
    try {
      dispatch(orderSlice.setLoading(true));
      const response = await orderService.getOrders();
      dispatch(orderSlice.setOrders(response));
      return response;
    } catch (err) {
      dispatch(orderSlice.setError(err.message));
      throw err;
    } finally {
      dispatch(orderSlice.setLoading(false));
    }
  }, [dispatch]);

  const fetchOrderDetails = useCallback(async (orderId) => {
    try {
      dispatch(orderSlice.setLoading(true));
      const response = await orderService.getOrderDetails(orderId);
      dispatch(orderSlice.setCurrentOrder(response));
      return response;
    } catch (err) {
      dispatch(orderSlice.setError(err.message));
      throw err;
    } finally {
      dispatch(orderSlice.setLoading(false));
    }
  }, [dispatch]);

  const cancelOrder = useCallback(async (orderId, reason = '') => {
    try {
      dispatch(orderSlice.setLoading(true));
      const response = await orderService.cancelOrder(orderId, reason);
      dispatch(orderSlice.updateOrderStatus({
        orderId,
        status: 'cancelled'
      }));
      return response;
    } catch (err) {
      dispatch(orderSlice.setError(err.message));
      throw err;
    } finally {
      dispatch(orderSlice.setLoading(false));
    }
  }, [dispatch]);

  const trackOrder = useCallback(async (orderId) => {
    try {
      const response = await orderService.getOrderTracking(orderId);
      return response;
    } catch (err) {
      console.error('Error tracking order:', err);
      throw err;
    }
  }, []);

  const submitReview = useCallback(async (orderId, rating, comment) => {
    try {
      dispatch(orderSlice.setLoading(true));
      if (orderService.submitReview) {
        const response = await orderService.submitReview(orderId, { rating, comment });
        return response;
      }
      throw new Error('submitReview not implemented');
    } catch (err) {
      dispatch(orderSlice.setError(err.message));
      throw err;
    } finally {
      dispatch(orderSlice.setLoading(false));
    }
  }, [dispatch]);

  const getOrderStatus = useCallback((orderId) => {
    if (currentOrder?.id === orderId) {
      return currentOrder.status;
    }
    const order = orders?.find(o => o.id === orderId);
    return order?.status || null;
  }, [currentOrder, orders]);

  const clearError = useCallback(() => {
    dispatch(orderSlice.setError(null));
  }, [dispatch]);

  return {
    currentOrder,
    orders,
    loading,
    error,
    createOrder,
    fetchOrders,
    fetchOrderDetails,
    cancelOrder,
    trackOrder,
    submitReview,
    getOrderStatus,
    clearError
  };
};
