/**
 * Redux Middleware - API Middleware for handling async actions
 */

import axios from 'axios';
import { API_URL } from '@utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const apiMiddleware = store => next => async action => {
  // Pass through non-API actions
  if (!action.payload || !action.payload.request) {
    return next(action);
  }

  const { request, success, failure } = action.payload;
  const state = store.getState();
  const token = state.auth.token;

  // Create axios instance with auth header
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });

  try {
    const response = await axiosInstance(request);
    
    return next({
      type: success,
      payload: response.data,
    });
  } catch (error) {
    const errorPayload = {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    };

    // Handle token expiration
    if (error.response?.status === 401) {
      try {
        // Attempt to refresh token
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });
          
          const { token: newToken } = refreshResponse.data;
          await AsyncStorage.setItem('token', newToken);
          
          // Retry original request
          axiosInstance.defaults.headers['Authorization'] = `Bearer ${newToken}`;
          const retryResponse = await axiosInstance(request);
          
          return next({
            type: success,
            payload: retryResponse.data,
          });
        } else {
          // No refresh token, logout user
          return next({
            type: 'auth/logout',
          });
        }
      } catch (refreshError) {
        return next({
          type: 'auth/logout',
        });
      }
    }

    return next({
      type: failure,
      payload: errorPayload,
    });
  }
};

export default apiMiddleware;
