import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Text,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../../components/Common/Header';
import Button from '../../components/Common/Button';
import theme from '../../styles/theme';
import { fetchOrders } from '@redux/slices/orderSlice';

/**
 * OrderHistoryScreen - Display past orders with details
 * 
 * Features:
 * - List all past orders with status
 * - Order summary (date, amount, items count)
 * - View detailed order information
 * - Reorder functionality
 * - Track past orders
 * - Filter by status
 */
const OrderHistoryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Get orders from Redux
  const orders = useSelector(state => state.order.orders || []);
  const loading = useSelector(state => state.order.loading);

  // Fetch orders when screen is focused
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchOrders());
    }, [dispatch])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchOrders());
    setRefreshing(false);
  };

  // Filter orders
  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(order => order.status === filterStatus);

  const handleOrderPress = (order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const handleReorder = () => {
    // Add items from selected order back to cart
    console.log('Reordering:', selectedOrder?.id);
    setShowOrderDetail(false);
    navigation.goBack();
  };

  const renderOrderCard = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => handleOrderPress(item)}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <Text style={styles.orderDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons
            name="store"
            size={16}
            color={theme.colors.textSecondary}
            style={styles.detailIcon}
          />
          <Text style={styles.detailText}>{item.restaurant?.name || 'Unknown Restaurant'}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons
            name="package"
            size={16}
            color={theme.colors.textSecondary}
            style={styles.detailIcon}
          />
          <Text style={styles.detailText}>{item.items?.length || 0} items</Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalAmount}>
          ₹{item.total?.toFixed(2) || '0.00'}
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={theme.colors.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );

  const orderStatuses = ['all', 'delivered', 'cancelled', 'pending'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header title="Order History" subtitle="Your past orders" />

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        {orderStatuses.map(status => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filterStatus === status && styles.filterButtonActive,
            ]}
            onPress={() => setFilterStatus(status)}
          >
            <Text
              style={[
                styles.filterText,
                filterStatus === status && styles.filterTextActive,
              ]}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        renderItem={renderOrderCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="shopping-outline"
              size={48}
              color={theme.colors.textTertiary}
            />
            <Text style={styles.emptyText}>{loading ? 'Loading...' : 'No orders yet'}</Text>
            <Text style={styles.emptySubtext}>Your orders will appear here</Text>
          </View>
        }
      />

      {/* Order Detail Modal */}
      <Modal
        visible={showOrderDetail}
        animationType="slide"
        onRequestClose={() => setShowOrderDetail(false)}
      >
        <SafeAreaView style={styles.detailModal}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowOrderDetail(false)}>
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Order Details</Text>
            <View style={{ width: 24 }} />
          </View>

          {selectedOrder && (
            <View style={styles.detailContent}>
              {/* Order Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Information</Text>
                <InfoRow
                  icon="package"
                  label="Order ID"
                  value={selectedOrder.id}
                />
                <InfoRow
                  icon="calendar"
                  label="Date"
                  value={new Date(selectedOrder.createdAt).toLocaleDateString()}
                />
                <InfoRow
                  icon="store"
                  label="Restaurant"
                  value={selectedOrder.restaurant?.name || 'Unknown Restaurant'}
                />
                <InfoRow
                  icon="information"
                  label="Status"
                  value={selectedOrder.status}
                />
              </View>

              {/* Items */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Items ({selectedOrder.items?.length})</Text>
                {selectedOrder.items?.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                    </View>
                    <Text style={styles.itemPrice}>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Pricing */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pricing</Text>
                <PricingRow
                  label="Subtotal"
                  value={selectedOrder.subtotal?.toFixed(2)}
                />
                <PricingRow
                  label="Tax"
                  value={selectedOrder.tax?.toFixed(2)}
                />
                <PricingRow
                  label="Delivery"
                  value={selectedOrder.deliveryFee?.toFixed(2)}
                />
                {selectedOrder.discount > 0 && (
                  <PricingRow
                    label="Discount"
                    value={`-${selectedOrder.discount?.toFixed(2)}`}
                  />
                )}
                <View style={styles.divider} />
                <PricingRow
                  label="Total"
                  value={selectedOrder.total?.toFixed(2)}
                  isBold
                />
              </View>

              {/* Delivery Address */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Delivery Address</Text>
                <View style={styles.addressBox}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.addressText}>
                    {selectedOrder.deliveryAddress || 'Not specified'}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                {/* Track Order - for active orders */}
                {['pending', 'confirmed', 'preparing', 'ready', 'picked_up'].includes(selectedOrder.status) && (
                  <Button
                    title="Track Order"
                    onPress={() => {
                      setShowOrderDetail(false);
                      navigation.navigate('OrderTracking', { orderId: selectedOrder.id });
                    }}
                    style={{ marginBottom: theme.spacing.md }}
                  />
                )}
                {selectedOrder.status === 'delivered' && (
                  <>
                    <Button
                      title="Reorder"
                      onPress={handleReorder}
                      style={{ marginBottom: theme.spacing.md }}
                    />
                    <Button
                      title="Leave Review"
                      variant="secondary"
                      onPress={() => {
                        console.log('Review:', selectedOrder.id);
                        setShowOrderDetail(false);
                      }}
                    />
                  </>
                )}
                {selectedOrder.status === 'pending' && (
                  <Button
                    title="Cancel Order"
                    variant="secondary"
                    onPress={() => {
                      console.log('Cancel:', selectedOrder.id);
                      setShowOrderDetail(false);
                    }}
                  />
                )}
              </View>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

/**
 * InfoRow component
 */
const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <MaterialCommunityIcons
      name={icon}
      size={18}
      color={theme.colors.primary}
      style={styles.infoIcon}
    />
    <View style={styles.infoText}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

/**
 * PricingRow component
 */
const PricingRow = ({ label, value, isBold }) => (
  <View style={styles.pricingRow}>
    <Text style={[styles.pricingLabel, isBold && styles.pricingLabelBold]}>
      {label}
    </Text>
    <Text style={[styles.pricingValue, isBold && styles.pricingValueBold]}>
      ₹{value}
    </Text>
  </View>
);

/**
 * Get status color
 */
const getStatusColor = (status) => {
  switch (status) {
    case 'delivered':
      return theme.colors.success;
    case 'cancelled':
      return theme.colors.error;
    case 'pending':
      return theme.colors.warning;
    default:
      return theme.colors.textSecondary;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  filterTextActive: {
    color: theme.colors.white,
  },
  listContent: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  orderCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  orderID: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  orderDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.white,
    textTransform: 'capitalize',
  },
  orderDetails: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: theme.spacing.sm,
  },
  detailText: {
    fontSize: 13,
    color: theme.colors.text,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  detailModal: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  detailContent: {
    flex: 1,
    padding: theme.spacing.screenPadding,
  },
  section: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  infoIcon: {
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  itemQuantity: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  pricingLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  pricingLabelBold: {
    fontWeight: '700',
    color: theme.colors.text,
  },
  pricingValue: {
    fontSize: 13,
    color: theme.colors.text,
  },
  pricingValueBold: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.text,
  },
  buttonContainer: {
    gap: theme.spacing.md,
  },
});

export default OrderHistoryScreen;
