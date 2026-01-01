const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.restaurant.count();
    console.log(`Restaurant Count: ${count}`);
    const restaurants = await prisma.restaurant.findMany();
    console.log('Restaurants:', JSON.stringify(restaurants, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
