const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Get recent orders
    const orders = await prisma.order.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: {
            restaurant: true,
            customer: true
        }
    });

    console.log('Recent Orders:');
    orders.forEach(o => {
        console.log(`  Order ID: ${o.id.slice(0, 12)}...`);
        console.log(`  Restaurant: ${o.restaurant?.name || 'N/A'}`);
        console.log(`  Restaurant Owner ID: ${o.restaurant?.ownerId?.slice(0, 12) || 'N/A'}`);
        console.log(`  Customer: ${o.customer?.firstName} (${o.customerId?.slice(0, 12)})`);
        console.log('---');
    });

    // Get restaurant owners
    const restaurants = await prisma.restaurant.findMany({
        include: { owner: true }
    });

    console.log('\nRestaurants and Owners:');
    restaurants.forEach(r => {
        console.log(`  ${r.name} - Owner: ${r.owner?.email} (${r.ownerId?.slice(0, 12)})`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
