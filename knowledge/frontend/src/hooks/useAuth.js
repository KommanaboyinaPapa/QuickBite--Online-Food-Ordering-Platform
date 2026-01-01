/**
 * useAuth Hook - Handle authentication logic
 */

import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { 
  loginUser, 
  registerUser, 
  verifyOTP, 
  logoutUser, 
  clearError as clearAuthErrorAction
} from '@redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, loading, error, isAuthenticated } = useSelector(state => state.auth);

  const login = useCallback(async (email, password) => {
    const resultAction = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(resultAction)) {
      return resultAction.payload;
    } else {
      throw new Error(resultAction.payload || 'Login failed');
    }
  }, [dispatch]);

  const register = useCallback(async (userData) => {
    try {
      console.log('🔐 Starting registration with data:', userData);
      const resultAction = await dispatch(registerUser(userData));
      console.log('📦 Registration result action:', resultAction);
      
      if (registerUser.fulfilled.match(resultAction)) {
        console.log('✅ Registration successful:', resultAction.payload);
        return resultAction.payload;
      } else {
        const errorMsg = resultAction.payload || 'Registration failed';
        console.error('❌ Registration rejected:', resultAction.payload);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('🚨 Registration error caught:', error);
      throw error;
    }
  }, [dispatch]);

  const verify = useCallback(async (phone, otp) => {
    const resultAction = await dispatch(verifyOTP({ phone, otp }));
    if (verifyOTP.fulfilled.match(resultAction)) {
      return resultAction.payload;
    } else {
      throw new Error(resultAction.payload || 'Verification failed');
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    await dispatch(logoutUser());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearAuthErrorAction());
  }, [dispatch]);

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    verifyOTP: verify,
    logout,
    clearError,
  };
};
