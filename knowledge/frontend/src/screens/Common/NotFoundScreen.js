import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Button from '../../components/Common/Button';
import theme from '../../styles/theme';

/**
 * NotFoundScreen - 404 error screen
 * 
 * Features:
 * - Error illustration
 * - Error message
 * - Back button
 * - Home navigation button
 */
const NotFoundScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Error Icon */}
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={80}
            color={theme.colors.error}
          />
        </View>

        {/* Error Code */}
        <Text style={styles.errorCode}>404</Text>

        {/* Error Title */}
        <Text style={styles.errorTitle}>Page Not Found</Text>

        {/* Error Description */}
        <Text style={styles.errorDescription}>
          Sorry, the page you're looking for doesn't exist or has been moved.
        </Text>

        {/* Suggestions */}
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>What can you do?</Text>
          <SuggestionItem
            icon="arrow-left"
            text="Go back to the previous page"
          />
          <SuggestionItem
            icon="home"
            text="Return to home screen"
          />
          <SuggestionItem
            icon="headset"
            text="Contact support if the issue persists"
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title="← Go Back"
          onPress={() => navigation.goBack()}
          style={{ marginBottom: theme.spacing.md }}
        />
        <Button
          title="Go Home"
          variant="secondary"
          onPress={() => navigation.navigate('Home')}
        />
      </View>
    </SafeAreaView>
  );
};

/**
 * SuggestionItem component
 */
const SuggestionItem = ({ icon, text }) => (
  <View style={styles.suggestionItem}>
    <MaterialCommunityIcons
      name={icon}
      size={20}
      color={theme.colors.primary}
      style={styles.suggestionIcon}
    />
    <Text style={styles.suggestionText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.screenPadding,
  },
  iconContainer: {
    marginBottom: theme.spacing.lg,
  },
  errorCode: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 20,
  },
  suggestionsContainer: {
    width: '100%',
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  suggestionIcon: {
    marginRight: theme.spacing.md,
  },
  suggestionText: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.lg,
  },
});

export default NotFoundScreen;
