
const axios = require('axios');

const API_URL = 'http://localhost:3000/api/v1';

async function test() {
    try {
        // 1. Login as Owner
        console.log('Logging in as Owner...');
        const ownerRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'owner_verify@test.com',
            password: 'password123'
        });
        // Correct token path based on auth.controller.js and jwt.handler.js
        const ownerToken = ownerRes.data.data.tokens.accessToken;
        console.log('Owner Token obtained.');

        // 2. Get Restaurant Orders
        console.log('Fetching Restaurant Orders...');
        const restOrdersRes = await axios.get(`${API_URL}/orders/restaurant`, {
            headers: { Authorization: `Bearer ${ownerToken}` }
        });
        console.log('Restaurant Orders:', JSON.stringify(restOrdersRes.data, null, 2));

        // 3. Login as Agent
        console.log('Logging in as Agent...');
        const agentRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'agent_verify@test.com',
            password: 'password123'
        });
        // Correct token path
        const agentToken = agentRes.data.data.tokens.accessToken;
        console.log('Agent Token obtained.');

        // 4. Get Available Orders
        console.log('Fetching Available Orders...');
        const availOrdersRes = await axios.get(`${API_URL}/orders/available`, {
            headers: { Authorization: `Bearer ${agentToken}` }
        });
        console.log('Available Orders for Agent:', JSON.stringify(availOrdersRes.data, null, 2));

    } catch (error) {
        console.error('API Test Failed:', error.response ? error.response.data : error.message);
    }
}

test();
