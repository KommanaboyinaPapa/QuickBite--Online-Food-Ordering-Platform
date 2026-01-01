
const API_URL = 'http://127.0.0.1:3000/api/v1';
let token = null;

async function runSimulation() {
    try {
        console.log('--- STARTING MANUAL CUSTOMER FLOW SIMULATION (FETCH) ---');

        // Helper for requests
        const request = async (method, endpoint, body = null, headers = {}) => {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                }
            };
            if (body) options.body = JSON.stringify(body);

            const res = await fetch(`${API_URL}${endpoint}`, options);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Request failed');
            return data;
        };

        // 0. REGISTER (Ensure user exists)
        console.log('\n0. Registering/Logging in User...');
        const email = `customer_${Date.now()}@test.com`;
        const password = 'password123';

        try {
            await request('POST', '/auth/register', {
                firstName: 'Test',
                lastName: 'User',
                email,
                password,
                phone: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
                userType: 'customer'
            });
            console.log(`✅ Registered new user: ${email}`);
        } catch (e) {
            console.log('ℹ️ Registration failed (might exist):', e.message);
        }
        try {
            const loginRes = await request('POST', '/auth/login', {
                email,
                password
            });
            token = loginRes.data.tokens.accessToken;
            console.log('✅ Login Successful. User ID:', loginRes.data.user.id);
        } catch (e) {
            console.error('❌ Login Failed:', e.message);
            process.exit(1);
        }

        const authHeaders = { Authorization: `Bearer ${token}` };

        // 2. GET RESTAURANTS
        console.log('\n2. Fetching Restaurants...');
        const restRes = await request('GET', '/restaurants', null, authHeaders);
        const restaurant = restRes.data[0];
        if (!restaurant) throw new Error('No restaurants found');
        console.log(`✅ Found Restaurant: ${restaurant.name} (ID: ${restaurant.id})`);

        // 3. GET MENU
        console.log(`\n3. Fetching Menu for ${restaurant.name}...`);
        const menuRes = await request('GET', `/restaurants/${restaurant.id}/menu`, null, authHeaders);
        const menuItem = menuRes.data.items[0];
        if (!menuItem) throw new Error('No menu items found');
        console.log(`✅ Found Menu Item: ${menuItem.name} - $${menuItem.price} (ID: ${menuItem.id})`);

        // Fetch user for address
        const userRes = await request('GET', '/users/profile', null, authHeaders);
        let address = userRes.data.addresses[0];

        if (!address) {
            console.log('⚠️ No address found, creating one...');
            const addrRes = await request('POST', '/users/addresses', {
                street: '123 Test St',
                city: 'Test City',
                state: 'TS',
                zipCode: '12345',
                latitude: 37.7749,
                longitude: -122.4194
            }, authHeaders);
            address = addrRes.data;
            console.log('✅ Address created');
        }

        // 5. PLACE ORDER (From DB Cart)
        console.log('\n5. Placing Order (from DB Cart)...');
        const orderPayload = {
            restaurantId: restaurant.id,
            deliveryAddressId: address.id,
            specialInstructions: 'Final Verification'
        };

        const orderRes = await request('POST', '/orders', orderPayload, authHeaders);
        const order = orderRes.data;
        console.log('✅ Order Placed Successfully!');
        console.log(`   Order #: ${order.orderNumber}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Total: $${order.total}`);

        // 6. TRACK ORDER
        console.log(`\n6. Tracking Order ${order.id}...`);
        const trackRes = await request('GET', `/orders/${order.id}`, null, authHeaders);
        console.log(`✅ Tracking Verified. Current Status: ${trackRes.data.status}`);
        console.log(`   ETA: ${trackRes.data.tracking?.eta || 'Calculating...'}`);

        console.log('\n--- SIMULATION COMPLETE: SUCCESS ---');

    } catch (error) {
        console.error('\n❌ SIMULATION FAILED:', error.message);
    }
}

runSimulation();
