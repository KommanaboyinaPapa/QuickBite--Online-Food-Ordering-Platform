import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useOrder } from '@hooks/useOrder';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@styles/theme';
import Button from '@components/Common/Button';
import OrderSummary from '@components/Order/OrderSummary';
import { paymentService } from '@services/paymentService';
import { fetchAddresses, addAddress } from '../../redux/slices/userSlice';

const { colors, typography, spacing } = theme;

export default function CheckoutScreen({ navigation }) {
  const { createOrder } = useOrder();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const cart = useSelector((state) => state.cart);

  const [selectedAddress, setSelectedAddress] = useState(user.addresses?.[0]?.id || null);
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    postalCode: '',
    addressType: 'home',
    isDefault: false,
  });

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  useEffect(() => {
    if (showAddressModal) {
      dispatch(fetchAddresses());
      if (!user.addresses?.length) {
        setShowAddressForm(true);
      }
    } else {
      setShowAddressForm(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAddressModal]);

  const deliveryAddress = useMemo(
    () => user.addresses?.find((addr) => addr.id === selectedAddress),
    [user.addresses, selectedAddress]
  );

  useEffect(() => {
    if (!user.addresses?.length) return;

    // Prefer default address when available, otherwise fall back to first
    const defaultAddress = user.addresses.find((addr) => addr.isDefault);
    const firstAddress = user.addresses[0];

    if (!selectedAddress) {
      setSelectedAddress((defaultAddress || firstAddress)?.id || null);
    } else {
      const stillExists = user.addresses.some((addr) => addr.id === selectedAddress);
      if (!stillExists) {
        setSelectedAddress((defaultAddress || firstAddress)?.id || null);
      }
    }
  }, [user.addresses, selectedAddress]);

  const paymentMethods = [
    { id: 'card', label: 'Credit/Debit Card', icon: 'card' },
    { id: 'wallet', label: 'Wallet', icon: 'wallet' },
    { id: 'upi', label: 'UPI', icon: 'swap-horizontal' },
    { id: 'cash', label: 'Cash', icon: 'cash' },
  ];

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Select delivery address');
      return;
    }
    if (!cart.restaurantId) {
      alert('Select restaurant items again – missing restaurant.');
      return;
    }
    try {
      // 1. Create Order
      const newOrder = await createOrder({
        restaurantId: cart.restaurantId,
        items: cart.items,
        deliveryAddressId: selectedAddress,
        paymentMethod: selectedPayment,
        specialInstructions,
        total: cart.total,
      });

      // 2. Initiate Payment
      const paymentData = await paymentService.initiatePayment(newOrder.id, {
        paymentMethod: selectedPayment
      });

      // 3. Handle Payment Flow
      if (selectedPayment === 'card' || selectedPayment === 'razorpay') {
        const { isMock, razorpayOrderId } = paymentData.data;

        if (isMock) {
          // Mock Payment Flow
          alert('Test Payment Mode: Simulating Success...');

          await paymentService.verifyPayment({
            orderId: newOrder.id,
            razorpayOrderId: razorpayOrderId,
            razorpayPaymentId: `pay_mock_${Date.now()}`,
            razorpaySignature: 'mock_signature' // Backend accepts this for mock orders
          });

          navigation.navigate('OrderTracking', { orderId: newOrder.id });
        } else {
          // Real Razorpay Flow (Not fully implemented without native module on web)
          alert('Real Payment Gateway requires generic setup. Please usage Test Mode for now.');
        }
      } else {
        // Cash / Other
        navigation.navigate('OrderTracking', { orderId: newOrder.id });
      }

    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to place order';
      console.error('Order Error:', error);
      alert(message);
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[typography.h4, styles.headerTitle]}>Checkout</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={[typography.h6, styles.sectionTitle]}>Delivery Address</Text>
        <TouchableOpacity style={styles.card} onPress={() => setShowAddressModal(true)}>
          <Ionicons name="location" size={20} color={colors.primary} />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              {deliveryAddress?.street || 'Select Address'}
            </Text>
            <Text style={styles.cardSubtitle}>
              {[deliveryAddress?.city, deliveryAddress?.postalCode].filter(Boolean).join(' ')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <Text style={[typography.h6, styles.sectionTitle]}>Special Instructions</Text>
        <TextInput
          style={styles.input}
          placeholder="Any special requests?"
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={200}
          value={specialInstructions}
          onChangeText={setSpecialInstructions}
        />

        <Text style={[typography.h6, styles.sectionTitle]}>Payment</Text>
        <TouchableOpacity style={styles.card} onPress={() => setShowPaymentModal(true)}>
          <Ionicons
            name={paymentMethods.find((p) => p.id === selectedPayment)?.icon}
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.cardTitle, { flex: 1 }]}>
            {paymentMethods.find((p) => p.id === selectedPayment)?.label}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <OrderSummary
          subtotal={cart.subtotal}
          tax={cart.tax}
          deliveryFee={cart.deliveryFee}
          discount={cart.discount}
          total={cart.total}
        />

        <View style={{ height: spacing.lg }} />
      </ScrollView>

      <View style={styles.footer}>
        <Button title={`Place Order - ₹${cart.total?.toFixed(2)}`} onPress={handlePlaceOrder} />
      </View>

      <Modal visible={showAddressModal} animationType="slide" transparent onRequestClose={() => setShowAddressModal(false)}>
        <TouchableOpacity activeOpacity={1} style={styles.modal} onPress={() => setShowAddressModal(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeaderRow}>
              <Text style={[typography.h5, styles.modalTitle]}>Select Delivery Address</Text>
              <TouchableOpacity onPress={() => setShowAddressForm((prev) => !prev)}>
                <Ionicons
                  name={showAddressForm ? 'remove-circle-outline' : 'add-circle-outline'}
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>

            {user.addresses?.length ? (
              user.addresses.map((addr) => (
                <TouchableOpacity
                  key={addr.id}
                  style={[styles.option, selectedAddress === addr.id && styles.selectedOption]}
                  onPress={() => {
                    setSelectedAddress(addr.id);
                    setShowAddressModal(false);
                  }}
                >
                  {selectedAddress === addr.id && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionText}>{addr.addressType || 'Address'}</Text>
                    <Text style={styles.optionSub}>{addr.street}</Text>
                    <Text style={styles.optionSub}>{[addr.city, addr.postalCode].filter(Boolean).join(' ')}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyState}>No saved addresses. Add one to continue.</Text>
            )}

            {showAddressForm && (
              <View style={styles.formCard}>
                <Text style={[typography.h6, styles.modalSubtitle]}>Add New Address</Text>
                <TextInput
                  style={styles.inputInline}
                  placeholder="Street and house no."
                  value={newAddress.street}
                  onChangeText={(v) => setNewAddress({ ...newAddress, street: v })}
                />
                <TextInput
                  style={styles.inputInline}
                  placeholder="City"
                  value={newAddress.city}
                  onChangeText={(v) => setNewAddress({ ...newAddress, city: v })}
                />
                <TextInput
                  style={styles.inputInline}
                  placeholder="Postal Code"
                  keyboardType="numeric"
                  value={newAddress.postalCode}
                  onChangeText={(v) => setNewAddress({ ...newAddress, postalCode: v })}
                />
                <TextInput
                  style={styles.inputInline}
                  placeholder="Address Type (home, work, other)"
                  value={newAddress.addressType}
                  onChangeText={(v) => setNewAddress({ ...newAddress, addressType: v })}
                />
                <View style={styles.formActions}>
                  <Button
                    title="Save Address"
                    onPress={async () => {
                      if (!newAddress.street.trim()) {
                        Alert.alert('Add address', 'Please enter street and house number.');
                        return;
                      }
                      if (!newAddress.city.trim() || !newAddress.postalCode.trim()) {
                        Alert.alert('Add address', 'City and postal code are required.');
                        return;
                      }
                      try {
                        const added = await dispatch(addAddress(newAddress)).unwrap();
                        await dispatch(fetchAddresses());
                        setSelectedAddress(added?.id || null);
                        setNewAddress({ street: '', city: '', postalCode: '', addressType: 'home', isDefault: false });
                        setShowAddressForm(false);
                        setShowAddressModal(false);
                      } catch (err) {
                        Alert.alert('Add address failed', err?.message || 'Please try again');
                      }
                    }}
                  />
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowAddressForm(false);
                      setNewAddress({ street: '', city: '', postalCode: '', addressType: 'home', isDefault: false });
                    }}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showPaymentModal} animationType="slide" transparent onRequestClose={() => setShowPaymentModal(false)}>
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={[typography.h5, styles.modalTitle]}>Payment Method</Text>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[styles.option, selectedPayment === method.id && styles.selectedOption]}
                onPress={() => {
                  setSelectedPayment(method.id);
                  setShowPaymentModal(false);
                }}
              >
                <Ionicons name={method.icon} size={20} color={colors.primary} />
                <Text style={[styles.optionText, { flex: 1 }]}>{method.label}</Text>
                {selectedPayment === method.id && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { color: colors.text, flex: 1, textAlign: 'center' },
  content: { flex: 1, padding: spacing.md },
  sectionTitle: { color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.light50,
    borderRadius: 8,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  cardContent: { flex: 1 },
  cardTitle: { ...typography.body, color: colors.text, fontWeight: '600' },
  cardSubtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
    minHeight: 80,
    marginBottom: spacing.lg,
  },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  modal: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
    padding: spacing.md,
  },
  modalTitle: { color: colors.text, marginBottom: spacing.md },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedOption: { backgroundColor: 'rgba(103, 58, 183, 0.05)' },
  optionText: { ...typography.body, color: colors.text, flex: 1 },
  optionSub: { ...typography.caption, color: colors.textSecondary },
  modalSubtitle: { color: colors.text, marginVertical: spacing.sm },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  emptyState: {
    ...typography.body,
    color: colors.textSecondary,
    paddingVertical: spacing.md,
  },
  formCard: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  inputInline: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
    minHeight: 48,
  },
  formActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  cancelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cancelText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
