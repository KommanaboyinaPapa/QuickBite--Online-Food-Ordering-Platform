/**
 * Payment Method Screen - Manage payment methods
 */

import React, { useState } from 'react';
import {
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@styles/theme';

const { colors, spacing, typography } = theme;

const PaymentMethodScreen = ({ navigation }) => {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: '1',
      type: 'card',
      cardNumber: '**** **** **** 4242',
      cardType: 'Visa',
      expiryDate: '12/25',
      isDefault: true,
    },
    {
      id: '2',
      type: 'card',
      cardNumber: '**** **** **** 5555',
      cardType: 'Mastercard',
      expiryDate: '08/26',
      isDefault: false,
    },
  ]);

  const getCardIcon = (cardType) => {
    switch (cardType.toLowerCase()) {
      case 'visa':
        return 'card';
      case 'mastercard':
        return 'card';
      default:
        return 'card-outline';
    }
  };

  const renderPaymentMethod = ({ item }) => (
    <View style={styles.paymentCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Ionicons
            name={getCardIcon(item.cardType)}
            size={32}
            color={colors.primary}
          />
          <View style={styles.cardDetails}>
            <Text style={styles.cardType}>{item.cardType}</Text>
            <Text style={styles.cardNumber}>{item.cardNumber}</Text>
            <Text style={styles.expiryDate}>Expires {item.expiryDate}</Text>
          </View>
        </View>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Set as Default</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={[styles.actionText, { color: colors.error }]}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={paymentMethods}
        renderItem={renderPaymentMethod}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add-circle" size={24} color={colors.white} />
        <Text style={styles.addButtonText}>Add Payment Method</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 18,
  },
  listContainer: {
    padding: spacing.md,
  },
  paymentCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...theme.shadows.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  cardInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  cardDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  cardType: {
    ...typography.h3,
    fontSize: 16,
    marginBottom: 4,
  },
  cardNumber: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: 4,
  },
  expiryDate: {
    ...typography.caption,
    color: colors.textLight,
  },
  defaultBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    marginRight: spacing.lg,
  },
  actionText: {
    color: colors.primary,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
});

export default PaymentMethodScreen;
