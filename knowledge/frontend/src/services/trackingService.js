/**
 * Tracking Service - Order tracking and real-time location API calls
 */

import { io } from 'socket.io-client';
import { SOCKET_URL } from '@utils/constants';
import apiClient from './api';

const TRACKING_ENDPOINT = '/tracking';

let socket = null;

export const trackingService = {
  /**
   * Initialize WebSocket connection for tracking
   */
  initializeTracking: (orderId, onUpdate) => {
    if (!socket) {
      socket = io(SOCKET_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });
    }

    // Join order tracking room
    socket.emit('join_tracking', { orderId });

    // Listen for location updates
    socket.on('location_update', (data) => {
      onUpdate(data);
    });

    // Listen for status updates
    socket.on('status_update', (data) => {
      onUpdate(data);
    });

    // Listen for ETA updates
    socket.on('eta_update', (data) => {
      onUpdate(data);
    });

    return socket;
  },

  /**
   * Get tracking information for order
   */
  getTracking: async (orderId) => {
    const response = await apiClient.get(`${TRACKING_ENDPOINT}/${orderId}`);
    return response.data;
  },

  /**
   * Update agent location (for delivery agents)
   */
  updateAgentLocation: async (orderId, location) => {
    const response = await apiClient.post(`${TRACKING_ENDPOINT}/${orderId}/location`, location);
    return response.data;
  },

  /**
   * Get tracking status
   */
  getTrackingStatus: async (orderId) => {
    const response = await apiClient.get(`${TRACKING_ENDPOINT}/${orderId}/status`);
    return response.data;
  },

  /**
   * Stop tracking
   */
  stopTracking: (orderId) => {
    if (socket) {
      socket.emit('leave_tracking', { orderId });
      socket.disconnect();
      socket = null;
    }
  },

  /**
   * Listen for real-time updates
   */
  onLocationUpdate: (callback) => {
    if (socket) {
      socket.on('location_update', callback);
    }
  },

  /**
   * Listen for status updates
   */
  onStatusUpdate: (callback) => {
    if (socket) {
      socket.on('status_update', callback);
    }
  },

  /**
   * Listen for ETA updates
   */
  onETAUpdate: (callback) => {
    if (socket) {
      socket.on('eta_update', callback);
    }
  },

  /**
   * Stop listening to updates
   */
  offLocationUpdate: () => {
    if (socket) {
      socket.off('location_update');
    }
  },

  /**
   * Estimate arrival time
   */
  estimateArrival: async (orderId) => {
    const response = await apiClient.get(`${TRACKING_ENDPOINT}/${orderId}/eta`);
    return response.data;
  },
};

export default trackingService;
