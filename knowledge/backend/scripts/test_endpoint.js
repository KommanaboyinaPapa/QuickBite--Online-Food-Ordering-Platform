const axios = require('axios');

async function test() {
    try {
        // 1. Login
        const loginRes = await axios.post('http://localhost:3000/api/v1/auth/login', {
            email: 'owner_1765223776043@test.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Login successful. Token:', token.substring(0, 20) + '...');

        // 2. Get My Restaurant
        const myRes = await axios.get('http://localhost:3000/api/v1/restaurants/my', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Get My Restaurant:', myRes.status, myRes.data.success);
        console.log('Restaurant Name:', myRes.data.data.name);

    } catch (e) {
        console.error('Full Error:', e);
    }
}

test();
