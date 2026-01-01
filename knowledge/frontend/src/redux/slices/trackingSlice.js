/**
 * Tracking Slice - Redux Toolkit slice for real-time order tracking
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as trackingService from '@services/trackingService';

export const startTracking = createAsyncThunk(
  'tracking/startTracking',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await trackingService.getTracking(orderId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start tracking');
    }
  }
);

const initialState = {
  isTracking: false,
  orderId: null,
  agentId: null,
  agentInfo: {
    name: '',
    rating: 0,
    phone: '',
    image: '',
    vehicle: '',
  },
  agentLocation: {
    latitude: null,
    longitude: null,
    timestamp: null,
    speed: 0,
  },
  customerLocation: {
    latitude: null,
    longitude: null,
  },
  restaurantLocation: {
    latitude: null,
    longitude: null,
  },
  route: [],
  eta: null,
  distance: 0,
  status: 'pending',
  orderStatus: 'pending',
  loading: false,
  error: null,
};

const trackingSlice = createSlice({
  name: 'tracking',
  initialState,
  reducers: {
    setAgentLocation: (state, action) => {
      const { latitude, longitude, speed } = action.payload;
      state.agentLocation = {
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
        speed: speed || 0,
      };
    },

    setRoute: (state, action) => {
      state.route = action.payload;
    },

    setETA: (state, action) => {
      state.eta = action.payload;
    },

    setDistance: (state, action) => {
      state.distance = action.payload;
    },

    setTrackingStatus: (state, action) => {
      state.status = action.payload;
    },

    setOrderStatus: (state, action) => {
      state.orderStatus = action.payload;
    },

    updateAgentInfo: (state, action) => {
      state.agentInfo = { ...state.agentInfo, ...action.payload };
    },

    setCustomerLocation: (state, action) => {
      const { latitude, longitude } = action.payload;
      state.customerLocation = { latitude, longitude };
    },

    stopTracking: (state) => {
      state.isTracking = false;
      state.orderId = null;
      state.route = [];
      state.agentLocation = {
        latitude: null,
        longitude: null,
        timestamp: null,
        speed: 0,
      };
    },

    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startTracking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startTracking.fulfilled, (state, action) => {
        state.loading = false;
        state.isTracking = true;
        const {
          orderId,
          agentId,
          agentInfo,
          agentLocation,
          customerLocation,
          restaurantLocation,
          route,
          eta,
          distance,
          status,
        } = action.payload;

        state.orderId = orderId;
        state.agentId = agentId;
        state.agentInfo = agentInfo;
        state.agentLocation = agentLocation;
        state.customerLocation = customerLocation;
        state.restaurantLocation = restaurantLocation;
        state.route = route || [];
        state.eta = eta;
        state.distance = distance;
        state.status = status;
      })
      .addCase(startTracking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isTracking = false;
      });
  },
});

export const {
  setAgentLocation,
  setRoute,
  setETA,
  setDistance,
  setTrackingStatus,
  setOrderStatus,
  updateAgentInfo,
  setCustomerLocation,
  stopTracking,
  clearError,
} = trackingSlice.actions;

export default trackingSlice.reducer;
