/**
 * SplashScreen - App loading/splash screen
 * 
 * Features:
 * - Logo animation with fade and scale
 * - App name and tagline display
 * - Loading indicator
 * - Auto-navigate to home after delay
 */

import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import theme from '../../styles/theme';

const SplashScreen = ({ navigation }) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate after delay
    // Navigate after delay
    const timer = setTimeout(() => {
      if (navigation && navigation.replace) {
        // Safe navigation check
        try {
          navigation.replace('CustomerNavigator');
        } catch (error) {
          console.log("Splash navigation error", error);
          // Fallback if replace doesn't work (though it should)
          if (navigation.navigate) navigation.navigate('CustomerNavigator');
        }
      }
    }, 2000); // Reduced to 2s to be faster

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.logoBox}>
            <MaterialCommunityIcons
              name="food-takeout-box"
              size={64}
              color={theme.colors.white}
            />
          </View>
        </Animated.View>

        {/* App Name */}
        <Animated.Text
          style={[
            styles.appName,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          FoodHub
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          Your favorite food, delivered fast
        </Animated.Text>

        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons
            name="loading"
            size={32}
            color={theme.colors.primary}
            style={styles.loadingIcon}
          />
        </View>
      </View>

      {/* Bottom Text */}
      <Animated.Text
        style={[
          styles.bottomText,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        🍽️ Bringing food to your doorstep
      </Animated.Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  logoContainer: {
    marginBottom: theme.spacing.lg,
  },
  logoBox: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: theme.colors.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: theme.colors.white,
    opacity: 0.8,
    textAlign: 'center',
  },
  loadingContainer: {
    marginTop: theme.spacing.xl,
  },
  loadingIcon: {
    color: theme.colors.white,
  },
  bottomText: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    fontSize: 14,
    color: theme.colors.white,
    opacity: 0.6,
  },
});

export default SplashScreen;
