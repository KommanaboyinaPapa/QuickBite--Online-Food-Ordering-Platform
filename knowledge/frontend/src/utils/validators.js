/**
 * Validators - Form and input validation functions using Yup
 */

import * as yup from 'yup';

/**
 * Email validation schema
 */
export const emailSchema = yup.string()
  .email('Invalid email address')
  .required('Email is required');

/**
 * Password validation schema
 */
export const passwordSchema = yup.string()
  .min(8, 'Password must be at least 8 characters')
  .required('Password is required');

/**
 * Phone number validation schema
 */
export const phoneSchema = yup.string()
  .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
  .required('Phone number is required');

/**
 * OTP validation schema
 */
export const otpSchema = yup.string()
  .matches(/^[0-9]{6}$/, 'OTP must be 6 digits')
  .required('OTP is required');

/**
 * Name validation schema
 */
export const nameSchema = yup.string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must not exceed 50 characters')
  .required('Name is required');

/**
 * Address validation schema
 */
export const addressSchema = yup.object().shape({
  street: yup.string()
    .min(5, 'Street address must be at least 5 characters')
    .required('Street address is required'),
  city: yup.string()
    .min(2, 'City name must be at least 2 characters')
    .required('City is required'),
  postalCode: yup.string()
    .matches(/^[0-9]{5,6}$/, 'Postal code must be 5-6 digits')
    .required('Postal code is required'),
  type: yup.string()
    .oneOf(['home', 'work', 'other'], 'Invalid address type')
    .required('Address type is required'),
});

/**
 * Login validation schema
 */
export const loginSchema = yup.object().shape({
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Registration validation schema
 */
export const registrationSchema = yup.object().shape({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

/**
 * OTP verification schema
 */
export const otpVerificationSchema = yup.object().shape({
  phone: phoneSchema,
  otp: otpSchema,
});

/**
 * Review validation schema
 */
export const reviewSchema = yup.object().shape({
  rating: yup.number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must not exceed 5')
    .required('Rating is required'),
  comment: yup.string()
    .min(10, 'Review must be at least 10 characters')
    .max(500, 'Review must not exceed 500 characters'),
});

/**
 * Allergy profile validation schema
 */
export const allergyProfileSchema = yup.object().shape({
  allergens: yup.array().of(yup.string()),
  dietaryRestrictions: yup.array().of(yup.string()),
  healthConditions: yup.array().of(yup.string()),
  spicePreference: yup.string()
    .oneOf(['mild', 'medium', 'spicy', 'very_spicy'], 'Invalid spice preference'),
});

/**
 * Payment method validation schema
 */
export const paymentMethodSchema = yup.object().shape({
  cardNumber: yup.string()
    .matches(/^[0-9]{16}$/, 'Card number must be 16 digits')
    .required('Card number is required'),
  cardholderName: nameSchema,
  expiryDate: yup.string()
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry date must be MM/YY format')
    .required('Expiry date is required'),
  cvv: yup.string()
    .matches(/^[0-9]{3,4}$/, 'CVV must be 3-4 digits')
    .required('CVV is required'),
});

/**
 * Generic email validator
 */
export const validateEmail = (email) => {
  try {
    emailSchema.validateSync(email);
    return { valid: true, error: null };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

/**
 * Generic password validator
 */
export const validatePassword = (password) => {
  try {
    passwordSchema.validateSync(password);
    return { valid: true, error: null };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

/**
 * Generic phone validator
 */
export const validatePhone = (phone) => {
  try {
    phoneSchema.validateSync(phone);
    return { valid: true, error: null };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

/**
 * Generic OTP validator
 */
export const validateOTP = (otp) => {
  try {
    otpSchema.validateSync(otp);
    return { valid: true, error: null };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

/**
 * Async schema validator wrapper
 */
export const validateSchema = async (schema, data) => {
  try {
    await schema.validate(data);
    return { valid: true, errors: {} };
  } catch (error) {
    const errors = {};
    if (error.inner) {
      error.inner.forEach((err) => {
        errors[err.path] = err.message;
      });
    }
    return { valid: false, errors };
  }
};

export default {
  emailSchema,
  passwordSchema,
  phoneSchema,
  addressSchema,
  loginSchema,
  registrationSchema,
  otpVerificationSchema,
  validateEmail,
  validatePassword,
  validatePhone,
  validateOTP,
  validateSchema,
};
