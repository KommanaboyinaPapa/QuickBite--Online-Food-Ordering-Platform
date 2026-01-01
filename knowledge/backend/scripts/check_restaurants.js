
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    try {
        const restaurants = await prisma.restaurant.findMany({
            include: {
                menuItems: true,
                owner: true
            }
        });

        console.log(`Found ${restaurants.length} restaurants.`);

        restaurants.forEach(r => {
            console.log(`Restaurant: ${r.name} (ID: ${r.id}, Owner: ${r.owner.email})`);
            console.log(`- Menu Items: ${r.menuItems.length}`);
            r.menuItems.forEach(m => {
                console.log(`  - ${m.name} ($${m.price})`);
            });
        });

        if (restaurants.length === 0) {
            console.log("No restaurants found! You need to seed data or register a restaurant.");
        }

    } catch (error) {
        console.error('Error checking data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
