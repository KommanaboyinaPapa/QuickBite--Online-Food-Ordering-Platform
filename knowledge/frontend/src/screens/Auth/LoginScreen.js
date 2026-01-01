/**
 * Login Screen - User login with email/phone and password
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
  Animated as RNAnimated,
  Easing,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import Animated, { FadeIn, SlideInUp, BounceIn } from 'react-native-reanimated';
import { theme } from '@styles/theme';
import Button from '@components/Common/Button';
import { loginUser } from '@redux/slices/authSlice';
// Import auth actions to manually set state for testing
import { clearError } from '@redux/slices/authSlice';

const { colors, typography, spacing } = theme;

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Floating animations
  const float1Y = React.useRef(new RNAnimated.Value(0)).current;
  const float2Y = React.useRef(new RNAnimated.Value(0)).current;
  const float3Y = React.useRef(new RNAnimated.Value(0)).current;

  React.useEffect(() => {
    const createFloatingAnimation = (value, duration, delay = 0) => {
      return RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.delay(delay),
          RNAnimated.timing(value, {
            toValue: -20,
            duration: duration,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          RNAnimated.timing(value, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      );
    };

    createFloatingAnimation(float1Y, 2000, 0).start();
    createFloatingAnimation(float2Y, 2500, 500).start();
    createFloatingAnimation(float3Y, 2200, 1000).start();
  }, [float1Y, float2Y, float3Y]);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await dispatch(loginUser({ email, password }));
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleRegisterPress = () => {
    navigation.navigate('Register');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  // Temporary function for testing roles
  const mockLogin = (type) => {
    // This dispatch relies on the fact that the authSlice updates state based on the payload.
    // Since this is a client-side mock, we are hacking the state a bit or assuming the backend *would* return this.
    // For a proper test without backend, we might need a separate action or just rely on the fact that 
    // the user can't actually login without a backend response.
    // BUT, let's try to simulate a successful login action if possible, or just print instructions.

    // Actually, let's just use the credentials if they existed. 
    // Since we can't easily fake the Thunk action success without a mock service, 
    // I will rely on the user using real credentials OR (better for now)
    // I will add a dev-only comment. 

    alert(`To test ${type}, please ensure your backend user has user_type='${type}'.\n\nFor demo purposes, I've updated the implementation plan.`);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Floating Food Icons Background */}
      <RNAnimated.View style={[styles.floatingIcon, styles.icon1, { transform: [{ translateY: float1Y }] }]}>
        <MaterialCommunityIcons name="food" size={50} color={colors.primary + '20'} />
      </RNAnimated.View>
      <RNAnimated.View style={[styles.floatingIcon, styles.icon2, { transform: [{ translateY: float2Y }] }]}>
        <MaterialCommunityIcons name="hamburger" size={60} color={colors.success + '20'} />
      </RNAnimated.View>
      <RNAnimated.View style={[styles.floatingIcon, styles.icon3, { transform: [{ translateY: float3Y }] }]}>
        <MaterialCommunityIcons name="pizza" size={55} color={colors.warning + '20'} />
      </RNAnimated.View>
      <RNAnimated.View style={[styles.floatingIcon, styles.icon4, { transform: [{ translateY: float1Y }] }]}>
        <MaterialCommunityIcons name="noodles" size={45} color={colors.error + '20'} />
      </RNAnimated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with App Branding */}
        <Animated.View entering={BounceIn.delay(100)} style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons name="food-variant" size={50} color={colors.white} />
            </View>
            <View>
              <Text style={styles.appTitle}>Safe Eat</Text>
              <Text style={styles.tagline}>Order Healthy, Eat Better</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[typography.label, styles.label]}>
              <MaterialCommunityIcons name="email" size={16} color={colors.primary} /> Email or Phone
            </Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="account" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email or phone"
                placeholderTextColor={colors.textLight}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[typography.label, styles.label]}>
              <MaterialCommunityIcons name="lock" size={16} color={colors.primary} /> Password
            </Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="lock-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <MaterialCommunityIcons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={[typography.label, styles.forgotPassword]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <Button
            title="Login"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.loginButton}
          />

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={[typography.caption, styles.dividerText]}>or</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity
            onPress={handleRegisterPress}
            style={styles.registerLink}
          >
            <Text style={[typography.body, styles.registerText]}>
              Don't have an account?{' '}
              <Text style={styles.registerBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  floatingIcon: {
    position: 'absolute',
    zIndex: 0,
  },
  icon1: {
    top: '10%',
    left: '10%',
  },
  icon2: {
    top: '20%',
    right: '15%',
  },
  icon3: {
    bottom: '30%',
    left: '5%',
  },
  icon4: {
    bottom: '15%',
    right: '10%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.screenPaddingVertical,
    justifyContent: 'center',
    zIndex: 1,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    marginBottom: spacing.md,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: spacing.md,
    letterSpacing: 1,
  },
  tagline: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  headerSection: {
    marginBottom: spacing.xxl,
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.smwhite,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.screenPaddingVertical,
    justifyContent: 'center',
  },
  headerSection: {
    marginBottom: spacing.xxl,
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: spacing.xxl,
  },
  errorContainer: {
    backgroundColor: colors.error,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: colors.white,
    ...typography.caption,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.inputPaddingH,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.light50,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.light50,
    paddingRight: spacing.md,
  },
  passwordInput: {
    flex: 1,
    padding: spacing.inputPaddingH,
    fontSize: 16,
    color: colors.text,
  },
  showPasswordText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  forgotPassword: {
    color: colors.primary,
    textAlign: 'right',
    marginBottom: spacing.lg,
  },
  loginButton: {
    marginBottom: spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textLight,
    marginHorizontal: spacing.md,
  },
  registerLink: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  registerText: {
    color: colors.text,
  },
  registerBold: {
    fontWeight: 'bold',
    color: colors.primary,
  },
});

export default LoginScreen;