import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@styles/theme';
import Button from '@components/Common/Button';

const { colors, typography, spacing } = theme;

/**
 * PaymentForm Component
 * Razorpay payment form
 */
export default function PaymentForm({ amount, onSubmit, isLoading }) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (!cardNumber || !expiry || !cvv || !name) {
      alert('Please fill all fields');
      return;
    }
    onSubmit?.({ cardNumber, expiry, cvv, name });
  };

  return (
    <View style={styles.container}>
      <Text style={[typography.h6, styles.title]}>Card Details</Text>

      <TextInput
        style={styles.input}
        placeholder="Cardholder Name"
        value={name}
        onChangeText={setName}
        placeholderTextColor={colors.textSecondary}
      />

      <TextInput
        style={styles.input}
        placeholder="1234 5678 9012 3456"
        value={cardNumber}
        onChangeText={setCardNumber}
        maxLength={19}
        keyboardType="numeric"
        placeholderTextColor={colors.textSecondary}
      />

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.flex]}
          placeholder="MM/YY"
          value={expiry}
          onChangeText={setExpiry}
          maxLength={5}
          keyboardType="numeric"
          placeholderTextColor={colors.textSecondary}
        />
        <TextInput
          style={[styles.input, styles.flex]}
          placeholder="CVV"
          value={cvv}
          onChangeText={setCvv}
          maxLength={4}
          keyboardType="numeric"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <Text style={[typography.caption, styles.disclaimer]}>
        Your payment is secure and encrypted
      </Text>

      <Button title={`Pay ₹${amount?.toFixed(2)}`} onPress={handleSubmit} disabled={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  title: { color: colors.text, marginBottom: spacing.lg },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottomMargin: spacing.md,
    ...typography.body,
    color: colors.text,
  },
  row: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  flex: { flex: 1, marginBottom: 0 },
  disclaimer: { color: colors.textSecondary, marginVertical: spacing.md, textAlign: 'center' },
});
