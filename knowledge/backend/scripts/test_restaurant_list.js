const axios = require('axios');

async function testList() {
    try {
        console.log('Fetching restaurants...');
        const res = await axios.get('http://localhost:3000/api/v1/restaurants');
        console.log('Status:', res.status);
        console.log('Success:', res.data.success);
        console.log('Count:', res.data.data ? res.data.data.length : 0);
        if (res.data.data && res.data.data.length > 0) {
            console.log('First Rest:', res.data.data[0].name, 'ID:', res.data.data[0].id);
            console.log('Cuisine:', res.data.data[0].cuisineTypes);
        } else {
            console.log('No restaurants found in list!');
        }
    } catch (e) {
        console.error('Error:', e.message);
        if (e.response) console.error('Data:', e.response.data);
    }
}

testList();
