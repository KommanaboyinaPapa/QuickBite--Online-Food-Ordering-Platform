/**
 * ForgotPasswordScreen - Password reset flow
 */

import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, { FadeInUp, SlideInUp } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '@hooks/useAuth';
import { theme } from '@styles/theme';
import Button from '@components/Common/Button';

const { colors, typography, spacing } = theme;

const ForgotPasswordScreen = ({ navigation }) => {
  const { forgotPassword, loading, error } = useAuth();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = () => {
    const newErrors = {};
    if (!email.includes('@')) {
      newErrors.email = 'Valid email required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async () => {
    if (!validateEmail()) return;

    try {
      await forgotPassword(email);
      setStep(2);
    } catch (err) {
      console.error('Error sending OTP:', err);
    }
  };

  const validatePasswords = () => {
    const newErrors = {};
    if (newPassword.length < 6) {
      newErrors.password = 'Password min 6 characters';
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validatePasswords()) return;

    // Call reset password API with token/email/otp
    try {
      // Navigate to login
      navigation.navigate('Login');
    } catch (err) {
      console.error('Error resetting password:', err);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInUp} style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (step === 1) {
                navigation.goBack();
              } else {
                setStep(step - 1);
              }
            }}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </TouchableOpacity>

          <Text style={[typography.h2, styles.title]}>Reset Password</Text>
          <Text style={[typography.body, styles.subtitle]}>
            {step === 1 && 'Enter your email to receive a reset code'}
            {step === 2 && 'Enter the OTP sent to your email'}
            {step === 3 && 'Create a new password'}
          </Text>
        </Animated.View>

        {/* Error Message */}
        {error && (
          <Animated.View entering={SlideInUp} style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        )}

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {[1, 2, 3].map(i => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i <= step && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        {/* Step 1: Email */}
        {step === 1 && (
          <Animated.View entering={FadeInUp} style={styles.stepContent}>
            <View style={styles.inputGroup}>
              <Text style={[typography.label, styles.label]}>Email Address</Text>
              <View
                style={[
                  styles.input,
                  errors.email && styles.inputError,
                ]}
              >
                <Ionicons name="mail" size={20} color={colors.textLight} />
                <TextInput
                  placeholder="john@example.com"
                  placeholderTextColor={colors.textLight}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    if (errors.email) setErrors({});
                  }}
                  style={styles.inputText}
                  editable={!loading}
                />
              </View>
              {errors.email && (
                <Text style={styles.errorMessage}>{errors.email}</Text>
              )}
            </View>

            <Button
              title={loading ? 'Sending...' : 'Send OTP'}
              onPress={handleSendOTP}
              disabled={loading}
            />
          </Animated.View>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <Animated.View entering={FadeInUp} style={styles.stepContent}>
            <View style={styles.inputGroup}>
              <Text style={[typography.label, styles.label]}>Enter OTP</Text>
              <View style={styles.input}>
                <Ionicons name="key" size={20} color={colors.textLight} />
                <TextInput
                  placeholder="000000"
                  placeholderTextColor={colors.textLight}
                  keyboardType="number-pad"
                  value={otp}
                  onChangeText={setOtp}
                  style={styles.inputText}
                  maxLength={6}
                  editable={!loading}
                />
              </View>
            </View>

            <Button
              title={loading ? 'Verifying...' : 'Verify & Continue'}
              onPress={() => setStep(3)}
              disabled={loading || otp.length !== 6}
            />
          </Animated.View>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <Animated.View entering={FadeInUp} style={styles.stepContent}>
            <View style={styles.inputGroup}>
              <Text style={[typography.label, styles.label]}>New Password</Text>
              <View
                style={[
                  styles.input,
                  errors.password && styles.inputError,
                ]}
              >
                <Ionicons name="lock-closed" size={20} color={colors.textLight} />
                <TextInput
                  placeholder="Enter new password"
                  placeholderTextColor={colors.textLight}
                  secureTextEntry={!showPassword}
                  value={newPassword}
                  onChangeText={(value) => {
                    setNewPassword(value);
                    if (errors.password) {
                      setErrors(prev => ({ ...prev, password: '' }));
                    }
                  }}
                  style={styles.inputText}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={10}
                >
                  <Ionicons
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={20}
                    color={colors.textLight}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorMessage}>{errors.password}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[typography.label, styles.label]}>
                Confirm Password
              </Text>
              <View
                style={[
                  styles.input,
                  errors.confirmPassword && styles.inputError,
                ]}
              >
                <Ionicons name="lock-closed" size={20} color={colors.textLight} />
                <TextInput
                  placeholder="Confirm new password"
                  placeholderTextColor={colors.textLight}
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    if (errors.confirmPassword) {
                      setErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }
                  }}
                  style={styles.inputText}
                />
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorMessage}>
                  {errors.confirmPassword}
                </Text>
              )}
            </View>

            <Button
              title={loading ? 'Resetting...' : 'Reset Password'}
              onPress={handleResetPassword}
              disabled={loading}
            />
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  backButton: {
    marginBottom: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.light50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    marginBottom: spacing.md,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorLight,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  errorText: {
    color: colors.error,
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepContent: {
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.light50,
    gap: spacing.md,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  errorMessage: {
    color: colors.error,
    fontSize: 12,
    marginTop: spacing.xs,
  },
});

export default ForgotPasswordScreen;
