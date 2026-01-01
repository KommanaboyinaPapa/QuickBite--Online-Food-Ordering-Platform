/**
 * OrderSummary - Display order total with breakdown
 */

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { theme } from '@styles/theme';
import Card from '@components/Common/Card';

const { colors, typography, spacing } = theme;

const OrderSummary = ({
  subtotal = 0,
  tax = 0,
  deliveryFee = 0,
  discount = 0,
  coupon = null,
  showCoupon = true,
  compact = false
}) => {
  const total = subtotal + tax + deliveryFee - discount;

  return (
    <Card style={styles.card}>
      <View style={styles.container}>
        {/* Subtotal */}
        <View style={styles.row}>
          <Text style={[typography.body, styles.label]}>Subtotal</Text>
          <Text style={[typography.body, styles.value]}>₹{subtotal.toFixed(2)}</Text>
        </View>

        {/* Tax */}
        {tax > 0 && (
          <View style={styles.row}>
            <Text style={[typography.body, styles.label]}>Tax</Text>
            <Text style={[typography.body, styles.value]}>₹{tax.toFixed(2)}</Text>
          </View>
        )}

        {/* Delivery Fee */}
        {deliveryFee > 0 && (
          <View style={styles.row}>
            <Text style={[typography.body, styles.label]}>Delivery Fee</Text>
            <Text style={[typography.body, styles.value]}>₹{deliveryFee.toFixed(2)}</Text>
          </View>
        )}

        {/* Discount */}
        {discount > 0 && (
          <View style={styles.row}>
            <Text style={[typography.body, styles.label]}>Discount</Text>
            <Text style={[typography.body, { color: colors.success }]}>
              -₹{discount.toFixed(2)}
            </Text>
          </View>
        )}

        {/* Coupon */}
        {showCoupon && coupon && (
          <View style={styles.row}>
            <Text style={[typography.body, styles.label]}>
              Coupon ({coupon.code})
            </Text>
            <Text style={[typography.body, { color: colors.success }]}>
              -₹{coupon.discount.toFixed(2)}
            </Text>
          </View>
        )}

        {/* Divider */}
        {!compact && <View style={styles.divider} />}

        {/* Total */}
        <View style={[styles.row, styles.totalRow]}>
          <Text style={[typography.h5, styles.totalLabel]}>Total</Text>
          <Text style={[typography.h4, styles.totalValue]}>
            ₹{total.toFixed(2)}
          </Text>
        </View>

        {/* Savings Info */}
        {discount > 0 && (
          <Text style={[typography.caption, styles.savingsInfo]}>
            💰 You save ₹{discount.toFixed(2)} on this order
          </Text>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.light50,
  },
  container: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: colors.textSecondary,
    flex: 1,
  },
  value: {
    color: colors.text,
    fontWeight: '600',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  totalRow: {
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    color: colors.text,
  },
  totalValue: {
    color: colors.primary,
    fontWeight: '700',
  },
  savingsInfo: {
    color: colors.success,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: spacing.xs,
  },
});

export default OrderSummary;
