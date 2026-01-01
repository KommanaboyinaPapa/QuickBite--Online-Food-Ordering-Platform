
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { theme } from '@styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import aiService from '@services/aiService';

const { colors, typography, spacing } = theme;

const AIAssistantScreen = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const flatListRef = useRef(null);
  const queuedItems = useSelector(state => state.ai?.queuedItems || []);

  const startChat = async () => {
    try {
      setLoading(true);
      const response = await aiService.startConversation();
      if (response.success && response.data) {
        setConversationId(response.data.id);
        const baseMessages = response.data.conversationData.messages || [];
        const contextMsg = queuedItems.length
          ? [{ role: 'assistant', content: `I have these items queued for analysis: ${queuedItems.map(q => q.name || q.title || q.id).join(', ')}. Ask me anything about them, allergens, or pairings.`, timestamp: new Date() }]
          : [];
        setMessages([...baseMessages, ...contextMsg]);
        return;
      }
    } catch (error) {
      console.error('Failed to start AI chat:', error);
      // Fallback message if backend fails
      setMessages([{
        role: 'assistant',
        content: queuedItems.length
          ? `Hello! I have your queued items ready: ${queuedItems.map(q => q.name || q.title || q.id).join(', ')}.`
          : 'Hello! I am ready to help you find healthy food.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !conversationId) return;

    const userMsg = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiService.sendMessage(conversationId, userMsg.content);
      if (response.success && response.data) {
        setMessages(response.data.conversationData.messages);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I am having trouble connecting right now.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.botBubble
      ]}>
        <Text style={[
          styles.messageText,
          isUser ? styles.userText : styles.botText
        ]}>{item.content}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={typography.h3}>Health Assistant</Text>
        <Text style={typography.caption}>Powered by AI</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about healthy options..."
          placeholderTextColor={colors.textSecondary}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Ionicons name="send" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  list: {
    padding: spacing.md,
    gap: spacing.md,
  },
  messageBubble: {
    padding: spacing.md,
    borderRadius: 16,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: colors.surface,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: colors.white,
  },
  botText: {
    color: colors.text,
  },
  loadingContainer: {
    padding: spacing.sm,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default AIAssistantScreen;
