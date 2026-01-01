
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Text, Platform, Alert, TouchableOpacity, Modal, Linking, SafeAreaView } from 'react-native';
import MapView, { Marker } from '@components/Common/Map';
import { theme } from '@styles/theme';
import socketService from '@services/socketService';
import Button from '@components/Common/Button';
import Ionicons from '@expo/vector-icons/Ionicons';

const { colors, typography, spacing } = theme;

// MapView handles platform rendering internally
const PlatformMapView = MapView;

import { useOrderTracking } from '../../hooks/useOrderTracking';
import moment from 'moment';

const OrderTrackingScreen = ({ route, navigation }) => {
  const { orderId } = route.params || { orderId: 'mock-order-1' };
  const { order, loading } = useOrderTracking(orderId);
  const [driverLocation, setDriverLocation] = useState(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const prevStatusRef = useRef(null);

  // Simple status -> label mapping
  const timeline = useMemo(() => ([
    { key: 'pending', label: 'Pending' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready', label: 'Ready for pickup' },
    { key: 'picked_up', label: 'Picked up' },
    { key: 'delivered', label: 'Delivered' },
  ]), []);

  // Derive location from order tracking data if available
  useEffect(() => {
    if (order?.tracking?.currentLatitude && order?.tracking?.currentLongitude) {
      setDriverLocation({
        latitude: order.tracking.currentLatitude,
        longitude: order.tracking.currentLongitude
      });
    }
  }, [order]);

  // Notify on status change
  useEffect(() => {
    if (!order?.status) return;
    const prev = prevStatusRef.current;
    if (prev && prev !== order.status) {
      Alert.alert('Order update', `Status changed to ${order.status.replace('_', ' ')}`);
    }
    prevStatusRef.current = order.status;
  }, [order?.status]);

  const etaDisplay = order?.estimatedDeliveryTime
    ? moment(order.estimatedDeliveryTime).format('h:mm A')
    : 'Calculating...';

  // Use dynamic locations from order if available, else static
  const restaurantLoc = {
    latitude: order?.tracking?.restaurantLatitude || 37.78825,
    longitude: order?.tracking?.restaurantLongitude || -122.4324
  };
  const customerLoc = {
    latitude: order?.tracking?.customerLatitude || 37.79825,
    longitude: order?.tracking?.customerLongitude || -122.4224
  };

  // Get driver info from order
  const driver = order?.deliveryAgent || null;
  const hasDriver = driver !== null;

  const handleBack = () => {
    // Navigate to the Orders tab, then the OrderHistory screen
    navigation.navigate('MainTabs', {
      screen: 'Orders',
      params: {
        screen: 'OrderHistory'
      }
    });
  };

  const handleCallDriver = () => {
    if (driver?.phone) {
      Linking.openURL(`tel:${driver.phone}`);
    } else {
      Alert.alert('Cannot Call', 'Driver phone number is not available.');
    }
  };

  const handleContactDriver = () => {
    if (!hasDriver) {
      Alert.alert('No Driver Assigned', 'A driver will be assigned once your order is ready for pickup.');
      return;
    }
    setShowDriverModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={typography.h4}>Order #{order?.orderNumber || '...'}</Text>
          <Text style={[typography.caption, { color: colors.primary }]}>
            {order?.status?.toUpperCase().replace('_', ' ') || 'LOADING...'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleContactDriver} style={styles.helpButton}>
          <Ionicons name="call-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <PlatformMapView style={styles.map}>
          {Platform.OS !== 'web' && (
            <>
              <Marker coordinate={restaurantLoc} title="Restaurant" pinColor="red" />
              <Marker coordinate={customerLoc} title="You" pinColor="blue" />
              {driverLocation && <Marker coordinate={driverLocation} title="Driver" pinColor="green" />}
            </>
          )}
        </PlatformMapView>

        <View style={styles.webOverlay}>
          <Text style={typography.h4}>Status: {order?.status?.replace('_', ' ')}</Text>
          <Text>ETA: {etaDisplay}</Text>
          {order?.status === 'delivered' && <Text style={{ color: 'green', fontWeight: 'bold' }}>Order Arrived!</Text>}
        </View>
      </View>

      {/* Driver Info Card (when assigned) */}
      {hasDriver && (
        <View style={styles.driverCard}>
          <View style={styles.driverAvatar}>
            <Ionicons name="person" size={24} color={colors.white} />
          </View>
          <View style={styles.driverInfo}>
            <Text style={typography.h5}>{driver.firstName} {driver.lastName}</Text>
            <Text style={typography.caption}>Your Delivery Partner</Text>
          </View>
          <TouchableOpacity onPress={handleCallDriver} style={styles.callButton}>
            <Ionicons name="call" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      )}

      {/* Status timeline */}
      <View style={styles.timelineContainer}>
        {timeline.map((step, index) => {
          const isReached = order?.status && timeline.findIndex(s => s.key === order.status) >= index;
          return (
            <View key={step.key} style={styles.timelineItem}>
              <View style={[styles.dot, isReached ? styles.dotActive : styles.dotInactive]} />
              <Text style={[typography.caption, styles.timelineLabel, isReached && { color: colors.primary }]}>
                {step.label}
              </Text>
              {index < timeline.length - 1 && <View style={[styles.line, isReached ? styles.lineActive : styles.lineInactive]} />}
            </View>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={typography.h4}>Estimated Arrival: {etaDisplay}</Text>
        <Button
          title={hasDriver ? "Contact Driver" : "Driver Not Assigned"}
          variant="secondary"
          onPress={handleContactDriver}
          disabled={!hasDriver}
        />
      </View>

      {/* Driver Details Modal */}
      <Modal
        visible={showDriverModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDriverModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={typography.h3}>Driver Details</Text>
              <TouchableOpacity onPress={() => setShowDriverModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {driver && (
              <View style={styles.driverDetails}>
                <View style={styles.driverAvatarLarge}>
                  <Ionicons name="person" size={48} color={colors.white} />
                </View>

                <Text style={[typography.h2, { textAlign: 'center', marginTop: spacing.md }]}>
                  {driver.firstName} {driver.lastName}
                </Text>

                <View style={styles.detailRow}>
                  <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
                  <Text style={[typography.body, { marginLeft: spacing.sm }]}>
                    {driver.phone || 'Not available'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
                  <Text style={[typography.body, { marginLeft: spacing.sm }]}>
                    {driver.email || 'Not available'}
                  </Text>
                </View>

                <View style={styles.modalButtons}>
                  <Button
                    title="Call Driver"
                    onPress={() => {
                      setShowDriverModal(false);
                      handleCallDriver();
                    }}
                    fullWidth
                    icon="call"
                  />
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerInfo: {
    flex: 1,
  },
  helpButton: {
    padding: spacing.xs,
  },
  mapContainer: {
    flex: 1,
    position: 'relative'
  },
  map: {
    width: '100%',
    height: '100%',
  },
  webOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.light50,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  timelineItem: {
    flex: 1,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: spacing.xs,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  dotInactive: {
    backgroundColor: colors.border,
  },
  line: {
    position: 'absolute',
    top: 6,
    right: -30,
    width: 60,
    height: 2,
  },
  lineActive: {
    backgroundColor: colors.primary,
  },
  lineInactive: {
    backgroundColor: colors.border,
  },
  timelineLabel: {
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    paddingBottom: spacing.xl + 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  driverDetails: {
    alignItems: 'center',
  },
  driverAvatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  modalButtons: {
    marginTop: spacing.xl,
    width: '100%',
    paddingHorizontal: spacing.lg,
  },
});

export default OrderTrackingScreen;

