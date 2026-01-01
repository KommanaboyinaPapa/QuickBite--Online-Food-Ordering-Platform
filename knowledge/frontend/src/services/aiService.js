
import apiClient from './api';

const AI_ENDPOINT = '/ai';

const aiService = {
  // Start new conversation
  startConversation: async (initialContext = {}) => {
    const response = await apiClient.post(`${AI_ENDPOINT}/conversation/start`, { initialContext });
    return response.data;
  },

  // Send message
  sendMessage: async (conversationId, message) => {
    const response = await apiClient.post(`${AI_ENDPOINT}/conversation/message`, {
      conversationId,
      message
    });
    return response.data;
  },

  // Get history
  getHistory: async (conversationId) => {
    const response = await apiClient.get(`${AI_ENDPOINT}/conversation/${conversationId}`);
    return response.data;
  },

  // Get recommendations
  getRecommendations: async (conversationId) => {
    const response = await apiClient.get(`${AI_ENDPOINT}/conversation/${conversationId}/recommendations`);
    return response.data;
  }
};

export default aiService;
