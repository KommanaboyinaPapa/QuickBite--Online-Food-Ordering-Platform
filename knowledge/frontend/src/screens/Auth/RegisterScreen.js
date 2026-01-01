/**
 * RegisterScreen - User registration with form validation
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
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInUp, SlideInUp } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '@hooks/useAuth';
import { theme } from '@styles/theme';
import Button from '@components/Common/Button';

const { colors, typography, spacing } = theme;

const RegisterScreen = ({ navigation }) => {
  const { register, loading, error } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'customer',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name required';
    if (!formData.email.includes('@')) newErrors.email = 'Valid email required';
    if (formData.phone.length < 10) newErrors.phone = 'Valid phone required';
    if (formData.password.length < 6) newErrors.password = 'Password min 6 chars';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        userType: formData.userType,
      });
      // Navigation will happen automatically via Redux
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
          <Text style={[typography.h2, styles.title]}>Create Account</Text>
          <Text style={[typography.body, styles.subtitle]}>
            Join us to order delicious food
          </Text>
        </Animated.View>

        {/* Error Message */}
        {error && (
          <Animated.View entering={SlideInUp} style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        )}

        {/* Form */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.form}>
          {/* First Name */}
          <View style={styles.inputGroup}>
            <Text style={[typography.label, styles.label]}>First Name</Text>
            <View style={[styles.input, errors.firstName && styles.inputError]}>
              <Ionicons name="person" size={20} color={colors.textLight} />
              <TextInput
                placeholder="John"
                placeholderTextColor={colors.textLight}
                value={formData.firstName}
                onChangeText={(value) => handleInputChange('firstName', value)}
                style={styles.inputText}
              />
            </View>
            {errors.firstName && (
              <Text style={styles.errorMessage}>{errors.firstName}</Text>
            )}
          </View>

          {/* Last Name */}
          <View style={styles.inputGroup}>
            <Text style={[typography.label, styles.label]}>Last Name</Text>
            <View style={[styles.input, errors.lastName && styles.inputError]}>
              <Ionicons name="person" size={20} color={colors.textLight} />
              <TextInput
                placeholder="Doe"
                placeholderTextColor={colors.textLight}
                value={formData.lastName}
                onChangeText={(value) => handleInputChange('lastName', value)}
                style={styles.inputText}
              />
            </View>
            {errors.lastName && (
              <Text style={styles.errorMessage}>{errors.lastName}</Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={[typography.label, styles.label]}>Email Address</Text>
            <View style={[styles.input, errors.email && styles.inputError]}>
              <Ionicons name="mail" size={20} color={colors.textLight} />
              <TextInput
                placeholder="john@example.com"
                placeholderTextColor={colors.textLight}
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                style={styles.inputText}
              />
            </View>
            {errors.email && (
              <Text style={styles.errorMessage}>{errors.email}</Text>
            )}
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={[typography.label, styles.label]}>Phone Number</Text>
            <View style={[styles.input, errors.phone && styles.inputError]}>
              <Ionicons name="call" size={20} color={colors.textLight} />
              <TextInput
                placeholder="+91 98765 43210"
                placeholderTextColor={colors.textLight}
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                style={styles.inputText}
              />
            </View>
            {errors.phone && (
              <Text style={styles.errorMessage}>{errors.phone}</Text>
            )}
          </View>

          {/* Account Type */}
          <View style={styles.inputGroup}>
            <Text style={[typography.label, styles.label]}>Account Type</Text>
            <Text style={[typography.caption, styles.helperText]}>
              Choose whether this account is for ordering, running a restaurant, or delivering.
            </Text>
            <View style={styles.roleOptions}>
              {[
                { value: 'customer', label: 'Customer' },
                { value: 'restaurant', label: 'Restaurant Owner' },
                { value: 'delivery_agent', label: 'Delivery Agent' },
              ].map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.roleChip,
                    formData.userType === option.value && styles.roleChipSelected,
                  ]}
                  onPress={() => handleInputChange('userType', option.value)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.roleChipText,
                      formData.userType === option.value && styles.roleChipTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={[typography.label, styles.label]}>Password</Text>
            <View style={[styles.input, errors.password && styles.inputError]}>
              <Ionicons name="lock-closed" size={20} color={colors.textLight} />
              <TextInput
                placeholder="Enter password"
                placeholderTextColor={colors.textLight}
                secureTextEntry={!showPassword}
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
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

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={[typography.label, styles.label]}>Confirm Password</Text>
            <View
              style={[styles.input, errors.confirmPassword && styles.inputError]}
            >
              <Ionicons name="lock-closed" size={20} color={colors.textLight} />
              <TextInput
                placeholder="Confirm password"
                placeholderTextColor={colors.textLight}
                secureTextEntry={!showConfirmPassword}
                value={formData.confirmPassword}
                onChangeText={(value) =>
                  handleInputChange('confirmPassword', value)
                }
                style={styles.inputText}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                hitSlop={10}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color={colors.textLight}
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errorMessage}>{errors.confirmPassword}</Text>
            )}
          </View>
        </Animated.View>

        {/* Register Button */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.buttonContainer}>
          <Button
            title={loading ? 'Creating Account...' : 'Create Account'}
            onPress={handleRegister}
            disabled={loading}
            icon={loading ? undefined : 'checkmark-circle'}
          />
        </Animated.View>

        {/* Login Link */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.footer}>
          <Text style={[typography.body, styles.footerText]}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[typography.body, styles.linkText]}>Login here</Text>
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
    marginTop: spacing.lg,
  },
  title: {
    color: colors.text,
    marginBottom: spacing.xs,
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
  form: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
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
  helperText: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  roleOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  roleChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.light50,
  },
  roleChipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  roleChipText: {
    color: colors.text,
    fontWeight: '600',
  },
  roleChipTextSelected: {
    color: colors.white,
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
  buttonContainer: {
    marginBottom: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: {
    color: colors.textSecondary,
  },
  linkText: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default RegisterScreen;
