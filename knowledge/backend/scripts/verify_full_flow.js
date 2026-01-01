
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

// Mock Data Generators
const generateEmail = (role) => `${role}_${Date.now()}@test.com`;
const generatePhone = () => `9${Math.floor(Math.random() * 1000000000)}`;

async function main() {
    console.log('🚀 Starting Full System Verification...');

    try {
        // 1. Create Users
        console.log('\n👤 Creating Users...');

        const customerPassword = await bcrypt.hash('password123', 10);
        const customer = await prisma.user.create({
            data: {
                email: generateEmail('customer'),
                passwordHash: customerPassword,
                firstName: 'John',
                lastName: 'Customer',
                phone: generatePhone(),
                userType: 'customer'
            }
        });
        console.log(`✅ Customer created: ${customer.firstName}`);

        const ownerPassword = await bcrypt.hash('password123', 10);
        const restaurantOwner = await prisma.user.create({
            data: {
                email: generateEmail('restaurant'),
                passwordHash: ownerPassword,
                firstName: 'Chef',
                lastName: 'Mario',
                phone: generatePhone(),
                userType: 'restaurant'
            }
        });
        console.log(`✅ Restaurant Owner created: ${restaurantOwner.firstName}`);

        const agentPassword = await bcrypt.hash('password123', 10);
        const agent = await prisma.user.create({
            data: {
                email: generateEmail('agent'),
                passwordHash: agentPassword,
                firstName: 'Speedy',
                lastName: 'Gonzales',
                phone: generatePhone(),
                userType: 'delivery_agent'
            }
        });
        console.log(`✅ Delivery Agent created: ${agent.firstName}`);

        // 2. Create Restaurant Profile
        console.log('\n🍕 Setting up Restaurant...');
        const restaurant = await prisma.restaurant.create({
            data: {
                name: "Mario's Pizza",
                description: "Best authentic Italian pizza",
                address: "123 Food Street",
                phone: "555-0100",
                rating: 4.8,
                latitude: 40.7128,
                longitude: -74.0060,
                ownerId: restaurantOwner.id,
                isOpen: true,
                cuisineTypes: ["Italian", "Pizza"]
            }
        });
        console.log(`✅ Restaurant '${restaurant.name}' created`);

        // 3. Add Menu Items with Ingredients
        console.log('\n📋 Adding Menu Items...');

        // Create Ingredients first
        const chili = await prisma.ingredient.create({
            data: { name: "Chili Flakes", restaurantId: restaurant.id }
        });
        const cheese = await prisma.ingredient.create({
            data: { name: "Cheese", restaurantId: restaurant.id }
        });
        const pepperoni = await prisma.ingredient.create({
            data: { name: "Pepperoni", restaurantId: restaurant.id }
        });

        const pizza = await prisma.menuItem.create({
            data: {
                restaurantId: restaurant.id,
                name: "Spicy Pepperoni",
                description: "Pepperoni with chili flakes",
                price: 15.99,
                category: "Pizza",
                imageUrl: "https://placehold.co/400",
                ingredients: {
                    create: [
                        { ingredientId: chili.id },
                        { ingredientId: cheese.id },
                        { ingredientId: pepperoni.id }
                    ]
                }
            },
            include: { ingredients: { include: { ingredient: true } } }
        });

        console.log(`✅ Menu Item added: ${pizza.name} with ${pizza.ingredients.length} ingredients`);

        // 4. Simulate AI Health Check (Mock logic)
        console.log('\n🤖 Testing AI Health Assistant...');
        const spiceAllergy = true;
        if (spiceAllergy) {
            const hasInfo = pizza.ingredients.some(i => i.ingredient.name === "Chili Flakes");
            if (hasInfo) {
                console.log(`✅ AI Insight: Detected 'Chili Flakes' in ${pizza.name}. Recommendation: Exclude it.`);
            }
        }

        // 5. Customer Places Order (With Exclusion)
        console.log('\n🛒 Customer Placing Order...');

        const address = await prisma.address.create({
            data: {
                userId: customer.id,
                street: "456 Home Ave",
                city: "New York",
                postalCode: "10001",
                latitude: 40.7150,
                longitude: -74.0080
            }
        });

        const order = await prisma.order.create({
            data: {
                orderNumber: `ORD-${Date.now()}`,
                customerId: customer.id,
                restaurantId: restaurant.id,
                deliveryAddressId: address.id,
                subtotal: 15.99,
                tax: 0.8,
                deliveryFee: 2.0,
                total: 18.79,
                status: 'pending',
                paymentStatus: 'completed',
                paymentMethod: 'razorpay',
                items: {
                    create: [{
                        menuItemId: pizza.id,
                        quantity: 1,
                        priceAtOrder: 15.99,
                        exclusions: {
                            create: [{ ingredientId: chili.id }]
                        }
                    }]
                }
            },
            include: { items: { include: { exclusions: true } } }
        });
        console.log(`✅ Order #${order.orderNumber} created`);
        if (order.items[0].exclusions.length > 0) {
            console.log(`   Exclusions: Chili Flakes (ID: ${chili.id}) excluded`);
        }

        // 6. Restaurant Accepts Order
        console.log('\n👨‍🍳 Restaurant Processing...');
        await prisma.order.update({
            where: { id: order.id },
            data: { status: 'preparing' }
        });
        console.log(`✅ Order Status: Preparing`);

        await new Promise(r => setTimeout(r, 500));

        await prisma.order.update({
            where: { id: order.id },
            data: { status: 'ready' }
        });
        console.log(`✅ Order Status: Ready for Pickup`);

        // 7. Delivery Agent Flow
        console.log('\n🛵 Delivery Agent Operations...');

        const availableOrders = await prisma.order.findMany({
            where: { status: 'ready', deliveryAgentId: null }
        });
        console.log(`✅ Agent found ${availableOrders.length} available order(s)`);

        if (availableOrders.length > 0) {
            const updatedOrder = await prisma.order.update({
                where: { id: availableOrders[0].id },
                data: {
                    deliveryAgentId: agent.id,
                    status: 'picked_up'
                }
            });
            console.log(`✅ Agent accepted order. Status: Picked Up`);

            await prisma.tracking.create({
                data: {
                    orderId: updatedOrder.id,
                    currentLatitude: 40.7138,
                    currentLongitude: -74.0070,
                    status: 'on_the_way'
                }
            });
            console.log(`✅ Live Tracking Update sent`);

            await prisma.order.update({
                where: { id: updatedOrder.id },
                data: { status: 'delivered' }
            });
            console.log(`✅ Order Delivered!`);
        }

        console.log('\n🎉 FULL SYSTEM VERIFICATION COMPLETED SUCCESSFULLY!');

    } catch (error) {
        console.error('\n❌ Verification Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
