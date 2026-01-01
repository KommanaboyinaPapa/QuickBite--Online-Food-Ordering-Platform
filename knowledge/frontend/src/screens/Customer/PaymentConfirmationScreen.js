import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Text,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import PaymentMethodSelector from '../../components/Payment/PaymentMethodSelector';
import PaymentForm from '../../components/Payment/PaymentForm';
import Header from '../../components/Common/Header';
import Button from '../../components/Common/Button';
import theme from '../../styles/theme';

/**
 * PaymentConfirmationScreen - Payment success/failure display
 * 
 * Features:
 * - Payment status (success/failure)
 * - Transaction details
 * - Receipt with order summary
 * - Share and download receipt
 * - Next steps recommendations
 */
const PaymentConfirmationScreen = ({ route, navigation }) => {
  const { transactionId, status, amount, orderId } = route.params || {};
  const [showReceipt, setShowReceipt] = useState(false);

  const isSuccess = status === 'success';

  const order = useSelector(state => state.order.currentOrder);

  const receiptItems = order?.items || [
    { name: 'Butter Chicken', quantity: 1, price: 12.99 },
    { name: 'Naan Bread', quantity: 2, price: 4.99 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Status Section */}
      <View style={[styles.statusSection, { backgroundColor: isSuccess ? theme.colors.success : theme.colors.error }]}>
        <MaterialCommunityIcons
          name={isSuccess ? 'check-circle' : 'close-circle'}
          size={64}
          color={theme.colors.white}
        />
        <Text style={styles.statusTitle}>
          {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
        </Text>
        <Text style={styles.statusSubtitle}>
          {isSuccess
            ? 'Your order has been confirmed'
            : 'Please try again or use a different payment method'}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {isSuccess ? (
          <>
            {/* Transaction Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Transaction Details</Text>
              <DetailRow label="Transaction ID" value={transactionId || 'TXN123456789'} />
              <DetailRow
                label="Date & Time"
                value={new Date().toLocaleString()}
              />
              <DetailRow label="Amount" value={`$${amount || '45.99'}`} isBold />
              <DetailRow label="Status" value="Confirmed" />
            </View>

            {/* Order Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Information</Text>
              <DetailRow label="Order ID" value={orderId || '#ORD123456'} />
              <DetailRow label="Estimated Delivery" value="30-40 minutes" />
              <DetailRow label="Restaurant" value="Spice Kitchen" />
            </View>

            {/* Receipt Preview */}
            <TouchableOpacity
              style={styles.receiptPreview}
              onPress={() => setShowReceipt(true)}
            >
              <MaterialCommunityIcons
                name="file-document"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.receiptText}>View Full Receipt</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            {/* Next Steps */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What's Next?</Text>
              <StepCard
                number={1}
                title="Order Confirmed"
                description="Your restaurant is preparing your order"
                icon="check-circle"
              />
              <StepCard
                number={2}
                title="On the Way"
                description="Your delivery agent will be assigned soon"
                icon="truck-fast"
              />
              <StepCard
                number={3}
                title="Delivered"
                description="Your food will arrive hot and fresh"
                icon="home-heart"
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <Button
                title="Track Order"
                onPress={() => navigation.navigate('OrderTracking', { orderId: orderId || '#ORD123456' })}
              />
              <Button
                title="Share Receipt"
                variant="secondary"
                onPress={() => console.log('Share receipt')}
              />
            </View>
          </>
        ) : (
          <>
            {/* Error Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Failed</Text>
              <Text style={styles.errorMessage}>
                Your payment could not be processed. Please try again with a different card or payment method.
              </Text>
              <DetailRow label="Reason" value="Card declined" />
              <DetailRow label="Attempt Time" value={new Date().toLocaleTimeString()} />
            </View>

            {/* Retry Section */}
            <View style={styles.retrySection}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={48}
                color={theme.colors.error}
              />
              <Text style={styles.retryTitle}>Want to try again?</Text>
              <Text style={styles.retryDescription}>
                You can retry payment using a different method or card
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <Button
                title="Retry Payment"
                onPress={() => navigation.goBack()}
              />
              <Button
                title="Go to Cart"
                variant="secondary"
                onPress={() => navigation.navigate('Cart')}
              />
            </View>
          </>
        )}
      </ScrollView>

      {/* Receipt Modal */}
      <Modal
        visible={showReceipt}
        animationType="slide"
        onRequestClose={() => setShowReceipt(false)}
      >
        <SafeAreaView style={styles.receiptModal}>
          <View style={styles.receiptModalHeader}>
            <TouchableOpacity onPress={() => setShowReceipt(false)}>
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
            <Text style={styles.receiptModalTitle}>Receipt</Text>
            <TouchableOpacity onPress={() => console.log('Download receipt')}>
              <MaterialCommunityIcons
                name="download"
                size={24}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.receiptContent}>
            {/* Header */}
            <View style={styles.receiptHeader}>
              <MaterialCommunityIcons
                name="store"
                size={32}
                color={theme.colors.primary}
              />
              <Text style={styles.receiptRestaurant}>Spice Kitchen</Text>
              <Text style={styles.receiptDate}>{new Date().toLocaleDateString()}</Text>
            </View>

            {/* Items */}
            <View style={styles.receiptItems}>
              <Text style={styles.receiptSectionTitle}>Items</Text>
              {receiptItems.map((item, index) => (
                <View key={index} style={styles.receiptItem}>
                  <View style={styles.receiptItemInfo}>
                    <Text style={styles.receiptItemName}>{item.name}</Text>
                    <Text style={styles.receiptItemQty}>Qty: {item.quantity}</Text>
                  </View>
                  <Text style={styles.receiptItemPrice}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Pricing */}
            <View style={styles.receiptPricing}>
              <PricingLine label="Subtotal" value={order?.subtotal?.toFixed(2) || '30.97'} />
              <PricingLine label="Tax" value={order?.tax?.toFixed(2) || '3.11'} />
              <PricingLine label="Delivery" value={order?.deliveryFee?.toFixed(2) || '2.50'} />
              <View style={styles.divider} />
              <PricingLine
                label="Total"
                value={order?.total?.toFixed(2) || '36.58'}
                isBold
              />
            </View>

            {/* Transaction */}
            <View style={styles.receiptTransaction}>
              <Text style={styles.receiptSectionTitle}>Transaction</Text>
              <DetailRow label="ID" value={transactionId || 'TXN123456789'} />
              <DetailRow label="Method" value="Credit Card" />
              <DetailRow label="Status" value="Confirmed" />
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.receiptFooter}>
            <Button
              title="Print Receipt"
              onPress={() => console.log('Print')}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

/**
 * DetailRow component
 */
const DetailRow = ({ label, value, isBold }) => (
  <View style={styles.detailRow}>
    <Text style={[styles.detailLabel, isBold && styles.detailLabelBold]}>
      {label}
    </Text>
    <Text style={[styles.detailValue, isBold && styles.detailValueBold]}>
      {value}
    </Text>
  </View>
);

/**
 * StepCard component
 */
const StepCard = ({ number, title, description, icon }) => (
  <View style={styles.stepCard}>
    <View style={styles.stepNumber}>
      <Text style={styles.stepNumberText}>{number}</Text>
    </View>
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepDescription}>{description}</Text>
    </View>
    <MaterialCommunityIcons
      name={icon}
      size={20}
      color={theme.colors.success}
    />
  </View>
);

/**
 * PricingLine component
 */
const PricingLine = ({ label, value, isBold }) => (
  <View style={styles.pricingLine}>
    <Text style={[styles.pricingLabel, isBold && styles.pricingLabelBold]}>
      {label}
    </Text>
    <Text style={[styles.pricingValue, isBold && styles.pricingValueBold]}>
      ${value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  statusSection: {
    paddingVertical: theme.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.white,
    marginTop: theme.spacing.lg,
  },
  statusSubtitle: {
    fontSize: 14,
    color: theme.colors.white,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.screenPadding,
  },
  content: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  section: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  detailLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  detailLabelBold: {
    fontWeight: '600',
    color: theme.colors.text,
  },
  detailValue: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: '500',
  },
  detailValueBold: {
    fontWeight: '700',
    color: theme.colors.primary,
  },
  receiptPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  receiptText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  stepDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  errorMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  retrySection: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  retryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  retryDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  receiptModal: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  receiptModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  receiptModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  receiptContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.lg,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  receiptRestaurant: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  receiptDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  receiptItems: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  receiptSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  receiptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  receiptItemInfo: {
    flex: 1,
  },
  receiptItemName: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.text,
  },
  receiptItemQty: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  receiptItemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  receiptPricing: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  pricingLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
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
  receiptTransaction: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  receiptFooter: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});

export default PaymentConfirmationScreen;
