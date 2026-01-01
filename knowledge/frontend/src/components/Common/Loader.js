/**
 * Loader Component - Loading indicator with animation
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { theme } from '@styles/theme';

const { colors } = theme;

const Loader = ({ 
  size = 'large',
  color = colors.primary,
  style,
  visible = true,
}) => {
  if (!visible) return null;

  return (
    <Animated.View 
      style={[styles.container, style]}
      entering={FadeIn}
      exiting={FadeOut}
    >
      <ActivityIndicator 
        size={size} 
        color={color}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});

export default Loader;
