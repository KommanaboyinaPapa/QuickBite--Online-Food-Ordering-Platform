import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import ChatBubble from '../../components/AI/ChatBubble';
import AIMessage from '../../components/AI/AIMessage';
import VoiceButton from '../../components/AI/VoiceButton';
import RecommendationCard from '../../components/AI/RecommendationCard';
import Button from '../../components/Common/Button';
import theme from '../../styles/theme';

/**
 * AIAssistantScreen - AI chat interface
 * 
 * Features:
 * - Chat conversation with AI
 * - Voice input support
 * - AI recommendations
 * - Message history
 * - Recommendation carousel
 * - Quick action suggestions
 */
const AIAssistantScreen = ({ navigation, route }) => {
  const initialPrompt = route?.params?.prompt;
  const queuedItems = useSelector(state => state.ai.queuedItems || []);
  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', text: 'Hi! 👋 I\'m your food assistant. What are you in the mood for today?', timestamp: new Date() },
    ...(initialPrompt ? [{ id: 2, type: 'user', text: initialPrompt, timestamp: new Date() }] : []),
  ]);
  const [inputText, setInputText] = useState('');
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  const scrollViewRef = useRef(null);
  const recommendations = useSelector(state => state.ai.recommendations || []);
  // When queued items exist, append a message describing them for AI context
  useEffect(() => {
    if (queuedItems.length) {
      const itemsSummary = queuedItems.map((itm, idx) => `${idx + 1}. ${itm.name} (₹${itm.price})`).join('\n');
      setMessages(prev => ([
        ...prev,
        {
          id: prev.length + 1,
          type: 'user',
          text: `Save these items for later analysis:\n${itemsSummary}`,
          timestamp: new Date(),
        },
      ]));
    }
  }, [queuedItems]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = () => {
    if (inputText.trim().length === 0) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputText,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: messages.length + 2,
        type: 'ai',
        text: 'That sounds delicious! Let me find the best options for you. 🍽️',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setShowRecommendations(true);
    }, 1000);
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate voice input
      setTimeout(() => {
        setIsRecording(false);
        setInputText('I want something spicy and vegetarian');
      }, 2000);
    }
  };

  const handleRecommendationPress = (item) => {
    const message = {
      id: messages.length + 1,
      type: 'user',
      text: `Add "${item.name}" to my cart`,
      timestamp: new Date(),
    };
    setMessages([...messages, message]);
    setShowRecommendations(false);
  };

  const quickSuggestions = [
    { icon: 'fire', label: 'Spicy', action: () => setInputText('Show me spicy options') },
    { icon: 'leaf', label: 'Vegetarian', action: () => setInputText('I\'m looking for vegetarian') },
    { icon: 'clock-fast', label: 'Quick Delivery', action: () => setInputText('Fastest delivery') },
    { icon: 'heart', label: 'Healthy', action: () => setInputText('Healthy options') },
  ];

  const renderMessage = ({ item }) => (
    item.type === 'user' ? (
      <ChatBubble
        message={item.text}
        isUser={true}
        timestamp={item.timestamp}
      />
    ) : (
      <AIMessage
        message={item.text}
        timestamp={item.timestamp}
      />
    )
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Food Assistant</Text>
        <MaterialCommunityIcons
          name="robot-happy"
          size={24}
          color={theme.colors.primary}
        />
      </View>

      {/* Messages */}
      <FlatList
        ref={scrollViewRef}
        data={messages}
        keyExtractor={item => item.id.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Recommendations */}
      {showRecommendations && recommendations.length > 0 && (
        <View style={styles.recommendationsContainer}>
          <Text style={styles.recommendationsTitle}>Recommended for you</Text>
          <FlatList
            horizontal
            data={recommendations}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <RecommendationCard
                recommendation={item}
                onPress={() => handleRecommendationPress(item)}
              />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recommendationsScroll}
          />
        </View>
      )}

      {/* Quick Suggestions */}
      {messages.length === 1 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Quick suggestions</Text>
          <View style={styles.suggestionsGrid}>
            {quickSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionButton}
                onPress={suggestion.action}
              >
                <MaterialCommunityIcons
                  name={suggestion.icon}
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.suggestionLabel}>{suggestion.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything about food..."
            placeholderTextColor={theme.colors.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxHeight={100}
          />
          <VoiceButton
            isRecording={isRecording}
            onPress={handleVoiceInput}
          />
        </View>
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}
          disabled={inputText.trim().length === 0}
        >
          <MaterialCommunityIcons
            name="send"
            size={20}
            color={inputText.trim().length > 0 ? theme.colors.primary : theme.colors.textTertiary}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  messagesContent: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  recommendationsContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
  },
  recommendationsTitle: {
    paddingHorizontal: theme.spacing.screenPadding,
    marginBottom: theme.spacing.md,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  recommendationsScroll: {
    paddingHorizontal: theme.spacing.screenPadding,
    gap: theme.spacing.md,
  },
  suggestionsContainer: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  suggestionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  suggestionButton: {
    flex: 0.47,
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    gap: theme.spacing.xs,
  },
  suggestionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: theme.colors.background,
    borderRadius: 24,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AIAssistantScreen;
