/**
 * Card Component - Modern card container with premium shadows
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { theme } from '@styles/theme';

const { colors, spacing, borderRadius } = theme;

const Card = React.forwardRef(({
  children,
  style,
  onPress,
  variant = 'elevated',  // 'elevated', 'outlined', 'filled'
  animated = true,
  ...props
}, ref) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'outlined':
        return styles.outlined;
      case 'filled':
        return styles.filled;
      case 'elevated':
      default:
        return styles.elevated;
    }
  };

  const cardStyle = [
    styles.card,
    getVariantStyle(),
    style,
  ];

  const animationProps = animated ? {
    entering: FadeIn.duration(300),
  } : {};

  const Component = animated
    ? Animated.createAnimatedComponent(onPress ? TouchableOpacity : View)
    : (onPress ? TouchableOpacity : View);

  return (
    <Component
      ref={ref}
      style={cardStyle}
      onPress={onPress}
      activeOpacity={0.9}
      {...animationProps}
      {...props}
    >
      {children}
    </Component>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    overflow: 'hidden',
  },
  elevated: {
    backgroundColor: colors.white,
    ...Platform.select({
      ios: {
        shadowColor: colors.dark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 12px rgba(18, 25, 38, 0.08)',
      },
    }),
  },
  outlined: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filled: {
    backgroundColor: colors.light50,
  },
});

export default Card;
