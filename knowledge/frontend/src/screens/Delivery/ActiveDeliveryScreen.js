import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, RefreshControl, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '@styles/theme';
import Card from '@components/Common/Card';
import Button from '@components/Common/Button';
import Ionicons from '@expo/vector-icons/Ionicons';
import { deliveryService } from '@services/deliveryService';
import MapView, { Marker } from '@components/Common/Map';

const { colors, typography, spacing } = theme;

const ActiveDeliveryScreen = () => {
    const [activeOrder, setActiveOrder] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadActive = async () => {
        setLoading(true);
        try {
            const resp = await deliveryService.getMyDeliveries();
            // deliveryService returns response.data which is { success, data }
            const list = Array.isArray(resp?.data) ? resp.data : [];
            const ongoing = list.find(o => !['delivered', 'cancelled'].includes(o.status));
            setActiveOrder(ongoing || null);
        } catch (err) {
            console.error('Failed to load active delivery', err);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => {
        loadActive();
    }, []));

    const handlePickedUp = async () => {
        if (!activeOrder) return;
        await deliveryService.updateStatus(activeOrder.id, 'picked_up');
        loadActive();
    };

    const handleDelivered = async () => {
        if (!activeOrder) return;
        await deliveryService.updateStatus(activeOrder.id, 'delivered');
        loadActive();
    };

    const handleSendLocation = async () => {
        if (!activeOrder) return;
        const lat = activeOrder.tracking?.currentLatitude || activeOrder.tracking?.restaurantLatitude || 37.78825;
        const lon = activeOrder.tracking?.currentLongitude || activeOrder.tracking?.restaurantLongitude || -122.4324;
        const jitter = (Math.random() - 0.5) * 0.01;
        try {
            await deliveryService.updateDeliveryLocation(activeOrder.id, {
                latitude: lat + jitter,
                longitude: lon + jitter,
            });
            loadActive();
        } catch (err) {
            console.error('Failed to push location', err);
        }
    };

    if (!activeOrder) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="bicycle" size={64} color={colors.textLight} />
                <Text style={[typography.h3, styles.emptyText]}>No Active Delivery</Text>
                <Text style={typography.caption}>Go to Available Orders to pick one up!</Text>
                <Button
                    title="Refresh"
                    style={{ marginTop: spacing.xl }}
                    onPress={loadActive}
                />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: spacing.xl }}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={loadActive} />}
        >
            <Text style={[typography.h2, styles.title]}>Active Delivery</Text>

            <View style={styles.mapPlaceholder}>
                <MapView style={styles.map}>
                    {activeOrder.tracking?.restaurantLatitude && (
                        <Marker
                            coordinate={{
                                latitude: activeOrder.tracking.restaurantLatitude,
                                longitude: activeOrder.tracking.restaurantLongitude,
                            }}
                            title="Restaurant"
                            pinColor="red"
                        />
                    )}
                    {activeOrder.tracking?.customerLatitude && (
                        <Marker
                            coordinate={{
                                latitude: activeOrder.tracking.customerLatitude,
                                longitude: activeOrder.tracking.customerLongitude,
                            }}
                            title="Customer"
                            pinColor="blue"
                        />
                    )}
                    {activeOrder.tracking?.currentLatitude && (
                        <Marker
                            coordinate={{
                                latitude: activeOrder.tracking.currentLatitude,
                                longitude: activeOrder.tracking.currentLongitude,
                            }}
                            title="You"
                            pinColor="green"
                        />
                    )}
                </MapView>
            </View>

            <Card style={styles.orderCard}>
                <View style={styles.statusHeader}>
                    <Text style={typography.h3}>Order #{activeOrder.orderNumber || activeOrder.id}</Text>
                    <Text style={{ color: colors.primary }}>{activeOrder.status}</Text>
                </View>

                <View style={styles.timeline}>
                    <View style={styles.timelineItem}>
                        <View style={[styles.dot, { backgroundColor: colors.green }]} />
                        <View>
                            <Text style={typography.caption}>Pickup</Text>
                            <Text style={typography.body}>{activeOrder.restaurant?.name || 'Restaurant'}</Text>
                        </View>
                    </View>
                    <View style={styles.line} />
                    <View style={styles.timelineItem}>
                        <View style={[styles.dot, { backgroundColor: colors.textLight }]} />
                        <View>
                            <Text style={typography.caption}>Dropoff</Text>
                            <Text style={typography.body}>{activeOrder.deliveryAddress?.street || 'Customer'}</Text>
                        </View>
                    </View>
                </View>

                <View style={{ gap: spacing.sm }}>
                    {activeOrder.status !== 'picked_up' && activeOrder.status !== 'delivered' && (
                        <Button title="Mark Picked Up" onPress={handlePickedUp} />
                    )}
                    {activeOrder.status !== 'delivered' && (
                        <Button title="Mark Delivered" variant="secondary" onPress={handleDelivered} />
                    )}
                    <Button title="Send Location Update" variant="ghost" onPress={handleSendLocation} />
                </View>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: spacing.md,
    },
    emptyContainer: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    emptyText: {
        marginTop: spacing.md,
        marginBottom: spacing.xs,
        color: colors.textStart,
    },
    title: {
        marginBottom: spacing.md,
        color: colors.text,
    },
    mapPlaceholder: {
        height: 300,
        backgroundColor: colors.light,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: spacing.lg,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    orderCard: {
        flex: 1,
    },
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    timeline: {
        marginLeft: spacing.sm,
        marginBottom: spacing.xl,
    },
    timelineItem: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginTop: 4,
    },
    line: {
        width: 2,
        height: 30,
        backgroundColor: colors.light,
        marginLeft: 5,
        marginVertical: 4,
    },
    actionBtn: {
        marginTop: 'auto',
    }
});

export default ActiveDeliveryScreen;
