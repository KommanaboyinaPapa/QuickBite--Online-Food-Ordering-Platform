/**
 * Root App Component - Main entry point with Redux Provider and Navigation
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer, DefaultTheme, NavigationIndependentTree } from '@react-navigation/native';
import { navigationRef } from './navigation/navigationRef';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import store from '@redux/store';
import RootNavigator from '@navigation/RootNavigator';
import { theme } from '@styles/theme';
import ErrorBoundary from '@components/Common/ErrorBoundary';

const { colors } = theme;

// Configure notifications
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch (error) {
  console.warn('Notifications configuration failed:', error);
}

// Keep the splash screen visible while we fetch resources
// SplashScreen.preventAutoHideAsync();

const MyDefaultTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.white,
    card: colors.white,
    text: colors.text,
    border: colors.border,
    notification: colors.error,
  },
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      // Check if user is already logged in
      const token = await AsyncStorage.getItem('token');
      setIsSignedIn(!!token);
    } catch (e) {
      console.error('Error bootstrapping app:', e);
    } finally {
      setIsLoading(false);
      await SplashScreen.hideAsync();
    }
  };

  if (isLoading) {
    return <View style={styles.container} />;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <Provider store={store}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor={colors.white}
            translucent={false}
          />
          <NavigationIndependentTree>
            <NavigationContainer ref={navigationRef} theme={MyDefaultTheme}>
              <RootNavigator initialState={isSignedIn} />
            </NavigationContainer>
          </NavigationIndependentTree>
        </Provider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
});

export default App;
