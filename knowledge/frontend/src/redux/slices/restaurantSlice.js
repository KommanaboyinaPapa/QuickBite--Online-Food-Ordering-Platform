/**
 * Restaurant Slice - Redux Toolkit slice for restaurant data
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import restaurantService from '@services/restaurantService';

export const fetchRestaurants = createAsyncThunk(
  'restaurant/fetchRestaurants',
  async (_, { rejectWithValue }) => {
    try {
      const response = await restaurantService.getRestaurants();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch restaurants');
    }
  }
);

export const searchRestaurants = createAsyncThunk(
  'restaurant/searchRestaurants',
  async (query, { rejectWithValue }) => {
    try {
      const response = await restaurantService.searchRestaurants(query);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search restaurants');
    }
  }
);

export const getNearbyRestaurants = createAsyncThunk(
  'restaurant/getNearbyRestaurants',
  async ({ latitude, longitude, radius }, { rejectWithValue }) => {
    try {
      const response = await restaurantService.getNearbyRestaurants(latitude, longitude, radius);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch nearby restaurants');
    }
  }
);

export const fetchRestaurantDetails = createAsyncThunk(
  'restaurant/fetchRestaurantDetails',
  async (restaurantId, { rejectWithValue }) => {
    try {
      const response = await restaurantService.getRestaurantDetails(restaurantId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch restaurant details');
    }
  }
);

export const fetchRestaurantMenu = createAsyncThunk(
  'restaurant/fetchRestaurantMenu',
  async (restaurantId, { rejectWithValue }) => {
    try {
      const response = await restaurantService.getRestaurantMenu(restaurantId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch menu');
    }
  }
);

const initialState = {
  restaurants: [],
  selectedRestaurant: null,
  menu: {
    categories: [],
    items: [],
  },
  loading: false,
  menuLoading: false,
  error: null,
  searchResults: [],
  nearbyRestaurants: [],
};

const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    selectRestaurant: (state, action) => {
      state.selectedRestaurant = action.payload;
    },
    clearSelectedRestaurant: (state) => {
      state.selectedRestaurant = null;
      state.menu = { categories: [], items: [] };
    },
  },
  extraReducers: (builder) => {
    // Fetch Restaurants
    builder
      .addCase(fetchRestaurants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants = action.payload.data || action.payload;
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Search Restaurants
    builder
      .addCase(searchRestaurants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Nearby Restaurants
    builder
      .addCase(getNearbyRestaurants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNearbyRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        state.nearbyRestaurants = action.payload;
      })
      .addCase(getNearbyRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Restaurant Details
    builder
      .addCase(fetchRestaurantDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurantDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRestaurant = action.payload;
      })
      .addCase(fetchRestaurantDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Menu
    builder
      .addCase(fetchRestaurantMenu.pending, (state) => {
        state.menuLoading = true;
        state.error = null;
      })
      .addCase(fetchRestaurantMenu.fulfilled, (state, action) => {
        state.menuLoading = false;
        state.menu = action.payload?.data || action.payload;
      })
      .addCase(fetchRestaurantMenu.rejected, (state, action) => {
        state.menuLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, selectRestaurant, clearSelectedRestaurant } = restaurantSlice.actions;
export default restaurantSlice.reducer;
