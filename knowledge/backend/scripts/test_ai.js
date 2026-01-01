require('dotenv').config();
const aiService = require('../src/services/ai.service');

async function testAI() {
    console.log('Testing AI Service...');
    console.log(`Provider: ${aiService.provider}`);
    console.log(`Model: ${aiService.model}`);
    console.log(`BaseURL: ${aiService.baseURL}`);

    const messages = [
        { role: 'user', content: 'Say "Hello, World!" if you can hear me.' }
    ];

    try {
        const response = await aiService.generateResponse(messages);
        console.log('\nAI Response:');
        console.log(response);

        if (response) {
            console.log('\nSUCCESS: AI Service is working!');
        } else {
            console.log('\nFAILURE: Received empty response.');
        }
    } catch (error) {
        console.error('\nERROR:', error.message);
        if (error.response) {
            console.error('Data:', error.response.data);
        }
    }
}

testAI();
