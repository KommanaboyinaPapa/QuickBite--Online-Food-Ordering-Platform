/**
 * Animations Configuration
 * Reanimated v3 animation presets and configurations
 */

import { Easing } from 'react-native-reanimated';

export const animationConfig = {
  // Durations (ms)
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 800,
  },
  
  // Easing functions
  easing: {
    linear: Easing.linear,
    easeIn: Easing.in(Easing.ease),
    easeOut: Easing.out(Easing.ease),
    easeInOut: Easing.inOut(Easing.ease),
    easeInCubic: Easing.in(Easing.cubic),
    easeOutCubic: Easing.out(Easing.cubic),
    easeInOutCubic: Easing.inOut(Easing.cubic),
    circIn: Easing.in(Easing.circle),
    circOut: Easing.out(Easing.circle),
    circInOut: Easing.inOut(Easing.circle),
    bezier: Easing.bezier(0.42, 0, 0.58, 1),
  },
  
  // Preset animations
  fadeIn: {
    duration: 300,
    easing: Easing.out(Easing.ease),
  },
  
  fadeOut: {
    duration: 200,
    easing: Easing.in(Easing.ease),
  },
  
  slideInRight: {
    duration: 300,
    easing: Easing.out(Easing.cubic),
  },
  
  slideInLeft: {
    duration: 300,
    easing: Easing.out(Easing.cubic),
  },
  
  slideOutRight: {
    duration: 250,
    easing: Easing.in(Easing.cubic),
  },
  
  slideOutLeft: {
    duration: 250,
    easing: Easing.in(Easing.cubic),
  },
  
  scaleIn: {
    duration: 300,
    easing: Easing.out(Easing.cubic),
  },
  
  scaleOut: {
    duration: 250,
    easing: Easing.in(Easing.cubic),
  },
  
  bounce: {
    duration: 400,
    easing: Easing.bounce,
  },
  
  // Transition configurations
  transition: {
    fast: {
      duration: 200,
      easing: Easing.out(Easing.ease),
    },
    normal: {
      duration: 300,
      easing: Easing.out(Easing.ease),
    },
    slow: {
      duration: 500,
      easing: Easing.out(Easing.ease),
    },
  },
};

/**
 * Common animation timing values
 */
export const animationTiming = {
  veryFast: 150,
  fast: 250,
  normal: 350,
  slow: 500,
  verySlow: 750,
};

/**
 * Interpolation ranges for common animations
 */
export const interpolationRanges = {
  opacity: {
    range: [0, 1],
    outputRange: [0, 1],
  },
  
  translateX: {
    range: [0, 100],
    outputRange: [50, 0],
  },
  
  translateY: {
    range: [0, 100],
    outputRange: [50, 0],
  },
  
  scale: {
    range: [0, 100],
    outputRange: [0.8, 1],
  },
};

export default animationConfig;
