import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@styles/theme';
import Animated, { FadeInUp, Pulse } from 'react-native-reanimated';

const { colors, typography, spacing } = theme;

/**
 * AIMessage Component
 * AI response with typing indicator
 */
export default function AIMessage({ message, isTyping }) {
  return (
    <Animated.View entering={FadeInUp} style={styles.container}>
      <View style={styles.avatar}>
        <Ionicons name="sparkles" size={20} color={colors.primary} />
      </View>

      <View style={styles.bubble}>
        {isTyping ? (
          <View style={styles.typingContainer}>
            <Animated.View entering={Pulse} style={styles.dot} />
            <Animated.View entering={Pulse} style={[styles.dot, styles.dot2]} />
            <Animated.View entering={Pulse} style={[styles.dot, styles.dot3]} />
          </View>
        ) : (
          <>
            <Text style={styles.text}>{message.content}</Text>
            <Text style={styles.time}>Just now</Text>
          </>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: spacing.sm,
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(103, 58, 183, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    maxWidth: '80%',
    backgroundColor: colors.light50,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    ...typography.body,
    color: colors.text,
    lineHeight: 20,
  },
  time: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    fontSize: 10,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 0.4,
  },
});
