/**
 * IngredientTag Component - Display individual ingredient with allergen indicator
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { theme } from '@styles/theme';
import { formatAllergenDisplay } from '@utils/allergyWarnings';

const { colors, typography, spacing, borderRadius } = theme;

const IngredientTag = ({ 
  ingredient,
  onPress,
  onRemove,
  selected = false,
  isAllergen = false,
  isExcluded = false,
  style,
}) => {
  const allergenInfo = isAllergen ? formatAllergenDisplay(ingredient.allergenType) : null;

  return (
    <Animated.View
      entering={ZoomIn}
      style={[
        styles.tag,
        selected && styles.tagSelected,
        isExcluded && styles.tagExcluded,
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        style={styles.content}
        disabled={!onPress}
      >
        {isAllergen && allergenInfo && (
          <Text style={styles.emoji}>{allergenInfo.emoji}</Text>
        )}
        <Text
          style={[
            typography.caption,
            styles.text,
            isExcluded && styles.excludedText,
          ]}
          numberOfLines={1}
        >
          {ingredient.name}
        </Text>
        {isExcluded && <Text style={styles.excludeIndicator}>✓</Text>}
      </TouchableOpacity>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
          <Text style={styles.removeIcon}>×</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.light100,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  tagSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagExcluded: {
    backgroundColor: colors.error,
    borderColor: colors.error,
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 12,
    marginRight: spacing.xs,
  },
  text: {
    color: colors.text,
    flex: 1,
  },
  selectedText: {
    color: colors.white,
  },
  excludedText: {
    color: colors.white,
    textDecorationLine: 'line-through',
  },
  excludeIndicator: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
  },
  removeButton: {
    marginLeft: spacing.xs,
    padding: spacing.xs,
  },
  removeIcon: {
    fontSize: 18,
    color: colors.error,
    fontWeight: 'bold',
  },
});

export default IngredientTag;
