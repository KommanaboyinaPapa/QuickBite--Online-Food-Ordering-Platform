/**
 * Cart Slice - Redux Toolkit slice for shopping cart with ingredient exclusions
 * SYNCED WITH BACKEND DATABASE
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService as cartService } from '@services/orderService'; // Alias for clarity

// Normalize API responses to raw cart object
const extractCart = (response) => {
  if (!response) return null;
  // BE responses shaped as { success, message, data }
  if (response.data) return response.data;
  return response;
};

// Thunks for API interaction
// Thunks for API interaction
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart();
      return extractCart(response); // Expecting { items: [], total: 0, ... }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (itemData, { rejectWithValue }) => {
    try {
      await cartService.addToCart(itemData);
      // Fetch updated cart to ensure sync
      const response = await cartService.getCart();
      return extractCart(response);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      await cartService.updateCartItem(itemId, quantity);
      const response = await cartService.getCart();
      return extractCart(response);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { rejectWithValue }) => {
    try {
      await cartService.removeFromCart(itemId);
      const response = await cartService.getCart();
      return extractCart(response);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await cartService.clearCart();
      const response = await cartService.getCart();
      return extractCart(response);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

export const setCartItemExclusions = createAsyncThunk(
  'cart/setCartItemExclusions',
  async ({ itemId, ingredientIds }, { rejectWithValue }) => {
    try {
      await cartService.setItemExclusions(itemId, ingredientIds);
      const response = await cartService.getCart();
      return extractCart(response);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update exclusions');
    }
  }
);

const initialState = {
  restaurantId: null,
  items: [],
  subtotal: 0,
  tax: 0,
  deliveryFee: 0,
  total: 0,
  couponApplied: null,
  discount: 0,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    applyCoupon: (state, action) => {
      state.couponApplied = action.payload;
      // Simple placeholder discount logic; adjust when backend provides coupon validation
      state.discount = 0;
    },
    removeCoupon: (state) => {
      state.couponApplied = null;
      state.discount = 0;
    },
    // Local-only actions (if needed for UI before sync, but we use thunks now)
    resetCartState: (state) => {
      Object.assign(state, initialState);
    }
  },
  extraReducers: (builder) => {
    // Common Logic for all cart update actions
    const handleCartUpdate = (state, action) => {
      state.loading = false;
      const cart = action.payload?.data || action.payload; // support {success,data}
      if (cart) {
        state.items = cart.items || [];
        state.restaurantId = cart.restaurantId;
        state.subtotal = cart.subtotal ?? cart.total ?? 0;
        state.tax = cart.tax ?? 0;
        state.deliveryFee = cart.deliveryFee ?? 0;
        state.discount = cart.discount ?? 0;
        state.total = cart.total ?? cart.subtotal ?? 0;
      }
    };

    // FETCH CART
    builder.addCase(fetchCart.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchCart.fulfilled, handleCartUpdate);
    builder.addCase(fetchCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // ADD TO CART
    builder.addCase(addToCart.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(addToCart.fulfilled, handleCartUpdate);
    builder.addCase(addToCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // UPDATE ITEM
    builder.addCase(updateCartItem.fulfilled, handleCartUpdate);

    // UPDATE EXCLUSIONS
    builder.addCase(setCartItemExclusions.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(setCartItemExclusions.fulfilled, handleCartUpdate);
    builder.addCase(setCartItemExclusions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // REMOVE ITEM
    builder.addCase(removeFromCart.fulfilled, handleCartUpdate);

    // CLEAR CART
    builder.addCase(clearCart.fulfilled, handleCartUpdate);
  },
});

export const { clearError, resetCartState } = cartSlice.actions;
export const { applyCoupon, removeCoupon } = cartSlice.actions;
export default cartSlice.reducer;

