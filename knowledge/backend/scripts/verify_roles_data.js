
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding role verification data...');

    const passwordHash = await bcrypt.hash('password123', 10);
    const randomSuffix = Math.floor(Math.random() * 100000);

    // Helper to get unique phone
    const getPhone = () => `555${Math.floor(1000000 + Math.random() * 9000000)}`;

    // 1. Create Restaurant Owner
    const ownerEmail = 'owner_verify@test.com';
    let owner = await prisma.user.findUnique({ where: { email: ownerEmail } });
    if (!owner) {
        owner = await prisma.user.create({
            data: {
                id: `owner-verify-${randomSuffix}`,
                email: ownerEmail,
                passwordHash,
                firstName: 'Luigi',
                lastName: 'Mario',
                userType: 'restaurant',
                phone: getPhone() // Random phone
            }
        });
    }

    // 2. Create Restaurant
    let restaurant = await prisma.restaurant.findUnique({ where: { ownerId: owner.id } });
    if (!restaurant) {
        restaurant = await prisma.restaurant.create({
            data: {
                id: `rest-verify-${randomSuffix}`,
                ownerId: owner.id,
                name: "Luigi's Mansion",
                description: "Best ghost-free pizza",
                address: "Haunted Hill 1",
                cuisineTypes: ["Italian", "Pizza"],
                deliveryFee: 5.00
            }
        });
    }

    // 3. Create Delivery Agent
    const agentEmail = 'agent_verify@test.com';
    let agent = await prisma.user.findUnique({ where: { email: agentEmail } });
    if (!agent) {
        agent = await prisma.user.create({
            data: {
                id: `agent-verify-${randomSuffix}`,
                email: agentEmail,
                passwordHash,
                firstName: 'Toad',
                lastName: 'Kinopio',
                userType: 'delivery_agent',
                phone: getPhone() // Random phone
            }
        });
    }

    // 4. Create Customer
    const custEmail = 'cust_verify@test.com';
    let customer = await prisma.user.findUnique({ where: { email: custEmail } });
    if (!customer) {
        customer = await prisma.user.create({
            data: {
                id: `cust-verify-${randomSuffix}`,
                email: custEmail,
                passwordHash,
                firstName: 'Princess',
                lastName: 'Peach',
                userType: 'customer',
                phone: getPhone() // Random phone
            }
        });
    }

    // 5. Create Address for Customer
    let address = await prisma.address.findFirst({ where: { userId: customer.id } });
    if (!address) {
        address = await prisma.address.create({
            data: {
                id: `addr-verify-${randomSuffix}`,
                userId: customer.id,
                street: 'Castle Keep 1',
                city: 'Mushroom Kingdom',
                postalCode: '12345',
                addressType: 'home'
            }
        });
    }

    // 6. Create a PENDING Order (For Restaurant to Accept)
    // Ensure strict uniqueness for orderNumber
    const orderNum1 = `ORD-${Date.now()}-1`;
    const pendingOrder = await prisma.order.create({
        data: {
            orderNumber: orderNum1,
            customerId: customer.id,
            restaurantId: restaurant.id,
            deliveryAddressId: address.id,
            status: 'pending',
            subtotal: 20.00,
            tax: 1.00,
            deliveryFee: 5.00,
            total: 26.00,
            paymentMethod: 'card',
            paymentStatus: 'paid'
        }
    });

    // 7. Create a READY Order (For Agent to Accept)
    // Ensure strict uniqueness for orderNumber
    const orderNum2 = `ORD-${Date.now()}-2`;
    const readyOrder = await prisma.order.create({
        data: {
            orderNumber: orderNum2,
            customerId: customer.id,
            restaurantId: restaurant.id,
            deliveryAddressId: address.id,
            status: 'ready', // Ready for pickup
            subtotal: 30.00,
            tax: 1.50,
            deliveryFee: 5.00,
            total: 36.50,
            paymentMethod: 'card',
            paymentStatus: 'paid'
        }
    });

    console.log('Data seeded successfully!');
    console.log('Restaurant Owner: owner_verify@test.com / password123');
    console.log('Delivery Agent: agent_verify@test.com / password123');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
