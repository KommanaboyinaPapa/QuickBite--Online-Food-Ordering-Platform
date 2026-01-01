/**
 * useVoice Hook - Handle voice input and speech-to-text
 */

import { useCallback, useState } from 'react';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

export const useVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);
  const [recordingUri, setRecordingUri] = useState(null);

  const startListening = useCallback(async (onTranscript) => {
    try {
      setIsListening(true);
      setError(null);

      // Request audio permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('Audio permission not granted');
        return;
      }

      // Setup audio session
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true
      });

      // Create recording instance
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();

      // Store recording reference for stopping
      setRecordingUri(recording);

      if (onTranscript) {
        onTranscript('Recording...');
      }
    } catch (err) {
      setError(err.message);
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(async () => {
    try {
      setIsListening(false);

      if (recordingUri) {
        await recordingUri.stopAndUnloadAsync();
        const uri = recordingUri.getURI();
        setRecordingUri(uri);
        return uri;
      }
    } catch (err) {
      setError(err.message);
    }
  }, [recordingUri]);

  const speak = useCallback(async (text, options = {}) => {
    try {
      setIsSpeaking(true);
      setError(null);

      const defaultOptions = {
        language: options.language || 'en',
        pitch: options.pitch || 1.0,
        rate: options.rate || 1.0,
        ...options
      };

      await Speech.speak(text, defaultOptions);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    Speech.stop();
    setIsSpeaking(false);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setVoiceTranscript = useCallback((text) => {
    setTranscript(text);
  }, []);

  return {
    isListening,
    transcript,
    isSpeaking,
    error,
    recordingUri,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    clearTranscript,
    clearError,
    setVoiceTranscript
  };
};
