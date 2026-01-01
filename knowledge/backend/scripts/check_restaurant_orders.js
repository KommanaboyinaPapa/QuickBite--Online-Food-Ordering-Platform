const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function check() {
    // Find the restaurant for the owner
    const r = await p.restaurant.findFirst({
        where: { ownerId: 'cmizlckfv0000d912g1qrwqne' }
    });
    console.log('Restaurant for owner cmizlckfv...:', r?.id, r?.name);

    // Get orders for that restaurant
    if (r) {
        const orders = await p.order.findMany({
            where: { restaurantId: r.id },
            take: 5,
            orderBy: { createdAt: 'desc' }
        });
        console.log('Orders count for this restaurant:', orders.length);
        orders.forEach(o => console.log('  Order:', o.id.slice(0, 12), 'Status:', o.status, 'CustomerID:', o.customerId.slice(0, 12)));
    }

    await p.$disconnect();
}

check();
