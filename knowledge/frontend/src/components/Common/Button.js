/**
 * Button Component - Modern, vibrant button styles
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { theme } from '@styles/theme';

const { colors, typography, spacing } = theme;

const Button = React.forwardRef(({
  onPress,
  title,
  variant = 'primary',  // 'primary', 'secondary', 'outline', 'ghost', 'danger', 'success'
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  children,
  ...props
}, ref) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button];

    // Size variants
    switch (size) {
      case 'sm':
        baseStyle.push(styles.smallButton);
        break;
      case 'lg':
        baseStyle.push(styles.largeButton);
        break;
      default:
        baseStyle.push(styles.mediumButton);
    }

    // Color variants
    switch (variant) {
      case 'secondary':
        baseStyle.push(styles.secondaryButton);
        break;
      case 'danger':
        baseStyle.push(styles.dangerButton);
        break;
      case 'success':
        baseStyle.push(styles.successButton);
        break;
      case 'outline':
        baseStyle.push(styles.outlineButton);
        break;
      case 'ghost':
        baseStyle.push(styles.ghostButton);
        break;
      default:
        baseStyle.push(styles.primaryButton);
    }

    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }

    if (disabled || loading) {
      baseStyle.push(styles.disabledButton);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.buttonText];

    switch (size) {
      case 'sm':
        baseStyle.push(styles.textSmall);
        break;
      case 'lg':
        baseStyle.push(styles.textLarge);
        break;
      default:
        baseStyle.push(styles.textMedium);
    }

    if (variant === 'outline' || variant === 'ghost') {
      baseStyle.push({ color: colors.primary });
    } else if (variant === 'secondary') {
      baseStyle.push({ color: colors.white });
    } else if (disabled || loading) {
      baseStyle.push({ color: colors.textLight });
    } else {
      baseStyle.push({ color: colors.white });
    }

    return baseStyle;
  };

  const content = (
    <>
      {icon && iconPosition === 'left' && <>{icon}</>}
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.white}
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>
          {title || children}
        </Text>
      )}
      {icon && iconPosition === 'right' && <>{icon}</>}
    </>
  );

  return (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
      <TouchableOpacity
        ref={ref}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.85}
        style={[getButtonStyle(), style]}
        {...props}
      >
        {content}
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  fullWidth: {
    width: '100%',
  },
  smallButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
    borderRadius: 8,
  },
  mediumButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    minHeight: 48,
  },
  largeButton: {
    paddingHorizontal: 32,
    paddingVertical: 18,
    minHeight: 56,
    borderRadius: 16,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: `0 4px 12px ${colors.primary}40`,
      },
    }),
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
    ...Platform.select({
      ios: {
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  dangerButton: {
    backgroundColor: colors.error,
    ...Platform.select({
      ios: {
        shadowColor: colors.error,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  successButton: {
    backgroundColor: colors.success,
    ...Platform.select({
      ios: {
        shadowColor: colors.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textSmall: {
    fontSize: 13,
  },
  textMedium: {
    fontSize: 15,
  },
  textLarge: {
    fontSize: 17,
  },
});

export default Button;
