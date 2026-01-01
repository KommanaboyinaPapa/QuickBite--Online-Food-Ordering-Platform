/**
 * Payment Confirmation Screen - Show payment success/failure
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@styles/theme';

const { colors, spacing, typography } = theme;

const PaymentConfirmationScreen = ({ navigation, route }) => {
  const { success = true, orderNumber = '#12345', amount = '45.99' } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, success ? styles.successBg : styles.errorBg]}>
          <Ionicons
            name={success ? 'checkmark-circle' : 'close-circle'}
            size={80}
            color={success ? colors.success : colors.error}
          />
        </View>

        <Text style={styles.title}>
          {success ? 'Payment Successful!' : 'Payment Failed'}
        </Text>

        <Text style={styles.subtitle}>
          {success
            ? `Your order ${orderNumber} has been confirmed`
            : 'There was an issue processing your payment'}
        </Text>

        {success && (
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order Number</Text>
              <Text style={styles.detailValue}>{orderNumber}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount Paid</Text>
              <Text style={styles.detailValue}>${amount}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Method</Text>
              <Text style={styles.detailValue}>**** 4242</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        {success ? (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('OrderTracking', { orderId: orderNumber })}
            >
              <Text style={styles.primaryButtonText}>Track Order</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.secondaryButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.primaryButtonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.secondaryButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  successBg: {
    backgroundColor: `${colors.success}20`,
  },
  errorBg: {
    backgroundColor: `${colors.error}20`,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textLight,
    marginBottom: spacing.xl,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    ...typography.body,
    color: colors.textLight,
  },
  detailValue: {
    ...typography.body,
    fontWeight: '600',
  },
  buttonContainer: {
    padding: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default PaymentConfirmationScreen;
