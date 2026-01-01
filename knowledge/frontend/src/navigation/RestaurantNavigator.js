import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@styles/theme';

// Screens
import RestaurantDashboardScreen from '@screens/Restaurant/RestaurantDashboardScreen';
import ManageMenuScreen from '@screens/Restaurant/ManageMenuScreen';
import RestaurantOrdersScreen from '@screens/Restaurant/RestaurantOrdersScreen';
import RestaurantProfileScreen from '@screens/Restaurant/RestaurantProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const { colors } = theme;

const RestaurantNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textLight,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                    } else if (route.name === 'Menu') {
                        iconName = focused ? 'restaurant' : 'restaurant-outline';
                    } else if (route.name === 'Orders') {
                        iconName = focused ? 'list' : 'list-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={RestaurantDashboardScreen} />
            <Tab.Screen name="Orders" component={RestaurantOrdersScreen} />
            <Tab.Screen name="Menu" component={ManageMenuScreen} />
            <Tab.Screen name="Profile" component={RestaurantProfileScreen} />
        </Tab.Navigator>
    );
};

export default RestaurantNavigator;
