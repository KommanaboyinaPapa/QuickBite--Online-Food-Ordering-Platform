// backend/src/routes/ai.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const {
  startConversation,
  sendMessage,
  getConversationHistory,
  getRecommendations,
  processVoiceInput
} = require('../controllers/ai.controller');

// All routes protected
router.use(authMiddleware);

// Conversation routes
router.post('/conversation/start', startConversation);
router.post('/conversation/message', sendMessage);
router.get('/conversation/:conversationId', getConversationHistory);

// Recommendations
router.get('/conversation/:conversationId/recommendations', getRecommendations);

// Voice input
router.post('/voice-input', processVoiceInput);

module.exports = router;
