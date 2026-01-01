/**
 * OTPVerificationScreen - Email/Phone OTP verification
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInUp, SlideInUp } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '@hooks/useAuth';
import { theme } from '@styles/theme';
import Button from '@components/Common/Button';

const { colors, typography, spacing } = theme;

const OTPVerificationScreen = ({ route, navigation }) => {
  const { email = '', phone = '' } = route.params || {};
  const { verifyOTP, loading, error } = useAuth();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState({});
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];

    if (/^\d?$/.test(value)) {
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus to next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      if (errors.otp) {
        setErrors(prev => ({ ...prev, otp: '' }));
      }
    }
  };

  const handleBackspace = (index, key) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const validateOtp = () => {
    const otpCode = otp.join('');
    const newErrors = {};

    if (otpCode.length !== 6) {
      newErrors.otp = 'Please enter 6-digit OTP';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerify = async () => {
    if (!validateOtp()) return;

    const otpCode = otp.join('');
    try {
      await verifyOTP(email || phone, otpCode);
      // Navigation happens automatically via Redux
    } catch (err) {
      console.error('OTP verification failed:', err);
    }
  };

  const handleResend = () => {
    setOtp(['', '', '', '', '', '']);
    setTimeLeft(60);
    setCanResend(false);
    inputRefs.current[0]?.focus();
    // Call resend OTP API
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
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </TouchableOpacity>

          <Text style={[typography.h2, styles.title]}>Verify OTP</Text>
          <Text style={[typography.body, styles.subtitle]}>
            We've sent a 6-digit code to{'\n'}
            {email || phone}
          </Text>
        </Animated.View>

        {/* Error Message */}
        {error && (
          <Animated.View entering={SlideInUp} style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        )}

        {/* OTP Input */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.otpContainer}>
          <Text style={[typography.label, styles.label]}>Enter OTP</Text>
          <View style={styles.otpInputGroup}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={el => (inputRefs.current[index] = el)}
                style={[styles.otpInput, errors.otp && styles.otpInputError]}
                maxLength={1}
                keyboardType="number-pad"
                value={digit}
                onChangeText={value => handleOtpChange(index, value)}
                onKeyPress={({ nativeEvent }) =>
                  handleBackspace(index, nativeEvent.key)
                }
                editable={!loading}
                placeholder="0"
                placeholderTextColor={colors.textLight}
              />
            ))}
          </View>
          {errors.otp && (
            <Text style={styles.errorMessage}>{errors.otp}</Text>
          )}
        </Animated.View>

        {/* Resend Timer */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.resendContainer}>
          {!canResend ? (
            <Text style={[typography.caption, styles.timerText]}>
              Resend OTP in {timeLeft}s
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={loading}>
              <Text
                style={[
                  typography.caption,
                  styles.resendLink,
                  loading && styles.resendDisabled,
                ]}
              >
                Resend OTP
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Verify Button */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.buttonContainer}>
          <Button
            title={loading ? 'Verifying...' : 'Verify OTP'}
            onPress={handleVerify}
            disabled={loading}
            icon="checkmark-circle"
          />
        </Animated.View>

        {/* Edit Number */}
        <Animated.View entering={FadeInUp.delay(350)} style={styles.footer}>
          <Text style={[typography.caption, styles.editText]}>
            Didn't receive the code?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[typography.caption, styles.editLink]}>Edit number</Text>
          </TouchableOpacity>
        </Animated.View>
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
    lineHeight: 22,
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
  otpContainer: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  label: {
    color: colors.text,
  },
  otpInputGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  otpInput: {
    flex: 1,
    height: 60,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.text,
    backgroundColor: colors.light50,
  },
  otpInputError: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  errorMessage: {
    color: colors.error,
    fontSize: 12,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  timerText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  resendLink: {
    color: colors.primary,
    fontWeight: '700',
  },
  resendDisabled: {
    opacity: 0.6,
  },
  buttonContainer: {
    marginBottom: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  editText: {
    color: colors.textSecondary,
  },
  editLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default OTPVerificationScreen;
