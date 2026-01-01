/**
 * Customer Navigator - Main customer screens with bottom tab navigation
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@styles/theme';

import HomeScreen from '@screens/Customer/HomeScreen';
import RestaurantListScreen from '@screens/Customer/RestaurantListScreen';
import RestaurantDetailScreen from '@screens/Customer/RestaurantDetailScreen';
import MenuScreen from '@screens/Customer/MenuScreen';
import CartScreen from '@screens/Customer/CartScreen';
import CheckoutScreen from '@screens/Customer/CheckoutScreen';
import OrderTrackingScreen from '@screens/Customer/OrderTrackingScreen';
import OrderHistoryScreen from '@screens/Customer/OrderHistoryScreen';
import ProfileScreen from '@screens/Customer/ProfileScreen';
import AddressManagementScreen from '@screens/Customer/AddressManagementScreen';
import PreferencesScreen from '@screens/Customer/PreferencesScreen';
import AIAssistantScreen from '@screens/AI/AIAssistantScreen';
import PaymentMethodScreen from '@screens/Payment/PaymentMethodScreen';
import PaymentConfirmationScreen from '@screens/Payment/PaymentConfirmationScreen';
import FloatingCart from '@components/Common/FloatingCart';
import FloatingAIChat from '@components/AI/FloatingAIChat';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const { colors, spacing } = theme;

// Home Stack
const HomeStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeStack" component={HomeScreen} />
      <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
      <Stack.Screen name="Menu" component={MenuScreen} />
    </Stack.Navigator>
  );
};

// Search Stack
const SearchStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="RestaurantList" component={RestaurantListScreen} />
      <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
      <Stack.Screen name="Menu" component={MenuScreen} />
    </Stack.Navigator>
  );
};

// Orders Stack
const OrdersStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
    </Stack.Navigator>
  );
};

// Profile Stack
const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="AddressManagement" component={AddressManagementScreen} />
      <Stack.Screen name="Preferences" component={PreferencesScreen} />
    </Stack.Navigator>
  );
};

// Main Customer Navigator with bottom tabs
const CustomerNavigator = () => {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Group>
          <Stack.Screen
            name="MainTabs"
            component={BottomTabNavigator}
            options={{
              animationTypeForReplace: 'pop',
            }}
          />
        </Stack.Group>

        {/* Modal Screens */}
        <Stack.Group
          screenOptions={{
            presentation: 'modal',
            headerShown: false,
            animationEnabled: true,
          }}
        >
          <Stack.Screen
            name="Cart"
            component={CartScreen}
          />
          <Stack.Screen
            name="Checkout"
            component={CheckoutScreen}
          />
          <Stack.Screen
            name="PaymentMethod"
            component={PaymentMethodScreen}
          />
          <Stack.Screen
            name="PaymentConfirmation"
            component={PaymentConfirmationScreen}
          />
          <Stack.Screen
            name="AIAssistant"
            component={AIAssistantScreen}
          />
          <Stack.Screen
            name="OrderTracking"
            component={OrderTrackingScreen}
          />
        </Stack.Group>
      </Stack.Navigator>

      {/* Floating Overlays */}
      <FloatingCart />
      <FloatingAIChat />
    </View>
  );
};

// Bottom Tab Navigator
const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchStackNavigator}
        options={{
          tabBarLabel: 'Search',
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersStackNavigator}
        options={{
          tabBarLabel: 'Orders',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.sm,
    height: 70,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: spacing.xs,
  },
});

export default CustomerNavigator;
