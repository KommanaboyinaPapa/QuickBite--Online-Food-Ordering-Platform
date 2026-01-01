import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Text, Animated as RNAnimated } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@styles/theme';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

const { colors, spacing } = theme;

/**
 * VoiceButton Component
 * Animated voice recording button
 */
export default function VoiceButton({ onStart, onStop, isRecording }) {
  const scale = React.useRef(new RNAnimated.Value(1)).current;

  React.useEffect(() => {
    if (isRecording) {
      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(scale, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          RNAnimated.timing(scale, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      scale.setValue(1);
    }
  }, [isRecording]);

  const handlePress = () => {
    if (isRecording) {
      onStop?.();
    } else {
      onStart?.();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, isRecording && styles.recordingButton]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <RNAnimated.View style={{ transform: [{ scale }] }}>
        <Ionicons
          name={isRecording ? 'stop-circle' : 'mic'}
          size={28}
          color={colors.white}
        />
      </RNAnimated.View>
      {isRecording && <View style={styles.recordingIndicator} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  recordingButton: {
    backgroundColor: colors.error,
  },
  recordingIndicator: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.error,
    opacity: 0.3,
  },
});
