/**
 * useCart Hook - Handle shopping cart logic
 */

import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  addToCart as addToCartThunk,
  updateCartItem as updateCartItemThunk,
  removeFromCart as removeFromCartThunk,
  clearCart as clearCartThunk,
  fetchCart as fetchCartThunk,
  setCartItemExclusions,
  applyCoupon as applyCouponAction,
  removeCoupon as removeCouponAction,
} from '@redux/slices/cartSlice';

export const useCart = () => {
  const dispatch = useDispatch();
  const cart = useSelector(state => state.cart);

  const addToCart = useCallback(async (menuItem, exclusions = [], specialInstructions = '') => {
    try {
      await dispatch(addToCartThunk({
        menuItemId: menuItem.id,
        quantity: 1,
        specialInstructions,
      })).unwrap();
    } catch (err) {
      console.error('Error adding to cart:', err);
      throw err;
    }
  }, [dispatch]);

  const updateCartItem = useCallback((cartItemId, quantity, exclusions = []) => {
    dispatch(updateCartItemThunk({ itemId: cartItemId, quantity }));
    if (exclusions && exclusions.length >= 0) {
      dispatch(setCartItemExclusions({ itemId: cartItemId, ingredientIds: exclusions }));
    }
  }, [dispatch]);

  const removeFromCart = useCallback((cartItemId) => {
    dispatch(removeFromCartThunk(cartItemId));
  }, [dispatch]);

  const updateExclusions = useCallback((cartItemId, exclusions) => {
    dispatch(setCartItemExclusions({ itemId: cartItemId, ingredientIds: exclusions }));
  }, [dispatch]);

  const clearCart = useCallback(() => {
    dispatch(clearCartThunk());
  }, [dispatch]);

  const applyCoupon = useCallback((couponCode) => {
    dispatch(applyCouponAction(couponCode));
  }, [dispatch]);

  const removeCoupon = useCallback(() => {
    dispatch(removeCouponAction());
  }, [dispatch]);

   const fetchCart = useCallback(() => {
    dispatch(fetchCartThunk());
  }, [dispatch]);

  const getCartTotal = useCallback(() => {
    return cart.total || 0;
  }, [cart.total]);

  const getItemCount = useCallback(() => {
    return cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }, [cart.items]);

  const isCartEmpty = useCallback(() => {
    return !cart.items || cart.items.length === 0;
  }, [cart.items]);

  return {
    cart,
    addToCart,
    updateCartItem,
    removeFromCart,
    updateExclusions,
    clearCart,
    applyCoupon,
    removeCoupon,
    fetchCart,
    getCartTotal,
    getItemCount,
    isCartEmpty
  };
};
