import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import Header from '../../components/Common/Header';
import Button from '../../components/Common/Button';
import theme from '../../styles/theme';

/**
 * PreferencesScreen - User preferences and settings
 * 
 * Features:
 * - Allergy and dietary preferences
 * - Notification settings
 * - App theme toggle
 * - Language selection
 * - Privacy settings
 * - Account preferences
 */
const PreferencesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const userPreferences = useSelector(state => state.user.preferences || {});
  const userAllergies = useSelector(state => state.user.allergies || []);

  // Local state for toggles
  const [preferences, setPreferences] = useState({
    notifications: userPreferences.notifications ?? true,
    emailNotifications: userPreferences.emailNotifications ?? true,
    smsNotifications: userPreferences.smsNotifications ?? true,
    darkMode: userPreferences.darkMode ?? false,
    language: userPreferences.language ?? 'English',
    showPrices: userPreferences.showPrices ?? true,
  });

  // Allergies list
  const allergyOptions = [
    'Peanuts',
    'Tree Nuts',
    'Shellfish',
    'Dairy',
    'Eggs',
    'Soy',
    'Wheat',
    'Fish',
    'Sesame',
    'Mustard',
  ];

  const [selectedAllergies, setSelectedAllergies] = useState(userAllergies);

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleAllergy = (allergen) => {
    if (selectedAllergies.includes(allergen)) {
      setSelectedAllergies(selectedAllergies.filter(a => a !== allergen));
    } else {
      setSelectedAllergies([...selectedAllergies, allergen]);
    }
  };

  const handleSave = () => {
    console.log('Saving preferences:', preferences, selectedAllergies);
    // Dispatch to Redux
    dispatch({ type: 'user/updatePreferences', payload: preferences });
    dispatch({ type: 'user/updateAllergies', payload: selectedAllergies });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header title="Preferences" subtitle="Customize your experience" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Allergies Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={18}
              color={theme.colors.warning}
            />
            {' '}Allergies & Dietary
          </Text>
          <Text style={styles.sectionSubtitle}>
            Select your allergies to get safe recommendations
          </Text>

          <View style={styles.allergyGrid}>
            {allergyOptions.map(allergen => (
              <TouchableOpacity
                key={allergen}
                style={[
                  styles.allergyChip,
                  selectedAllergies.includes(allergen) && styles.allergyChipActive,
                ]}
                onPress={() => toggleAllergy(allergen)}
              >
                <MaterialCommunityIcons
                  name={selectedAllergies.includes(allergen) ? 'check-circle' : 'circle-outline'}
                  size={16}
                  color={
                    selectedAllergies.includes(allergen)
                      ? theme.colors.white
                      : theme.colors.primary
                  }
                  style={styles.allergyIcon}
                />
                <Text
                  style={[
                    styles.allergyLabel,
                    selectedAllergies.includes(allergen) && styles.allergyLabelActive,
                  ]}
                >
                  {allergen}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <MaterialCommunityIcons
              name="bell"
              size={18}
              color={theme.colors.primary}
            />
            {' '}Notifications
          </Text>

          <PreferenceRow
            icon="bell"
            label="Push Notifications"
            value={preferences.notifications}
            onToggle={() => handleToggle('notifications')}
          />
          <PreferenceRow
            icon="email"
            label="Email Notifications"
            value={preferences.emailNotifications}
            onToggle={() => handleToggle('emailNotifications')}
          />
          <PreferenceRow
            icon="message"
            label="SMS Notifications"
            value={preferences.smsNotifications}
            onToggle={() => handleToggle('smsNotifications')}
          />
        </View>

        {/* Display Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <MaterialCommunityIcons
              name="palette"
              size={18}
              color={theme.colors.primary}
            />
            {' '}Display
          </Text>

          <PreferenceRow
            icon="moon-waning-crescent"
            label="Dark Mode"
            value={preferences.darkMode}
            onToggle={() => handleToggle('darkMode')}
          />

          <PreferenceDropdown
            icon="language-javascript"
            label="Language"
            value={preferences.language}
            options={['English', 'Spanish', 'French', 'German', 'Chinese']}
            onSelect={value => setPreferences({ ...preferences, language: value })}
          />
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <MaterialCommunityIcons
              name="shield"
              size={18}
              color={theme.colors.primary}
            />
            {' '}Privacy
          </Text>

          <PreferenceRow
            icon="eye"
            label="Show Pricing"
            value={preferences.showPrices}
            onToggle={() => handleToggle('showPrices')}
          />

          <MenuLink
            icon="lock-outline"
            label="Privacy Policy"
            onPress={() => console.log('Privacy Policy')}
          />

          <MenuLink
            icon="file-document-outline"
            label="Terms of Service"
            onPress={() => console.log('Terms')}
          />
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <MaterialCommunityIcons
              name="information"
              size={18}
              color={theme.colors.primary}
            />
            {' '}About
          </Text>

          <InfoRow label="App Version" value="1.0.0" />
          <InfoRow label="Build Number" value="100" />
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <Button
          title="Save Changes"
          onPress={handleSave}
        />
      </View>
    </View>
  );
};

/**
 * PreferenceRow component - Toggle preference
 */
const PreferenceRow = ({ icon, label, value, onToggle }) => (
  <View style={styles.preferenceRow}>
    <View style={styles.preferenceContent}>
      <MaterialCommunityIcons
        name={icon}
        size={20}
        color={theme.colors.primary}
        style={styles.preferenceIcon}
      />
      <Text style={styles.preferenceLabel}>{label}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{
        false: theme.colors.border,
        true: theme.colors.primary + '40',
      }}
      thumbColor={value ? theme.colors.primary : theme.colors.textTertiary}
    />
  </View>
);

/**
 * PreferenceDropdown component
 */
const PreferenceDropdown = ({ icon, label, value, options, onSelect }) => {
  const [showOptions, setShowOptions] = React.useState(false);

  return (
    <View>
      <TouchableOpacity
        style={styles.preferenceRow}
        onPress={() => setShowOptions(!showOptions)}
      >
        <View style={styles.preferenceContent}>
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={theme.colors.primary}
            style={styles.preferenceIcon}
          />
          <View>
            <Text style={styles.preferenceLabel}>{label}</Text>
            <Text style={styles.preferenceValue}>{value}</Text>
          </View>
        </View>
        <MaterialCommunityIcons
          name={showOptions ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>

      {showOptions && (
        <View style={styles.dropdownOptions}>
          {options.map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.dropdownOption,
                value === option && styles.dropdownOptionActive,
              ]}
              onPress={() => {
                onSelect(option);
                setShowOptions(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownOptionText,
                  value === option && styles.dropdownOptionTextActive,
                ]}
              >
                {option}
              </Text>
              {value === option && (
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color={theme.colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

/**
 * MenuLink component
 */
const MenuLink = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.menuLink} onPress={onPress}>
    <MaterialCommunityIcons
      name={icon}
      size={20}
      color={theme.colors.primary}
      style={styles.menuLinkIcon}
    />
    <Text style={styles.menuLinkLabel}>{label}</Text>
    <MaterialCommunityIcons
      name="chevron-right"
      size={20}
      color={theme.colors.textSecondary}
    />
  </TouchableOpacity>
);

/**
 * InfoRow component
 */
const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.lg,
    paddingBottom: 100,
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
    marginBottom: theme.spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  allergyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  allergyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
  },
  allergyChipActive: {
    backgroundColor: theme.colors.warning,
    borderColor: theme.colors.warning,
  },
  allergyIcon: {
    marginRight: 4,
  },
  allergyLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  allergyLabelActive: {
    color: theme.colors.white,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  preferenceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceIcon: {
    marginRight: theme.spacing.md,
  },
  preferenceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  preferenceValue: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  dropdownOptions: {
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    marginTop: theme.spacing.sm,
    overflow: 'hidden',
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dropdownOptionActive: {
    backgroundColor: theme.colors.primary + '20',
  },
  dropdownOptionText: {
    fontSize: 13,
    color: theme.colors.text,
  },
  dropdownOptionTextActive: {
    fontWeight: '600',
    color: theme.colors.primary,
  },
  menuLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuLinkIcon: {
    marginRight: theme.spacing.md,
  },
  menuLinkLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  infoValue: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  footer: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});

export default PreferencesScreen;
