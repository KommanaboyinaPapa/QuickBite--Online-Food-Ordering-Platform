import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@styles/theme';

const { colors, spacing } = theme;

export default function AgentMap(props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Map view is not available on web.</Text>
      <Text style={styles.subText}>Please use the mobile app for live tracking.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    margin: spacing.md,
  },
  text: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  subText: {
    color: colors.textLight,
    fontSize: 14,
  },
});
