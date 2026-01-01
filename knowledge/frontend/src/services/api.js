/**
 * API Service - Axios instance with interceptors and configuration
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@utils/constants';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    try {
      console.log(`📤 API Interceptor: ${config.method.toUpperCase()} ${config.url}`);
      console.log('📤 API Interceptor: Request data:', config.data);
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('📤 API Interceptor: Authorization header added');
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    console.error('🚨 API Interceptor: Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`📥 API Interceptor: Response from ${response.config.url}:`, response.status, response.data);
    return response;
  },
  async (error) => {
    console.error('🚨 API Interceptor: Response error:', error.message);
    console.error('🚨 API Interceptor: Error status:', error.response?.status);
    console.error('🚨 API Interceptor: Error data:', error.response?.data);
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { token, refreshToken: newRefreshToken } = response.data;
          
          // Save new tokens
          await AsyncStorage.setItem('token', token);
          if (newRefreshToken) {
            await AsyncStorage.setItem('refreshToken', newRefreshToken);
          }

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        } else {
          // No refresh token, logout
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('refreshToken');
          // Dispatch logout action here if needed
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('refreshToken');
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
