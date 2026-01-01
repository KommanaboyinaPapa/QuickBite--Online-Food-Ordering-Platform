const axios = require('axios');
const logger = require('../utils/logger');

/**
 * AI Service: Supports Groq (Cloud) or Ollama (Local)
 */
class AIService {
  constructor() {
    // Prioritize OLLAMA if explicitly requested or if Groq key is missing/placeholder
    if (process.env.AI_PROVIDER === 'ollama' || !process.env.GROQ_API_KEY || (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.includes('your_groq_api_key'))) {
      this.provider = 'ollama';
      const ollamaBase = process.env.OLLAMA_API_URL || 'http://localhost:11434';
      this.baseURL = ollamaBase.includes('/api/chat') ? ollamaBase : `${ollamaBase}/api/chat`;
      this.model = 'llama3.2'; // Updated to llama3.2 as per user request
    } else {
      this.provider = 'groq';
      this.apiKey = process.env.GROQ_API_KEY;
      this.baseURL = 'https://api.groq.com/openai/v1/chat/completions';
      this.model = 'llama3-70b-8192';
    }
    logger.info(`AI Service initialized using provider: ${this.provider}`);
  }

  async generateResponse(messages, maxTokens = 250) {
    if (this.provider === 'groq') {
      const response = await axios.post(this.baseURL, {
        model: this.model,
        messages: messages,
        temperature: 0.7,
        max_tokens: maxTokens
      }, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000 // 15 second timeout
      });
      return response.data.choices[0].message.content;
    } else {
      // Ollama
      // Ollama chat API format: { model: "llama3", messages: [...] }
      const response = await axios.post(this.baseURL, {
        model: this.model,
        messages: messages,
        stream: false
      }, {
        timeout: 15000 // 15 second timeout
      });
      return response.data.message.content;
    }
  }

  async getHealthRecommendation(conversationHistory, allergyProfile) {
    try {
      // Build system prompt
      const systemPrompt = `You are a helpful food ordering health assistant. 
      User allergies: ${allergyProfile.allergies?.join(', ') || 'None'}
      Dietary restrictions: ${allergyProfile.dietaryRestrictions?.join(', ') || 'None'}
      Health conditions: ${allergyProfile.healthConditions?.join(', ') || 'None'}
      Spice preference: ${allergyProfile.spicePreference || 'Not specified'}
      
      Help the user find healthy food options that match their dietary needs and health profile.
      Be concise and helpful.`;

      // Prepare messages
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory
      ];

      const content = await this.generateResponse(messages, 200);

      logger.info(`AI recommendation generated (${this.provider})`);
      return {
        success: true,
        content: content
      };
    } catch (error) {
      logger.error(`AI service error: ${error.message}`);
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          error: 'AI service timeout. Please try again.'
        };
      }
      return {
        success: false,
        error: error.message
      };
    }
  }

  async analyzeMenuForHealth(menuItems, allergyProfile) {
    try {
      const menuText = menuItems
        .map(item => `${item.name} (${item.category}): ${item.description || 'No description'}`)
        .join('\n');

      const prompt = `Analyze these menu items for health suitability based on the user's profile:
      
      Allergies: ${allergyProfile.allergies?.join(', ') || 'None'}
      Dietary restrictions: ${allergyProfile.dietaryRestrictions?.join(', ') || 'None'}
      Health conditions: ${allergyProfile.healthConditions?.join(', ') || 'None'}
      
      Menu items:
      ${menuText}
      
      Recommend the healthiest options and flag any that might be problematic.`;

      const content = await this.generateResponse([{ role: 'user', content: prompt }], 1000);

      logger.info(`Menu analysis completed (${this.provider})`);
      return {
        success: true,
        analysis: content
      };
    } catch (error) {
      logger.error(`Menu analysis error: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateHealthInsights(orderHistory, allergyProfile) {
    try {
      const prompt = `Based on the user's recent orders and health profile, provide personalized health insights:
      
      Health profile:
      - Allergies: ${allergyProfile.allergies?.join(', ') || 'None'}
      - Dietary restrictions: ${allergyProfile.dietaryRestrictions?.join(', ') || 'None'}
      - Health conditions: ${allergyProfile.healthConditions?.join(', ') || 'None'}
      - Recent orders: ${orderHistory.join(', ')}
      
      Provide 2-3 actionable health tips related to their ordering patterns.`;

      const content = await this.generateResponse([{ role: 'user', content: prompt }], 500);

      logger.info(`Health insights generated (${this.provider})`);
      return {
        success: true,
        insights: content
      };
    } catch (error) {
      logger.error(`Health insights error: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new AIService();
