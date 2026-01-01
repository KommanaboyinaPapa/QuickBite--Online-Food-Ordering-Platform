/**
 * useLocation Hook - Handle device location and maps
 */

import { useEffect, useCallback, useState } from 'react';
import * as Location from 'expo-location';

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const requestPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (err) {
      setErrorMsg(err.message);
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    try {
      setLoading(true);
      const hasPermission = await requestPermission();
      
      if (!hasPermission) {
        setErrorMsg('Location permission not granted');
        return null;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        altitude: currentLocation.coords.altitude,
        accuracy: currentLocation.coords.accuracy,
        timestamp: new Date()
      });

      return currentLocation.coords;
    } catch (err) {
      setErrorMsg(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [requestPermission]);

  const watchLocation = useCallback(async (callback, options = {}) => {
    try {
      const hasPermission = await requestPermission();
      
      if (!hasPermission) {
        setErrorMsg('Location permission not granted');
        return null;
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: options.timeInterval || 10000, // 10 seconds
          distanceInterval: options.distanceInterval || 10, // 10 meters
          ...options
        },
        (newLocation) => {
          const coords = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            altitude: newLocation.coords.altitude,
            accuracy: newLocation.coords.accuracy,
            speed: newLocation.coords.speed,
            heading: newLocation.coords.heading,
            timestamp: new Date(newLocation.timestamp)
          };
          setLocation(coords);
          if (callback) callback(coords);
        }
      );

      return subscription;
    } catch (err) {
      setErrorMsg(err.message);
      return null;
    }
  }, [requestPermission]);

  const getLocationName = useCallback(async (latitude, longitude) => {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (addresses.length > 0) {
        const address = addresses[0];
        return `${address.street}, ${address.city}, ${address.postalCode}`;
      }
      return null;
    } catch (err) {
      console.error('Error getting location name:', err);
      return null;
    }
  }, []);

  const getCoordinatesFromAddress = useCallback(async (address) => {
    try {
      const result = await Location.geocodeAsync(address);
      if (result.length > 0) {
        return {
          latitude: result[0].latitude,
          longitude: result[0].longitude
        };
      }
      return null;
    } catch (err) {
      console.error('Error geocoding address:', err);
      return null;
    }
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setErrorMsg(null);
  }, []);

  const clearError = useCallback(() => {
    setErrorMsg(null);
  }, []);

  return {
    location,
    errorMsg,
    loading,
    requestPermission,
    getCurrentLocation,
    watchLocation,
    getLocationName,
    getCoordinatesFromAddress,
    clearLocation,
    clearError
  };
};
