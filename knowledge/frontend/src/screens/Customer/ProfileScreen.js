import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  Text,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser, logout } from '../../redux/slices/authSlice';
import Header from '../../components/Common/Header';
import Button from '../../components/Common/Button';
import theme from '../../styles/theme';

/**
 * ProfileScreen - User profile and account management
 * 
 * Features:
 * - Display user profile information
 * - Edit profile details
 * - Manage saved addresses
 * - Manage payment methods
 * - View user preferences
 * - Logout functionality
 */
const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.profile);
  const addresses = useSelector(state => state.user.addresses || []);
  const paymentMethods = useSelector(state => state.user.savedPaymentMethods || []);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState(user || {});
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleUpdateProfile = () => {
    console.log('Updating profile:', editedProfile);
    setIsEditingProfile(false);
  };

  const handleLogout = async () => {
    console.log('Logging out...');
    try {
      await dispatch(logoutUser()).unwrap();
      // Navigation will happen automatically when isAuthenticated becomes false
      // The RootNavigator will switch to AuthNavigator
    } catch (error) {
      console.error('Logout failed:', error);
      // Still try to logout by resetting auth state
      dispatch(logout());
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header title="Profile" subtitle="Manage your account" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <MaterialCommunityIcons
                name="account-circle"
                size={80}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.firstName || 'User'}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <Text style={styles.profilePhone}>{user?.phone}</Text>
            </View>
          </View>

          {isEditingProfile ? (
            <EditProfileForm
              profile={editedProfile}
              onProfileChange={setEditedProfile}
              onSave={handleUpdateProfile}
              onCancel={() => {
                setEditedProfile(user);
                setIsEditingProfile(false);
              }}
            />
          ) : (
            <Button
              title="Edit Profile"
              variant="secondary"
              onPress={() => setIsEditingProfile(true)}
            />
          )}
        </View>

        {/* Addresses Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Saved Addresses</Text>
            <TouchableOpacity onPress={() => setShowAddressModal(true)}>
              <MaterialCommunityIcons
                name="plus"
                size={20}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>

          {addresses.length > 0 ? (
            addresses.map((address, index) => (
              <View key={index} style={styles.addressCard}>
                <View style={styles.addressHeader}>
                  <MaterialCommunityIcons
                    name={getAddressIcon(address.addressType)}
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.addressType}>{address.addressType || 'Address'}</Text>
                </View>
                <Text style={styles.addressText}>{address.street}</Text>
                <Text style={styles.addressText}>
                  {[address.city, address.postalCode].filter(Boolean).join(', ')}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No saved addresses</Text>
          )}
        </View>

        {/* Payment Methods Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment Methods</Text>
            <TouchableOpacity onPress={() => setShowPaymentModal(true)}>
              <MaterialCommunityIcons
                name="plus"
                size={20}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>

          {paymentMethods.length > 0 ? (
            paymentMethods.map((method, index) => (
              <View key={index} style={styles.paymentCard}>
                <View style={styles.paymentHeader}>
                  <MaterialCommunityIcons
                    name={getPaymentIcon(method.type)}
                    size={24}
                    color={theme.colors.primary}
                  />
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentType}>{method.type}</Text>
                    <Text style={styles.paymentNumber}>
                      {maskPaymentNumber(method.number)}
                    </Text>
                  </View>
                </View>
                {method.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No payment methods</Text>
          )}
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <MenuButton
            icon="bell-outline"
            title="Notifications"
            onPress={() => navigation.navigate('Preferences')}
          />
          <MenuButton
            icon="apple-keyboard-control"
            title="Preferences"
            onPress={() => navigation.navigate('Preferences')}
          />
          <MenuButton
            icon="help-circle-outline"
            title="Help & Support"
            onPress={() => console.log('Help')}
          />
          <MenuButton
            icon="information-outline"
            title="About"
            onPress={() => console.log('About')}
          />
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            title="Logout"
            variant="secondary"
            onPress={handleLogout}
          />
        </View>
      </ScrollView>

      {/* Address Modal */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        onRequestClose={() => setShowAddressModal(false)}
      >
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddressModal(false)}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Address</Text>
            <View style={{ width: 24 }} />
          </View>
          <AddressForm onClose={() => setShowAddressModal(false)} />
        </SafeAreaView>
      </Modal>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Payment Method</Text>
            <View style={{ width: 24 }} />
          </View>
          <PaymentForm onClose={() => setShowPaymentModal(false)} />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

/**
 * EditProfileForm component
 */
const EditProfileForm = ({ profile, onProfileChange, onSave, onCancel }) => (
  <View style={styles.form}>
    <FormInput
      label="First Name"
      value={profile.firstName || ''}
      onChangeText={value => onProfileChange({ ...profile, firstName: value })}
    />
    <FormInput
      label="Last Name"
      value={profile.lastName || ''}
      onChangeText={value => onProfileChange({ ...profile, lastName: value })}
    />
    <FormInput
      label="Email"
      value={profile.email || ''}
      editable={false}
      onChangeText={value => onProfileChange({ ...profile, email: value })}
    />
    <FormInput
      label="Phone"
      value={profile.phone || ''}
      onChangeText={value => onProfileChange({ ...profile, phone: value })}
    />
    <View style={styles.formButtons}>
      <Button
        title="Save"
        onPress={onSave}
        style={{ flex: 1, marginRight: theme.spacing.sm }}
      />
      <Button
        title="Cancel"
        variant="secondary"
        onPress={onCancel}
        style={{ flex: 1 }}
      />
    </View>
  </View>
);

/**
 * AddressForm component
 */
const AddressForm = ({ onClose }) => {
  const [address, setAddress] = useState({});

  return (
    <ScrollView contentContainerStyle={styles.formContent}>
      <FormInput
        label="Address Type"
        placeholder="Home, Work, etc."
        value={address.type || ''}
        onChangeText={value => setAddress({ ...address, type: value })}
      />
      <FormInput
        label="Address"
        placeholder="Enter your address"
        value={address.address || ''}
        onChangeText={value => setAddress({ ...address, address: value })}
        multiline
      />
      <FormInput
        label="City"
        placeholder="City"
        value={address.city || ''}
        onChangeText={value => setAddress({ ...address, city: value })}
      />
      <FormInput
        label="Postal Code"
        placeholder="Postal code"
        value={address.postalCode || ''}
        onChangeText={value => setAddress({ ...address, postalCode: value })}
      />
      <Button
        title="Save Address"
        onPress={() => {
          console.log('Saving address:', address);
          onClose();
        }}
      />
    </ScrollView>
  );
};

/**
 * PaymentForm component
 */
const PaymentForm = ({ onClose }) => {
  const [payment, setPayment] = useState({});

  return (
    <ScrollView contentContainerStyle={styles.formContent}>
      <FormInput
        label="Cardholder Name"
        placeholder="John Doe"
        value={payment.name || ''}
        onChangeText={value => setPayment({ ...payment, name: value })}
      />
      <FormInput
        label="Card Number"
        placeholder="1234 5678 9012 3456"
        value={payment.number || ''}
        onChangeText={value => setPayment({ ...payment, number: value })}
        maxLength={19}
      />
      <View style={styles.formRow}>
        <FormInput
          label="Expiry"
          placeholder="MM/YY"
          value={payment.expiry || ''}
          onChangeText={value => setPayment({ ...payment, expiry: value })}
          maxLength={5}
          style={{ flex: 1, marginRight: theme.spacing.sm }}
        />
        <FormInput
          label="CVV"
          placeholder="123"
          value={payment.cvv || ''}
          onChangeText={value => setPayment({ ...payment, cvv: value })}
          maxLength={3}
          style={{ flex: 0.7 }}
        />
      </View>
      <Button
        title="Save Payment Method"
        onPress={() => {
          console.log('Saving payment:', payment);
          onClose();
        }}
      />
    </ScrollView>
  );
};

/**
 * FormInput component
 */
const FormInput = ({ label, style, ...props }) => (
  <View style={[styles.formInput, style]}>
    <Text style={styles.formLabel}>{label}</Text>
    <TextInput
      style={styles.formTextInput}
      placeholderTextColor={theme.colors.textTertiary}
      {...props}
    />
  </View>
);

/**
 * MenuButton component
 */
const MenuButton = ({ icon, title, onPress }) => (
  <TouchableOpacity style={styles.menuButton} onPress={onPress}>
    <MaterialCommunityIcons
      name={icon}
      size={20}
      color={theme.colors.primary}
      style={styles.menuIcon}
    />
    <Text style={styles.menuTitle}>{title}</Text>
    <MaterialCommunityIcons
      name="chevron-right"
      size={20}
      color={theme.colors.textSecondary}
    />
  </TouchableOpacity>
);

/**
 * Helper functions
 */
const getAddressIcon = (type) => {
  const iconMap = {
    home: 'home',
    work: 'briefcase',
    other: 'map-marker',
  };
  return iconMap[type?.toLowerCase()] || 'map-marker';
};

const getPaymentIcon = (type) => {
  const iconMap = {
    credit: 'credit-card',
    debit: 'credit-card',
    upi: 'wallet-plus',
  };
  return iconMap[type?.toLowerCase()] || 'credit-card';
};

const maskPaymentNumber = (number) => {
  if (!number) return '';
  const lastFour = number.slice(-4);
  return `•••• •••• •••• ${lastFour}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  profileSection: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: theme.spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  avatarContainer: {
    marginRight: theme.spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  profileEmail: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  profilePhone: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  form: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  formInput: {
    marginBottom: theme.spacing.md,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  formTextInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.text,
  },
  formButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  formRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  section: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  addressCard: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
  },
  addressCard_Last: {
    borderBottomWidth: 0,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  addressType: {
    marginLeft: theme.spacing.sm,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  addressText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  paymentCard: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentInfo: {
    marginLeft: theme.spacing.md,
  },
  paymentType: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  paymentNumber: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.white,
  },
  emptyText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    paddingVertical: theme.spacing.md,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuIcon: {
    marginRight: theme.spacing.md,
  },
  menuTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  logoutContainer: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  modal: {
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
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  formContent: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
});

export default ProfileScreen;
