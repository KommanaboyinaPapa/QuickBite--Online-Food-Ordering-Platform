// backend/src/controllers/ai.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');
const aiService = require('../services/ai.service');

const startConversation = async (req, res, next) => {
  try {
    const { initialContext } = req.body;
    logger.info(`Starting conversation for user: ${req.user.id}`);

    // Get user's allergy profile for context
    const allergyProfile = await prisma.allergyProfile.findFirst({
      where: { userId: req.user.id }
    });

    const conversation = await prisma.aIConversation.create({
      data: {
        userId: req.user.id,
        conversationData: {
          messages: [
            {
              role: 'assistant',
              content: 'Hi! I\'m your food ordering health assistant. How can I help you today?',
              timestamp: new Date().toISOString()
            }
          ]
        }
      }
    });

    logger.info(`AI conversation started: ${conversation.id}`);

    res.status(201).json({
      success: true,
      message: 'Conversation started',
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, message } = req.body;

    // Get conversation
    const conversation = await prisma.aIConversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation || conversation.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Add user message
    const updatedConversation = await prisma.aIConversation.update({
      where: { id: conversationId },
      data: {
        conversationData: {
          messages: [
            ...(conversation.conversationData.messages || []),
            {
              role: 'user',
              content: message,
              timestamp: new Date().toISOString()
            }
          ]
        }
      }
    });

    // Generate AI response
    try {
      const messages = updatedConversation.conversationData.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const aiResponseContent = await aiService.generateResponse(messages);

      const assistantResponse = {
        role: 'assistant',
        content: aiResponseContent,
        timestamp: new Date().toISOString()
      };

      // Add assistant response to DB
      const finalConversation = await prisma.aIConversation.update({
        where: { id: conversationId },
        data: {
          conversationData: {
            messages: [
              ...updatedConversation.conversationData.messages,
              assistantResponse
            ]
          }
        }
      });

      logger.info(`AI Response generated for conversation: ${conversationId}`);

      res.status(200).json({
        success: true,
        message: 'Message processed',
        data: finalConversation
      });
    } catch (aiError) {
      logger.error(`AI Generation failed: ${aiError.message}`);
      // Fallback or error handling
      return res.status(500).json({
        success: false,
        message: 'Failed to generate AI response'
      });
    }
  } catch (error) {
    next(error);
  }
};

const getConversationHistory = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const conversation = await prisma.aIConversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation || conversation.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

const getRecommendations = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const recommendations = await prisma.aIRecommendation.findMany({
      where: { conversationId },
      include: {
        menuItem: {
          include: {
            restaurant: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};

const processVoiceInput = async (req, res, next) => {
  try {
    const { audioBase64, conversationId } = req.body;

    // TODO: Convert audio to text using Expo Speech or similar
    // For now, mock response
    const transcribedText = 'Show me healthy vegan options';

    // Send as message
    const conversation = await prisma.aIConversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation || conversation.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const updatedConversation = await prisma.aIConversation.update({
      where: { id: conversationId },
      data: {
        conversationData: {
          messages: [
            ...(conversation.conversationData.messages || []),
            {
              role: 'user',
              content: transcribedText,
              timestamp: new Date().toISOString(),
              isVoice: true
            }
          ]
        }
      }
    });

    logger.info(`Voice input processed: ${conversationId}`);

    res.status(200).json({
      success: true,
      message: 'Voice input processed',
      data: {
        transcribedText,
        conversation: updatedConversation
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startConversation,
  sendMessage,
  getConversationHistory,
  getRecommendations,
  processVoiceInput
};
