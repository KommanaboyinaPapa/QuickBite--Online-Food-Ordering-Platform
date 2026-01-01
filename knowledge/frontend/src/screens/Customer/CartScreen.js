import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { useCart } from '@hooks/useCart';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@styles/theme';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Button from '@components/Common/Button';
import CartItem from '@components/Order/CartItem';
import OrderSummary from '@components/Order/OrderSummary';
import Card from '@components/Common/Card';

const { colors, typography, spacing } = theme;

/**
 * CartScreen
 * 
 * Displays shopping cart with:
 * - List of cart items
 * - Remove/edit buttons
 * - Order summary
 * - Checkout button
 */
export default function CartScreen({ navigation }) {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const { removeFromCart, updateCartItem, updateExclusions, clearCart, applyCoupon, removeCoupon, fetchCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchCart();
    }, [fetchCart])
  );

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  const handleQuantityChange = (itemId, nextQty) => {
    updateCartItem(itemId, nextQty);
  };

  const handleEditItem = (item) => {
    navigation.navigate('MenuItemDetail', { item });
  };

  const handleToggleIngredient = (item, ingredientId, shouldInclude) => {
    const currentExclusions = (item.exclusions || []).map((exc) => exc.ingredientId || exc);
    const nextExclusions = shouldInclude
      ? currentExclusions.filter((id) => id !== ingredientId)
      : Array.from(new Set([...currentExclusions, ingredientId]));
    updateExclusions(item.id, nextExclusions);
  };

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      applyCoupon(couponCode);
      setCouponCode('');
      setShowCouponInput(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      alert('Add items to cart first');
      return;
    }
    navigation.navigate('Checkout');
  };

  const handleContinueShopping = () => {
    navigation.navigate('Home');
  };

  if (cart.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={80} color={colors.textSecondary} />
        <Text style={[typography.h4, styles.emptyTitle]}>Your cart is empty</Text>
        <Text style={[typography.body, styles.emptySubtitle]}>
          Add items from restaurants to get started
        </Text>
        <Button
          title="Start Shopping"
          onPress={handleContinueShopping}
          style={styles.emptyButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[typography.h4, styles.headerTitle]}>Shopping Cart</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Restaurant Info */}
        {cart.restaurantId && (
          <Card style={styles.restaurantCard}>
            <View style={styles.restaurantInfo}>
              <Ionicons name="restaurant" size={20} color={colors.primary} />
              <Text style={styles.restaurantName}>Restaurant</Text>
            </View>
          </Card>
        )}

        {/* Cart Items */}
        <View style={styles.itemsSection}>
          <Text style={[typography.h6, styles.sectionTitle]}>Items ({cart.items.length})</Text>
          {cart.items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onQuantityChange={handleQuantityChange}
              onRemove={() => handleRemoveItem(item.id)}
              onEdit={() => handleEditItem(item)}
              onToggleIngredient={(cartItemId, ingredientId, shouldInclude) =>
                handleToggleIngredient(item, ingredientId, shouldInclude)
              }
            />
          ))}
        </View>

        {/* Coupon Section */}
        <View style={styles.couponSection}>
          <TouchableOpacity
            style={styles.couponButton}
            onPress={() => setShowCouponInput(!showCouponInput)}
          >
            <Ionicons name="ticket" size={20} color={colors.primary} />
            <Text style={styles.couponButtonText}>
              {cart.couponApplied ? 'Change Coupon' : 'Apply Coupon'}
            </Text>
          </TouchableOpacity>

          {cart.couponApplied && (
            <View style={styles.appliedCoupon}>
              <Text style={styles.couponCode}>{cart.couponApplied}</Text>
              <TouchableOpacity onPress={handleRemoveCoupon}>
                <Ionicons name="close-circle" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          )}

          {showCouponInput && (
            <View style={styles.couponInputContainer}>
              <TextInput
                style={styles.couponInput}
                placeholder="Enter coupon code"
                value={couponCode}
                onChangeText={setCouponCode}
                placeholderTextColor={colors.textSecondary}
              />
              <Button
                title="Apply"
                onPress={handleApplyCoupon}
                style={styles.applyCouponButton}
              />
            </View>
          )}
        </View>

        {/* Order Summary */}
        <OrderSummary
          subtotal={cart.subtotal}
          tax={cart.tax}
          deliveryFee={cart.deliveryFee}
          discount={cart.discount}
          total={cart.total}
          coupon={cart.couponApplied}
        />

        <View style={styles.spacer} />
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.footer}>
        <Button
          title={`Checkout - ₹${cart.total?.toFixed(2) || '0'}`}
          onPress={handleCheckout}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  clearText: {
    ...typography.label,
    color: colors.error,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  restaurantCard: {
    marginBottom: spacing.md,
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  restaurantName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  itemsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    marginBottom: spacing.md,
  },
  couponSection: {
    marginVertical: spacing.lg,
  },
  couponButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(103, 58, 183, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  couponButtonText: {
    ...typography.label,
    color: colors.primary,
    fontWeight: '600',
  },
  appliedCoupon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    borderRadius: 8,
    marginTopMargin: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  couponCode: {
    ...typography.label,
    color: colors.success,
    fontWeight: '600',
  },
  couponInputContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  couponInput: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    ...typography.body,
    color: colors.text,
  },
  applyCouponButton: {
    width: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  emptyButton: {
    width: '100%',
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  spacer: {
    height: spacing.lg,
  },
});
