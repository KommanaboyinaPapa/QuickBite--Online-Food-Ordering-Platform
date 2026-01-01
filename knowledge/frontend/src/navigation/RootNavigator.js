/**
 * Root Navigator - Main navigation structure with Auth and Customer stacks
 */

import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import RestaurantNavigator from './RestaurantNavigator';
import DeliveryNavigator from './DeliveryNavigator';
import SplashScreen from '@screens/Common/SplashScreen';
import { theme } from '@styles/theme';

const Stack = createNativeStackNavigator();
const { colors } = theme;

const RootNavigator = ({ initialState }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, token, user } = useSelector(state => state.auth);
  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      // You can restore state here if needed
    } catch (e) {
      console.error('Error restoring token:', e);
    }
    setIsReady(true);
  };

  if (!isReady) {
    return null; // Temporarily disabled SplashScreen to fix Text component conflict
  }

  const renderMainStack = () => {
    switch (user?.userType) {
      case 'restaurant':
        return (
          <Stack.Screen
            name="RestaurantRoot"
            component={RestaurantNavigator}
            options={{ animationTypeForReplace: 'pop' }}
          />
        );
      case 'delivery_agent':
        return (
          <Stack.Screen
            name="DeliveryRoot"
            component={DeliveryNavigator}
            options={{ animationTypeForReplace: 'pop' }}
          />
        );
      default:
        // Default to Customer
        return (
          <Stack.Screen
            name="CustomerRoot"
            component={CustomerNavigator}
            options={{ animationTypeForReplace: 'pop' }}
          />
        );
    }
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        gestureEnabled: true,
        cardStyle: { backgroundColor: colors.white },
      }}
    >
      {isAuthenticated || token ? (
        // User is signed in - Render appropriate stack
        renderMainStack()
      ) : (
        // User is not signed in
        <Stack.Screen
          name="AuthRoot"
          component={AuthNavigator}
          options={{
            animationTypeForReplace: 'pop',
          }}
        />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
