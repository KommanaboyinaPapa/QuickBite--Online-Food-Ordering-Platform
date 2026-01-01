/**
 * ErrorBoundary Component - Catch and display errors gracefully
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '@styles/theme';

const { colors, typography, spacing } = theme;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.emoji}>⚠️</Text>
            <Text style={[typography.h3, styles.title]}>Oops! Something went wrong</Text>
            <Text style={[typography.body, styles.message]}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>
            
            <TouchableOpacity
              onPress={this.handleReset}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    padding: spacing.lg,
  },
  content: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.white,
    ...typography.button,
    fontWeight: '600',
  },
});

export default ErrorBoundary;
