
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Switch, Alert, Platform } from 'react-native';
import MapView, { Marker } from '@components/Common/Map';
import { theme } from '@styles/theme';
import Button from '@components/Common/Button';
import socketService from '@services/socketService';

const { colors, typography, spacing } = theme;

const DeliveryTrackingScreen = ({ route, navigation }) => {
    // In a real app, we would get orderId from the active assigned order
    const orderId = 'mock-order-1';
    const [isTracking, setIsTracking] = useState(false);
    const [location, setLocation] = useState({
        latitude: 37.78825,
        longitude: -122.4324
    });

    useEffect(() => {
        socketService.connect();
        return () => socketService.leaveOrder(orderId);
    }, []);

    // Simulate GPS Updates
    useEffect(() => {
        let interval;
        if (isTracking) {
            console.log('Starting delivery tracking...');
            socketService.joinOrder(orderId); // Agent joins room to broadcast

            interval = setInterval(() => {
                setLocation(prev => {
                    const newLoc = {
                        latitude: prev.latitude + 0.0001, // Simulate moving North
                        longitude: prev.longitude + 0.0001 // Simulate moving East
                    };

                    // Emit to server
                    socketService.updateLocation(orderId, newLoc);
                    return newLoc;
                });
            }, 3000); // Update every 3 seconds
        } else {
            if (interval) clearInterval(interval);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isTracking]);

    const handleToggleTracking = () => {
        setIsTracking(!isTracking);
        if (!isTracking) {
            Alert.alert('Delivery Started', 'You are now broadcasting your location to the customer.');
        } else {
            Alert.alert('Delivery Paused', 'Location broadcasting stopped.');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={typography.h4}>Active Delivery</Text>
                    <Text style={typography.caption}>Order #{orderId}</Text>
                </View>
                <View style={styles.statusContainer}>
                    <Text style={styles.statusText}>{isTracking ? 'LIVE' : 'IDLE'}</Text>
                    <Switch
                        value={isTracking}
                        onValueChange={handleToggleTracking}
                        trackColor={{ true: colors.primary }}
                    />
                </View>
            </View>

            <MapView
                style={styles.map}
                region={Platform.OS !== 'web' ? {
                    ...location,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01
                } : undefined}
            >
                <Marker coordinate={location} title="You (Driver)" pinColor="green" />
            </MapView>

            <View style={styles.footer}>
                <Button
                    title={isTracking ? "Complete Delivery" : "Start Navigation"}
                    onPress={() => {
                        if (isTracking) {
                            setIsTracking(false);
                            navigation.goBack();
                        } else {
                            handleToggleTracking();
                        }
                    }}
                    variant={isTracking ? "secondary" : "primary"}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        padding: spacing.md,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50 // Safe area
    },
    statusContainer: {
        alignItems: 'center',
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.textSecondary,
        marginBottom: 4
    },
    mapContainer: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    webPlaceholder: {
        flex: 1,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center'
    },
    footer: {
        padding: spacing.md,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    }
});

export default DeliveryTrackingScreen;
