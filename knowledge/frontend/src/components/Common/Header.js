/**
 * Header Component - Top navigation bar with customization options
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { theme } from '@styles/theme';

const { colors, typography, spacing, shadows } = theme;

const Header = ({
  title,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  subtitle,
  style,
  backgroundColor = colors.white,
}) => {
  return (
    <Animated.View entering={SlideInDown}>
      <SafeAreaView>
        <View style={[styles.header, { backgroundColor }, shadows.md, style]}>
          <View style={styles.leftSection}>
            {leftIcon && (
              <TouchableOpacity onPress={onLeftPress} style={styles.iconButton}>
                {leftIcon}
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.centerSection}>
            <Text style={[typography.h4, styles.title]}>{title}</Text>
            {subtitle && <Text style={[typography.caption, styles.subtitle]}>{subtitle}</Text>}
          </View>

          <View style={styles.rightSection}>
            {rightIcon && (
              <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
                {rightIcon}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 0.1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 0.8,
    alignItems: 'center',
  },
  rightSection: {
    flex: 0.1,
    alignItems: 'flex-end',
  },
  title: {
    color: colors.text,
  },
  subtitle: {
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  iconButton: {
    padding: spacing.md,
  },
});

export default Header;
