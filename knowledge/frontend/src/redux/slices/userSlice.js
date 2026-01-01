/**
 * User Slice - Redux Toolkit slice for user profile and preferences
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '@services/userService';

export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getUserProfile();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await userService.updateUserProfile(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const fetchAddresses = createAsyncThunk(
  'user/fetchAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getAddresses();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch addresses');
    }
  }
);

export const addAddress = createAsyncThunk(
  'user/addAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await userService.addAddress(addressData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add address');
    }
  }
);

export const updateAddress = createAsyncThunk(
  'user/updateAddress',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await userService.updateAddress(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update address');
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'user/deleteAddress',
  async (id, { rejectWithValue }) => {
    try {
      await userService.deleteAddress(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete address');
    }
  }
);

export const fetchAllergies = createAsyncThunk(
  'user/fetchAllergies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getAllergies();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch allergies');
    }
  }
);

export const updateAllergies = createAsyncThunk(
  'user/updateAllergies',
  async (allergyData, { rejectWithValue }) => {
    try {
      const response = await userService.updateAllergies(allergyData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update allergies');
    }
  }
);

const initialState = {
  profile: null,
  addresses: [],
  allergies: {
    allergens: [],
    dietaryRestrictions: [],
    healthConditions: [],
    spicePreference: 'medium',
  },
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Addresses
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add Address
    builder
      .addCase(addAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses.push(action.payload);
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Address
    builder
      .addCase(updateAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.addresses.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.addresses[index] = action.payload;
        }
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Address
    builder
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter(a => a.id !== action.payload);
      });

    // Fetch Allergies
    builder
      .addCase(fetchAllergies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllergies.fulfilled, (state, action) => {
        state.loading = false;
        state.allergies = action.payload;
      })
      .addCase(fetchAllergies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Allergies
    builder
      .addCase(updateAllergies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAllergies.fulfilled, (state, action) => {
        state.loading = false;
        state.allergies = action.payload;
      })
      .addCase(updateAllergies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
