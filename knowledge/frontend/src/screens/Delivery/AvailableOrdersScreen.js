import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl, Alert } from 'react-native';
import { theme } from '@styles/theme';
import Card from '@components/Common/Card';
import Button from '@components/Common/Button';
import Ionicons from '@expo/vector-icons/Ionicons';
import orderService from '@services/orderService';
import { useFocusEffect } from '@react-navigation/native';

const { colors, typography, spacing } = theme;

const AvailableOrdersScreen = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await orderService.getAvailableOrders();
            // orderService unwraps response.data, so we get the orders array directly
            setOrders(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error('Failed to fetch available orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [])
    );

    const handleAcceptDelivery = async (orderId) => {
        try {
            await orderService.acceptDelivery(orderId);
            Alert.alert('Success', 'Delivery Accepted! Go to "Active Delivery" to track it.');
            fetchOrders(); // Refresh list to remove accepted order
        } catch (error) {
            Alert.alert('Error', 'Failed to accept delivery. It may have been taken.');
            fetchOrders();
        }
    };

    const renderOrder = ({ item }) => (
        <Card style={styles.orderCard}>
            <View style={styles.header}>
                <Text style={typography.h3}>₹{item.deliveryFee.toFixed(2)} Fee</Text>
                <Text style={typography.caption}>{item.status.toUpperCase()}</Text>
            </View>

            {/* ... */}

            <View style={styles.infoRow}>
                <Text>📦 {item.items?.length || 0} Items</Text>
                <Text>💰 Order Total: ₹{item.total.toFixed(2)}</Text>
            </View>

            <Button
                title="Accept Delivery"
                onPress={() => handleAcceptDelivery(item.id)}
                style={styles.acceptBtn}
            />
        </Card>
    );

    return (
        <View style={styles.container}>
            <Text style={[typography.h2, styles.title]}>Available Orders</Text>
            <FlatList
                data={orders}
                renderItem={renderOrder}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={fetchOrders} />
                }
                ListEmptyComponent={
                    <Text style={{ textAlign: 'center', marginTop: 20, color: colors.textSecondary }}>
                        No orders currently available for delivery.
                    </Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: spacing.md,
    },
    title: {
        marginBottom: spacing.lg,
        color: colors.text,
    },
    list: {
        gap: spacing.md,
        paddingBottom: 20,
    },
    orderCard: {
        gap: spacing.md,
        padding: spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
        marginVertical: 4,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        padding: spacing.sm,
        borderRadius: 8,
        marginVertical: spacing.sm,
    },
    acceptBtn: {
        marginTop: spacing.xs,
    }
});

export default AvailableOrdersScreen;
