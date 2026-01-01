
const axios = require('axios');

async function testMenu() {
    try {
        // 1. Get Restaurants
        const rRes = await axios.get('http://localhost:3000/api/v1/restaurants');
        console.log('Resturants API Status:', rRes.status);
        const restaurants = rRes.data.data;
        console.log(`Found ${restaurants.length} restaurants.`);

        if (restaurants.length > 0) {
            const rId = restaurants[0].id; // Pick first one
            console.log(`Checking menu for ${restaurants[0].name} (${rId})...`);

            // 2. Get Menu
            const mRes = await axios.get(`http://localhost:3000/api/v1/restaurants/${rId}/menu`);
            console.log('Menu API Status:', mRes.status);
            console.log('Menu Data:', JSON.stringify(mRes.data, null, 2));
        }

    } catch (e) {
        console.error('Error:', e.message);
        if (e.response) {
            console.error('Response:', e.response.data);
        }
    }
}

testMenu();
