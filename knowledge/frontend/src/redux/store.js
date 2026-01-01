/**
 * Redux Store Configuration
 * Central store setup with all reducers and middleware
 */

import { configureStore } from '@reduxjs/toolkit';
import apiMiddleware from './middleware/apiMiddleware';

// Import all slices
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import restaurantReducer from './slices/restaurantSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import aiReducer from './slices/aiSlice';
import trackingReducer from './slices/trackingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    restaurant: restaurantReducer,
    cart: cartReducer,
    order: orderReducer,
    ai: aiReducer,
    tracking: trackingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization check
        ignoredActions: ['auth/loginUser/fulfilled', 'auth/registerUser/fulfilled'],
      },
    }).concat(apiMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
