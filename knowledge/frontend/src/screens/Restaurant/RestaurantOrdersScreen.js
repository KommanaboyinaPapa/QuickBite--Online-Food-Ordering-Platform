import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl, Alert } from 'react-native';
import { theme } from '@styles/theme';
import Card from '@components/Common/Card';
import Button from '@components/Common/Button';
import orderService from '@services/orderService';
import { useFocusEffect } from '@react-navigation/native';

const { colors, typography, spacing } = theme;

const RestaurantOrdersScreen = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await orderService.getRestaurantOrders();
            console.log('=== DEBUG: Restaurant Orders ===');
            console.log('Orders received:', data);
            console.log('Orders count:', Array.isArray(data) ? data.length : 0);
            if (Array.isArray(data) && data.length > 0) {
                console.log('First order status:', data[0].status);
                console.log('First order items:', data[0].items);
                console.log('First order item exclusions:', data[0].items?.[0]?.exclusions);
            }
            // orderService already unwraps the response, so data is the orders array directly
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch restaurant orders:', error);
            // Don't show alert on every mount/refresh if just empty
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [])
    );

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            fetchOrders(); // Refresh list
        } catch (error) {
            Alert.alert('Error', 'Failed to update order status');
        }
    };

    const renderOrder = ({ item }) => {
        console.log('=== DEBUG: Rendering Order ===');
        console.log('Order ID:', item.id);
        console.log('Order status:', item.status);
        console.log('Items count:', item.items?.length);
        console.log('First item exclusions:', item.items?.[0]?.exclusions);
        
        return (
        <Card style={styles.orderCard}>
            <View style={styles.cardHeader}>
                <Text style={typography.h4}>Order #{item.orderNumber || item.id.substring(0, 8)}</Text>
                <Text style={[typography.caption, { color: colors.primary, fontWeight: 'bold' }]}>
                    {item.status ? item.status.toUpperCase() : 'NO STATUS'}
                </Text>
            </View>
            <Text style={typography.body}>{item.customer?.firstName} {item.customer?.lastName}</Text>
            
            {/* DEBUG: Show status check */}
            <View style={{ backgroundColor: '#f0f0f0', padding: 8, marginVertical: 4, borderRadius: 4 }}>
                <Text style={{ fontSize: 11, color: '#666' }}>
                    🔍 Debug: Status="{item.status}" | Is Pending? {item.status === 'pending' ? 'YES ✓' : 'NO ✗'}
                </Text>
            </View>

            <View style={styles.itemsContainer}>
                {item.items?.map((orderItem, index) => {
                    console.log(`Order item ${index}:`, orderItem);
                    console.log(`  Exclusions:`, orderItem.exclusions);
                    console.log(`  Exclusions length:`, orderItem.exclusions?.length);
                    
                    return (
                    <View key={index} style={styles.orderItemRow}>
                        <Text style={[typography.body, styles.itemName]}>
                            {orderItem.quantity}x {orderItem.menuItem?.name}
                        </Text>
                        
                        {/* DEBUG: Show exclusions data */}
                        <View style={{ backgroundColor: '#fff3cd', padding: 6, marginTop: 4, borderRadius: 4 }}>
                            <Text style={{ fontSize: 10, color: '#856404' }}>
                                🔍 Exclusions: {orderItem.exclusions?.length || 0} items
                                {orderItem.exclusions?.length > 0 && ` | Data: ${JSON.stringify(orderItem.exclusions)}`}
                            </Text>
                        </View>
                        
                        {/* Show exclusions (ingredients removed) */}
                        {orderItem.exclusions?.length > 0 && (
                            <View style={styles.exclusionsContainer}>
                                <Text style={styles.exclusionsLabel}>❌ Remove:</Text>
                                <Text style={styles.exclusionsText}>
                                    {orderItem.exclusions.map(e => e.ingredient?.name || e.ingredientId).join(', ')}
                                </Text>
                            </View>
                        )}
                        {/* Show special instructions */}
                        {orderItem.specialInstructions && (
                            <View style={styles.instructionsContainer}>
                                <Text style={styles.instructionsLabel}>📝 Note:</Text>
                                <Text style={styles.instructionsText}>
                                    {orderItem.specialInstructions}
                                </Text>
                            </View>
                        )}
                    </View>
                    );
                })}
                {/* Order-level special instructions */}
                {item.specialInstructions && (
                    <View style={styles.orderInstructions}>
                        <Text style={styles.instructionsLabel}>📋 Order Notes:</Text>
                        <Text style={styles.instructionsText}>{item.specialInstructions}</Text>
                    </View>
                )}
            </View>

            <Text style={[typography.h4, styles.totalText]}>₹{item.total.toFixed(2)}</Text>

            <View style={styles.actions}>
                {/* Pending orders - Accept or Reject */}
                {item.status === 'pending' && (
                    <View style={styles.actionRow}>
                        <Button
                            title="Accept"
                            onPress={() => handleUpdateStatus(item.id, 'confirmed')}
                            style={styles.actionBtn}
                        />
                        <Button
                            title="Reject"
                            variant="secondary"
                            onPress={() => handleUpdateStatus(item.id, 'cancelled')}
                            style={styles.actionBtn}
                        />
                    </View>
                )}
                {/* Confirmed orders - Start preparing */}
                {item.status === 'confirmed' && (
                    <Button
                        title="Start Preparing"
                        onPress={() => handleUpdateStatus(item.id, 'preparing')}
                        style={styles.actionBtn}
                    />
                )}
                {/* Preparing orders - Mark as ready */}
                {item.status === 'preparing' && (
                    <Button
                        title="Mark Ready"
                        onPress={() => handleUpdateStatus(item.id, 'ready')}
                        style={styles.actionBtn}
                    />
                )}
                {item.status === 'ready' && (
                    <Text style={{ color: colors.success, fontWeight: 'bold' }}>Waiting for Pickup</Text>
                )}
                {item.status === 'picked_up' && (
                    <Text style={{ color: colors.textSecondary }}>Picked up by agent</Text>
                )}
                {item.status === 'delivered' && (
                    <Text style={{ color: colors.success, fontWeight: 'bold' }}>✓ Delivered</Text>
                )}
                {item.status === 'cancelled' && (
                    <Text style={{ color: colors.error, fontWeight: 'bold' }}>✗ Cancelled</Text>
                )}
            </View>
        </Card>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={[typography.h2, styles.title]}>Incoming Orders</Text>
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
                        No active orders
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
        gap: spacing.xs,
        padding: spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    itemsContainer: {
        marginVertical: spacing.sm,
        gap: spacing.sm,
    },
    orderItemRow: {
        backgroundColor: colors.light50,
        padding: spacing.sm,
        borderRadius: 8,
        marginBottom: spacing.xs,
    },
    itemName: {
        fontWeight: '600',
        color: colors.text,
    },
    exclusionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: spacing.xs,
        paddingTop: spacing.xs,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    exclusionsLabel: {
        fontSize: 12,
        color: colors.error,
        fontWeight: '600',
        marginRight: 4,
    },
    exclusionsText: {
        fontSize: 12,
        color: colors.error,
        flex: 1,
    },
    instructionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: spacing.xs,
    },
    instructionsLabel: {
        fontSize: 12,
        color: colors.info,
        fontWeight: '600',
        marginRight: 4,
    },
    instructionsText: {
        fontSize: 12,
        color: colors.textSecondary,
        flex: 1,
        fontStyle: 'italic',
    },
    orderInstructions: {
        backgroundColor: colors.info + '15',
        padding: spacing.sm,
        borderRadius: 8,
        marginTop: spacing.sm,
    },
    itemsText: {
        color: colors.textSecondary,
    },
    totalText: {
        marginTop: spacing.xs,
        alignSelf: 'flex-end',
    },
    actions: {
        marginTop: spacing.md,
    },
    actionRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    actionBtn: {
        flex: 1,
    }
});

export default RestaurantOrdersScreen;
