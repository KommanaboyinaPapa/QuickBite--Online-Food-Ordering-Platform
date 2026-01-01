/**
 * Auth Navigator - Authentication screens stack
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '@styles/theme';

import LoginScreen from '@screens/Auth/LoginScreen';
import RegisterScreen from '@screens/Auth/RegisterScreen';
import OTPVerificationScreen from '@screens/Auth/OTPVerificationScreen';
import ForgotPasswordScreen from '@screens/Auth/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();
const { colors } = theme;

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        gestureEnabled: true,
        cardStyle: { backgroundColor: colors.white },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          animationTypeForReplace: 'pop',
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          animationTypeForReplace: 'pop',
        }}
      />
      <Stack.Screen
        name="OTPVerification"
        component={OTPVerificationScreen}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
