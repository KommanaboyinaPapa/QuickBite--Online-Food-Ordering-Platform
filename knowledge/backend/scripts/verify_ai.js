
const axios = require('axios');

const API_URL = 'http://localhost:3000/api/v1';
let userToken = '';

async function main() {
    console.log('Verifying AI Assistant...');

    // 1. Login as Owner (who is a valid user)
    try {
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'owner_verify@test.com',
            password: 'password123'
        });
        userToken = loginRes.data.data.tokens.accessToken;
        console.log('Logged in as Owner.');
    } catch (error) {
        console.error('Login failed:', error.message);
        if (error.response) console.error('Details:', error.response.data);
        return;
    }

    // 2. Start Conversation
    try {
        console.log('Starting Conversation...');
        const startRes = await axios.post(
            `${API_URL}/ai/conversation/start`,
            { initialContext: { dietary: 'vegan' } },
            { headers: { Authorization: `Bearer ${userToken}` } }
        );
        const conversationId = startRes.data.data.id;
        console.log('Conversation Started:', conversationId);

        // 3. Send Message
        console.log('Sending Message...');
        const msgRes = await axios.post(
            `${API_URL}/ai/conversation/message`,
            { conversationId, message: 'I want something spicy.' },
            { headers: { Authorization: `Bearer ${userToken}` } }
        );

        // Check for mock response
        const messages = msgRes.data.data.conversationData.messages;
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.role === 'assistant') {
            console.log('SUCCESS: AI replied:', lastMsg.content);
        } else {
            console.error('FAILURE: AI did not reply.');
        }

    } catch (error) {
        console.error('AI Test Failed:', error.response?.data || error.message);
    }
}

main();
