
const axios = require('axios');

async function testMenu() {
    try {
        console.log("Fetching restaurants...");
        const rRes = await axios.get('http://localhost:3000/api/v1/restaurants');
        const restaurants = rRes.data.data;
        console.log(`Found ${restaurants.length} restaurants.`);

        if (restaurants.length > 0) {
            const rId = restaurants[0].id;
            console.log(`Fetching menu for ${restaurants[0].name} (${rId})...`);

            const mRes = await axios.get(`http://localhost:3000/api/v1/restaurants/${rId}/menu`);
            console.log('Menu API Status:', mRes.status);
            console.log('Menu Data keys:', Object.keys(mRes.data.data)); // Should be keys: items, categories
            console.log('Items count:', mRes.data.data.items.length);
            console.log('Categories count:', mRes.data.data.categories.length);
        } else {
            console.log("No restaurants to test menu.");
        }

    } catch (e) {
        console.error('Error:', e.message);
        if (e.response) {
            console.error('Response Data:', e.response.data);
        }
    }
}

testMenu();
