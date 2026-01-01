/**
 * AI Slice - Redux Toolkit slice for AI assistant and conversations
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as aiService from '@services/aiService';

export const startConversation = createAsyncThunk(
  'ai/startConversation',
  async (healthContext, { rejectWithValue }) => {
    try {
      const response = await aiService.startConversation(healthContext);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start conversation');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'ai/sendMessage',
  async ({ conversationId, message, isVoice }, { rejectWithValue }) => {
    try {
      const response = await aiService.sendMessage(conversationId, message, isVoice);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const getRecommendations = createAsyncThunk(
  'ai/getRecommendations',
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await aiService.getRecommendations(conversationId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get recommendations');
    }
  }
);

export const fetchConversationHistory = createAsyncThunk(
  'ai/fetchConversationHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await aiService.getConversationHistory();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch history');
    }
  }
);

const initialState = {
  conversations: [],
  currentConversation: null,
  currentMessages: [],
  recommendations: [],
  savedRecommendations: [],
  queuedItems: [],
  isVoiceMode: false,
  isLoading: false,
  isWaitingForAI: false,
  error: null,
  healthContext: {
    conditions: [],
    allergies: [],
    dietaryGoals: '',
  },
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      const { sender, content, type } = action.payload;
      state.currentMessages.push({
        id: `${Date.now()}`,
        sender,
        content,
        type,
        timestamp: new Date().toISOString(),
      });
    },

    setVoiceMode: (state, action) => {
      state.isVoiceMode = action.payload;
    },

    setHealthContext: (state, action) => {
      state.healthContext = action.payload;
    },

    saveRecommendation: (state, action) => {
      state.savedRecommendations.push(action.payload);
    },

    removeSavedRecommendation: (state, action) => {
      state.savedRecommendations = state.savedRecommendations.filter(
        r => r.id !== action.payload
      );
    },

    queueItemForAI: (state, action) => {
      state.queuedItems.push({
        ...action.payload,
        queuedAt: new Date().toISOString(),
      });
    },

    clearQueuedItems: (state) => {
      state.queuedItems = [];
    },

    clearConversation: (state) => {
      state.currentConversation = null;
      state.currentMessages = [];
      state.recommendations = [];
    },

    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Start Conversation
    builder
      .addCase(startConversation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentConversation = action.payload;
        state.currentMessages = [];
      })
      .addCase(startConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Send Message
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isWaitingForAI = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isWaitingForAI = false;
        const { userMessage, aiResponse, recommendations } = action.payload;
        
        // Add user message
        state.currentMessages.push({
          id: `${Date.now()}`,
          sender: 'user',
          content: userMessage,
          type: 'text',
          timestamp: new Date().toISOString(),
        });
        
        // Add AI response
        state.currentMessages.push({
          id: `${Date.now() + 1}`,
          sender: 'ai',
          content: aiResponse,
          type: 'text',
          timestamp: new Date().toISOString(),
        });
        
        // Update recommendations
        if (recommendations) {
          state.recommendations = recommendations;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isWaitingForAI = false;
        state.error = action.payload;
      });

    // Get Recommendations
    builder
      .addCase(getRecommendations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRecommendations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recommendations = action.payload;
      })
      .addCase(getRecommendations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Conversation History
    builder
      .addCase(fetchConversationHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchConversationHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversationHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  addMessage,
  setVoiceMode,
  setHealthContext,
  saveRecommendation,
  removeSavedRecommendation,
  clearConversation,
  clearError,
  queueItemForAI,
  clearQueuedItems,
} = aiSlice.actions;

export default aiSlice.reducer;
