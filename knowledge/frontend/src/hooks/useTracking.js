/**
 * useTracking Hook - Handle real-time order tracking
 */

import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect, useRef } from 'react';
import * as trackingService from '@services/trackingService';
import * as trackingSlice from '@redux/slices/trackingSlice';

export const useTracking = () => {
  const dispatch = useDispatch();
  const tracking = useSelector(state => state.tracking);
  const socketRef = useRef(null);

  const startTracking = useCallback((orderId) => {
    try {
      dispatch(trackingSlice.setTracking(true));
      // Connect to WebSocket for real-time updates
      socketRef.current = trackingService.connectToTracking(orderId);
      
      socketRef.current.on('location_update', (data) => {
        dispatch(trackingSlice.updateLocation(data));
      });

      socketRef.current.on('eta_update', (data) => {
        dispatch(trackingSlice.updateETA(data));
      });

      socketRef.current.on('status_update', (data) => {
        dispatch(trackingSlice.updateStatus(data));
      });

      socketRef.current.on('error', (error) => {
        console.error('Tracking error:', error);
        dispatch(trackingSlice.setError(error.message));
      });
    } catch (err) {
      dispatch(trackingSlice.setError(err.message));
    }
  }, [dispatch]);

  const stopTracking = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    dispatch(trackingSlice.setTracking(false));
  }, [dispatch]);

  const getTrackingDetails = useCallback(async (orderId) => {
    try {
      const response = await trackingService.getTrackingDetails(orderId);
      dispatch(trackingSlice.setTrackingData(response));
      return response;
    } catch (err) {
      dispatch(trackingSlice.setError(err.message));
      throw err;
    }
  }, [dispatch]);

  const updateAgentLocation = useCallback(async (orderId, latitude, longitude) => {
    try {
      const response = await trackingService.updateAgentLocation(orderId, {
        latitude,
        longitude
      });
      dispatch(trackingSlice.updateLocation(response));
      return response;
    } catch (err) {
      console.error('Error updating location:', err);
      throw err;
    }
  }, [dispatch]);

  const getDistanceRemaining = useCallback(() => {
    return tracking.distance || 0;
  }, [tracking.distance]);

  const getETA = useCallback(() => {
    return tracking.eta || null;
  }, [tracking.eta]);

  const getAgentInfo = useCallback(() => {
    return tracking.agentInfo || null;
  }, [tracking.agentInfo]);

  const getAgentLocation = useCallback(() => {
    return {
      latitude: tracking.agentLocation?.latitude,
      longitude: tracking.agentLocation?.longitude
    };
  }, [tracking.agentLocation]);

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    tracking,
    isTracking: tracking.isTracking,
    agentLocation: tracking.agentLocation,
    agentInfo: tracking.agentInfo,
    eta: tracking.eta,
    distance: tracking.distance,
    status: tracking.status,
    startTracking,
    stopTracking,
    getTrackingDetails,
    updateAgentLocation,
    getDistanceRemaining,
    getETA,
    getAgentInfo,
    getAgentLocation
  };
};
