/**
 * AllergyBadge Component - Display allergy warnings with icon and color coding
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { theme } from '@styles/theme';
import { formatAllergenDisplay } from '@utils/allergyWarnings';

const { colors, typography, spacing, borderRadius } = theme;

const AllergyBadge = ({ 
  allergen,
  onPress,
  size = 'md',
  style,
}) => {
  const allergenInfo = formatAllergenDisplay(allergen);

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.smallBadge;
      case 'lg':
        return styles.largeBadge;
      default:
        return styles.mediumBadge;
    }
  };

  const getSizeTextStyle = () => {
    switch (size) {
      case 'sm':
        return typography.labelSmall;
      case 'lg':
        return typography.label;
      default:
        return typography.labelSmall;
    }
  };

  return (
    <Animated.View
      entering={FadeIn}
      style={[
        styles.badge,
        getSizeStyle(),
        { borderColor: allergenInfo.color },
        style,
      ]}
    >
      <Text style={styles.emoji}>{allergenInfo.emoji}</Text>
      <Text style={[styles.text, getSizeTextStyle(), { color: allergenInfo.color }]}>
        {allergenInfo.name}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(255, 107, 53, 0.05)',
  },
  smallBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  mediumBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  largeBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  emoji: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  text: {
    fontWeight: '600',
  },
});

export default AllergyBadge;
