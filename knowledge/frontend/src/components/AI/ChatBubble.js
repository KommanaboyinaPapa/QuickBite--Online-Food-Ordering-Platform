import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@styles/theme';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { colors, typography, spacing } = theme;

/**
 * ChatBubble Component
 * Message bubble for chat conversations
 */
export default function ChatBubble({ message, isUser }) {
  const formatTime = (time) => {
    const date = new Date(time);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Animated.View entering={FadeInUp} style={[styles.container, isUser && styles.userContainer]}>
      {!isUser && <View style={styles.avatar} />}

      <View style={[styles.bubble, isUser && styles.userBubble]}>
        <Text style={[styles.text, isUser && styles.userText]}>{message.content}</Text>
        <Text style={[styles.time, isUser && styles.userTime]}>{formatTime(message.timestamp)}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: spacing.sm,
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  userContainer: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.light50,
  },
  bubble: {
    maxWidth: '80%',
    backgroundColor: colors.light50,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  userBubble: {
    backgroundColor: colors.primary,
  },
  text: {
    ...typography.body,
    color: colors.text,
    lineHeight: 20,
  },
  userText: {
    color: colors.white,
  },
  time: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    fontSize: 10,
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
