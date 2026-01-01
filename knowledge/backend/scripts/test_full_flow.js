const axios = require('axios');

const API_URL = 'http://localhost:3000/api/v1';

// Users
const CUSTOMER = { email: 'customer_final_1@test.com', password: 'password123' };
const OWNER = { email: 'owner_1765223776043@test.com', password: 'password123' };
const DELIVERY = { email: 'delivery_test_1765253300197@test.com', password: 'password123' };

let customerToken, ownerToken, deliveryToken;
let restaurantId, itemId, orderId;

async function runFlow() {
    try {
        console.log('🚀 Starting API Flow Verification...');

        // 1. Register/Login Customer
        console.log('\n--- CUSTOMER PHASE ---');
        try {
            await axios.post(`${API_URL}/auth/register`, { ...CUSTOMER, firstName: 'Test', lastName: 'Cust', phone: '1234567890' });
            console.log('✅ Customer Registered');
        } catch (e) {
            console.log('ℹ️ Customer already registered (or error)');
        }

        const custRes = await axios.post(`${API_URL}/auth/login`, CUSTOMER);
        console.log('Login Res:', custRes.data);
        if (custRes.data.success && custRes.data.data && custRes.data.data.token) {
            customerToken = custRes.data.data.token;
        } else if (custRes.data.token) {
            customerToken = custRes.data.token;
        }
        console.log('✅ Customer Logged In, Token:', customerToken ? 'Yes' : 'No');

        // 2. Get Restaurants
        const restRes = await axios.get(`${API_URL}/restaurants`, { headers: { Authorization: `Bearer ${customerToken}` } });
        if (restRes.data.data.length === 0) throw new Error('No restaurants found');
        restaurantId = restRes.data.data[0].id; // Use first restaurant (Assuming it's the owner's)
        console.log('✅ Found Restaurant:', restRes.data.data[0].name);

        // 3. Get Menu
        const menuRes = await axios.get(`${API_URL}/restaurants/${restaurantId}/menu`, { headers: { Authorization: `Bearer ${customerToken}` } });
        if (menuRes.data.data.items.length === 0) throw new Error('No menu items');
        itemId = menuRes.data.data.items[0].id;
        console.log('✅ Found Menu Item:', menuRes.data.data.items[0].name);

        // 4. Place Order
        const orderPayload = {
            restaurantId,
            items: [{ menuItemId: itemId, quantity: 1, exclusions: [] }],
            subtotal: 100,
            deliveryFee: 20,
            tax: 5,
            total: 125,
            deliveryAddress: {
                street: "123 Main St",
                city: "Test City",
                postalCode: "123456",
                latitude: 0,
                longitude: 0
            },
            paymentMethod: 'card'
        };
        const orderRes = await axios.post(`${API_URL}/orders`, orderPayload, { headers: { Authorization: `Bearer ${customerToken}` } });
        orderId = orderRes.data.data.id;
        // 9. Accept Order (if visible)
        // Find our order
        const targetOrder = availRes.data.data.find(o => o.id === orderId);
        if (targetOrder) {
            await axios.put(`${API_URL}/orders/${orderId}/delivery/accept`, {}, { headers: { Authorization: `Bearer ${deliveryToken}` } });
            console.log('✅ Delivery Accepted Order');

            await axios.put(`${API_URL}/orders/${orderId}/status`, { status: 'picked_up' }, { headers: { Authorization: `Bearer ${deliveryToken}` } });
            console.log('✅ Order Picked Up');

            await axios.put(`${API_URL}/orders/${orderId}/status`, { status: 'delivered' }, { headers: { Authorization: `Bearer ${deliveryToken}` } });
            console.log('✅ Order Delivered');
        } else {
            console.log('⚠️ Order not found in available list (Maybe ID mismatch or Owner didn\'t mark Ready?)');
        }

        console.log('\n✅✅ FULL FLOW VERIFICATION COMPLETE');

    } catch (e) {
        console.error('❌ Error:', e.response ? e.response.data : e.message);
    }
}

runFlow();
