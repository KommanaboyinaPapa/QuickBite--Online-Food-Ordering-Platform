/**
 * useAI Hook - Handle AI chat and recommendations
 */

import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import * as aiService from '@services/aiService';
import * as aiSlice from '@redux/slices/aiSlice';

export const useAI = () => {
  const dispatch = useDispatch();
  const ai = useSelector(state => state.ai);

  const sendMessage = useCallback(async (conversationId, message) => {
    try {
      dispatch(aiSlice.setLoading(true));
      const response = await aiService.sendMessage(conversationId, message);
      dispatch(aiSlice.addMessage({
        conversationId,
        message: response
      }));
      return response;
    } catch (err) {
      dispatch(aiSlice.setError(err.message));
      throw err;
    } finally {
      dispatch(aiSlice.setLoading(false));
    }
  }, [dispatch]);

  const sendVoiceMessage = useCallback(async (conversationId, audioBlob) => {
    try {
      dispatch(aiSlice.setLoading(true));
      dispatch(aiSlice.setVoiceMode(true));
      const response = await aiService.sendVoiceMessage(conversationId, audioBlob);
      dispatch(aiSlice.addMessage({
        conversationId,
        message: response
      }));
      return response;
    } catch (err) {
      dispatch(aiSlice.setError(err.message));
      throw err;
    } finally {
      dispatch(aiSlice.setLoading(false));
      dispatch(aiSlice.setVoiceMode(false));
    }
  }, [dispatch]);

  const getConversations = useCallback(async () => {
    try {
      dispatch(aiSlice.setLoading(true));
      const response = await aiService.getConversations();
      dispatch(aiSlice.setConversations(response));
      return response;
    } catch (err) {
      dispatch(aiSlice.setError(err.message));
      throw err;
    } finally {
      dispatch(aiSlice.setLoading(false));
    }
  }, [dispatch]);

  const getConversationById = useCallback(async (conversationId) => {
    try {
      dispatch(aiSlice.setLoading(true));
      const response = await aiService.getConversationById(conversationId);
      dispatch(aiSlice.setCurrentConversation(response));
      return response;
    } catch (err) {
      dispatch(aiSlice.setError(err.message));
      throw err;
    } finally {
      dispatch(aiSlice.setLoading(false));
    }
  }, [dispatch]);

  const createConversation = useCallback(async (healthContext) => {
    try {
      dispatch(aiSlice.setLoading(true));
      const response = await aiService.createConversation(healthContext);
      dispatch(aiSlice.setCurrentConversation(response));
      return response;
    } catch (err) {
      dispatch(aiSlice.setError(err.message));
      throw err;
    } finally {
      dispatch(aiSlice.setLoading(false));
    }
  }, [dispatch]);

  const getRecommendations = useCallback(async (conversationId) => {
    try {
      const response = await aiService.getRecommendations(conversationId);
      dispatch(aiSlice.setRecommendations(response));
      return response;
    } catch (err) {
      dispatch(aiSlice.setError(err.message));
      throw err;
    }
  }, [dispatch]);

  const saveRecommendation = useCallback(async (recommendationId) => {
    try {
      const response = await aiService.saveRecommendation(recommendationId);
      dispatch(aiSlice.addSavedRecommendation(response));
      return response;
    } catch (err) {
      dispatch(aiSlice.setError(err.message));
      throw err;
    }
  }, [dispatch]);

  const addToCartFromRecommendation = useCallback((menuItem) => {
    dispatch(aiSlice.addRecommendationToCart(menuItem));
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(aiSlice.setError(null));
  }, [dispatch]);

  const resetConversation = useCallback(() => {
    dispatch(aiSlice.setCurrentConversation(null));
  }, [dispatch]);

  return {
    ai,
    conversations: ai.conversations,
    currentConversation: ai.currentConversation,
    savedRecommendations: ai.savedRecommendations,
    loading: ai.isLoading,
    error: ai.error,
    isVoiceMode: ai.isVoiceMode,
    sendMessage,
    sendVoiceMessage,
    getConversations,
    getConversationById,
    createConversation,
    getRecommendations,
    saveRecommendation,
    addToCartFromRecommendation,
    clearError,
    resetConversation
  };
};
