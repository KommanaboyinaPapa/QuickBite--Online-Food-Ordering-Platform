/**
 * Auth Slice - Redux Toolkit slice for authentication state
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '@services/authService';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('🔐 Frontend Auth Slice: Logging in with:', credentials);
      const response = await authService.login(credentials);
      console.log('🔐 Frontend Auth Slice: Login response:', response);
      const { user, tokens } = response.data;
      const { accessToken: token, refreshToken } = tokens;

      // Save tokens
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('refreshToken', refreshToken);

      console.log('✅ Frontend Auth Slice: Login tokens saved successfully');
      return { token, refreshToken, user };
    } catch (error) {
      console.error('🚨 Frontend Auth Slice: Login error:', error.message);
      console.error('🚨 Frontend Auth Slice: Login error response:', error.response?.data);
      console.error('🚨 Frontend Auth Slice: Login validation errors:', JSON.stringify(error.response?.data?.errors, null, 2));
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('🔐 Frontend Auth Slice: Sending registration request with:', userData);
      const response = await authService.register(userData);
      console.log('🔐 Frontend Auth Slice: Registration response:', response);
      const { user, tokens } = response.data;
      const { accessToken: token, refreshToken } = tokens;

      // Save tokens
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('refreshToken', refreshToken);

      console.log('✅ Frontend Auth Slice: Tokens saved successfully');
      return { token, refreshToken, user };
    } catch (error) {
      console.error('🚨 Frontend Auth Slice: Registration error:', error.message);
      console.error('🚨 Frontend Auth Slice: Error response:', error.response?.data);
      console.error('🚨 Frontend Auth Slice: Validation errors:', JSON.stringify(error.response?.data?.errors, null, 2));
      console.error('🚨 Frontend Auth Slice: Full error:', error);
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async (phone, { rejectWithValue }) => {
    try {
      await authService.sendOTP(phone);
      return { phone };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send OTP');
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ phone, otp }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyOTP(phone, otp);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Invalid OTP');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('refreshToken');
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  lastLogin: null,
  otpPhone: null,
  isVerifyingOTP: false,
};

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setOTPPhone: (state, action) => {
      state.otpPhone = action.payload;
    },
    clearOTPPhone: (state) => {
      state.otpPhone = null;
    },
    logout: (state) => {
      // Force logout - reset all auth state
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.otpPhone = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.lastLogin = new Date().toISOString();
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.lastLogin = new Date().toISOString();
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });

    // Send OTP
    builder
      .addCase(sendOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.otpPhone = action.payload.phone;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Verify OTP
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.isVerifyingOTP = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isVerifyingOTP = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.otpPhone = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isVerifyingOTP = false;
        state.error = action.payload;
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
        state.otpPhone = null;
      });
  },
});

export const { clearError, setOTPPhone, clearOTPPhone, logout } = authSlice.actions;
export default authSlice.reducer;
