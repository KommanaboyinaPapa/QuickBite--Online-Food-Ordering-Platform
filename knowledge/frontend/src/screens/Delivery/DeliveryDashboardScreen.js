import React, { useState } from 'react';
import { StyleSheet, View, Text, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '@styles/theme';
import Card from '@components/Common/Card';
import Ionicons from '@expo/vector-icons/Ionicons';
import { deliveryService } from '@services/deliveryService';
import statsService from '@services/statsService';

const { colors, typography, spacing } = theme;

const DeliveryDashboardScreen = ({ navigation }) => {
    const [isOnline, setIsOnline] = useState(true);
    const [availableOrders, setAvailableOrders] = useState([]);
    const [myStats, setMyStats] = useState({
        todayEarnings: 0,
        deliveriesCompleted: 0,
        rating: 5.0,
        hoursOnline: 0
    });

    useFocusEffect(
        React.useCallback(() => {
            loadDashboard();
        }, [])
    );

    const loadDashboard = async () => {
        try {
            // Fetch available orders
            const response = await deliveryService.getAvailableOrders();
            const ordersData = response?.data || [];
            setAvailableOrders(Array.isArray(ordersData) ? ordersData : []);

            // Fetch real stats from API
            const statsData = await statsService.getDeliveryAgentStats();
            setMyStats({
                todayEarnings: statsData.today?.earnings || 0,
                deliveriesCompleted: statsData.today?.deliveries || 0,
                rating: statsData.rating || 5.0,
                hoursOnline: statsData.today?.hoursOnline || 0
            });
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        }
    };

    const handleAcceptOrder = async (orderId) => {
        try {
            await deliveryService.acceptOrder(orderId);
            loadDashboard(); // Refresh list to remove accepted order
            alert('Order Accepted! Go to "Active Delivery" tab.');
        } catch (error) {
            alert('Failed to accept order. It might be taken.');
            loadDashboard();
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={[typography.h2, styles.title]}>Dashboard</Text>
                <View style={styles.statusContainer}>
                    <Text style={[typography.body, { color: isOnline ? colors.green : colors.textSecondary }]}>
                        {isOnline ? 'Online' : 'Offline'}
                    </Text>
                    <Switch
                        value={isOnline}
                        onValueChange={setIsOnline}
                        trackColor={{ false: colors.light, true: colors.green }}
                    />
                </View>
            </View>

            <Card style={styles.earningCard}>
                <Text style={[typography.body, { color: colors.white }]}>Today's Earnings</Text>
                <Text style={[typography.h1, { color: colors.white, fontSize: 36 }]}>${myStats.todayEarnings.toFixed(2)}</Text>
            </Card>

            <View style={styles.statsGrid}>
                <Card style={styles.statCard}>
                    <Ionicons name="bicycle" size={24} color={colors.primary} />
                    <Text style={typography.h3}>{myStats.deliveriesCompleted}</Text>
                    <Text style={typography.caption}>Deliveries</Text>
                </Card>

                <Card style={styles.statCard}>
                    <Ionicons name="star" size={24} color={colors.ratingGold} />
                    <Text style={typography.h3}>{myStats.rating}</Text>
                    <Text style={typography.caption}>Rating</Text>
                </Card>

                <Card style={styles.statCard}>
                    <Ionicons name="time" size={24} color={colors.text} />
                    <Text style={typography.h3}>{myStats.hoursOnline}h</Text>
                    <Text style={typography.caption}>Online Time</Text>
                </Card>
            </View>

            <Text style={[typography.h3, styles.sectionTitle]}>Available Orders</Text>
            {availableOrders.length === 0 ? (
                <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 20 }}>No orders currently available.</Text>
            ) : (
                availableOrders.map(order => (
                    <Card key={order.id} style={styles.activityCard}>
                        <View style={{ flex: 1 }}>
                            <Text style={typography.h4}>Order #{order.orderNumber}</Text>
                            <Text style={typography.caption}>Pickup: {order.restaurant.name}</Text>
                            <Text style={typography.caption}>Drop: {order.deliveryAddress.street}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={[typography.h4, { color: colors.green, marginBottom: 5 }]}>+₹{order.deliveryFee.toFixed(2)}</Text>
                            <TouchableOpacity
                                onPress={() => handleAcceptOrder(order.id)}
                                style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 }}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Accept</Text>
                            </TouchableOpacity>
                        </View>
                    </Card>
                ))
            )}

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        color: colors.text,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    earningCard: {
        backgroundColor: colors.primary,
        alignItems: 'center',
        marginBottom: spacing.xl,
        paddingVertical: spacing.xl,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    statCard: {
        flex: 1,
        minWidth: '28%',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.md,
    },
    sectionTitle: {
        marginBottom: spacing.md,
        color: colors.text,
    },
    activityCard: {
        marginBottom: spacing.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    }
});

export default DeliveryDashboardScreen;
