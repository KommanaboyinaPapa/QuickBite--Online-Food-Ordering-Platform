import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@styles/theme';
import Card from '@components/Common/Card';

const { colors, typography, spacing } = theme;

/**
 * RecommendationCard Component
 * AI recommended menu item
 */
export default function RecommendationCard({ recommendation, onAddToCart }) {
  return (
    <Card style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={[typography.h6, styles.itemName]}>{recommendation.name}</Text>
          <Text style={[typography.caption, styles.reason]}>{recommendation.reason}</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={onAddToCart}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="flame" size={16} color={colors.warning} />
          <Text style={styles.infoLabel}>{recommendation.calories} cal</Text>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="heart" size={16} color={colors.error} />
          <Text style={styles.infoLabel}>Health Score</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={[styles.scoreValue, { color: colors.success }]}>
            {recommendation.healthScore}/10
          </Text>
        </View>
      </View>

      {recommendation.description && (
        <Text style={[typography.caption, styles.description]}>{recommendation.description}</Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  itemName: {
    color: colors.text,
    marginBottom: 4,
  },
  reason: {
    color: colors.primary,
    fontStyle: 'italic',
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  scoreValue: {
    ...typography.label,
    fontWeight: '700',
  },
  description: {
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
