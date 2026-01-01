
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@styles/theme';

// Screens
import DeliveryDashboardScreen from '@screens/Delivery/DeliveryDashboardScreen';
import AvailableOrdersScreen from '@screens/Delivery/AvailableOrdersScreen';
import ActiveDeliveryScreen from '@screens/Delivery/ActiveDeliveryScreen';
import DeliveryTrackingScreen from '@screens/Delivery/DeliveryTrackingScreen';
import DeliveryAgentProfileScreen from '@screens/Delivery/DeliveryAgentProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const { colors } = theme;

// Dashboard Stack to handle navigation to Tracking
const DashboardStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="DashboardMain" component={DeliveryDashboardScreen} />
        <Stack.Screen name="DeliveryTracking" component={DeliveryTrackingScreen} />
    </Stack.Navigator>
);

const DeliveryNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textLight,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'speedometer' : 'speedometer-outline';
                    } else if (route.name === 'Available') {
                        iconName = focused ? 'notifications' : 'notifications-outline';
                    } else if (route.name === 'Active') {
                        iconName = focused ? 'bicycle' : 'bicycle-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            {/* Replace component with Stack */}
            <Tab.Screen name="Dashboard" component={DashboardStack} />
            <Tab.Screen name="Available" component={AvailableOrdersScreen} />
            <Tab.Screen name="Active" component={ActiveDeliveryScreen} />
            <Tab.Screen name="Profile" component={DeliveryAgentProfileScreen} />
        </Tab.Navigator>
    );
};

export default DeliveryNavigator;
