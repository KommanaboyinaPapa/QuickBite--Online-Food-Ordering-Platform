import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@styles/theme';
import Card from '@components/Common/Card';

const { colors, typography, spacing } = theme;

/**
 * PaymentMethodSelector Component
 * Select from available payment methods
 */
export default function PaymentMethodSelector({ selected, onSelect, methods }) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {methods?.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[styles.methodCard, selected === method.id && styles.selectedCard]}
          onPress={() => onSelect(method.id)}
        >
          <Ionicons name={method.icon} size={24} color={colors.primary} />
          <View style={styles.methodInfo}>
            <Text style={styles.methodLabel}>{method.label}</Text>
            {method.details && <Text style={styles.methodDetails}>{method.details}</Text>}
          </View>
          {selected === method.id && (
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedCard: { backgroundColor: 'rgba(103, 58, 183, 0.05)' },
  methodInfo: { flex: 1 },
  methodLabel: { ...typography.body, color: colors.text, fontWeight: '600' },
  methodDetails: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
