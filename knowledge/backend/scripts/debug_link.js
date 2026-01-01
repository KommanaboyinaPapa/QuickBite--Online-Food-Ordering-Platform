const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const email = 'owner_1765223776043@test.com'; // The email I used
    console.log(`Checking for user: ${email}`);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        console.log('User NOT FOUND');
        return;
    }
    console.log('User Found:', user.id);

    const restaurant = await prisma.restaurant.findFirst({ where: { ownerId: user.id } });
    if (!restaurant) {
        console.log('Restaurant NOT FOUND for this ownerId');

        // Check if ANY restaurant exists
        const all = await prisma.restaurant.findMany();
        console.log(`Total restaurants: ${all.length}`);
        if (all.length > 0) {
            console.log('First restaurant ownerId:', all[0].ownerId);
            console.log('Comparison:', all[0].ownerId === user.id ? 'MATCH' : 'MISMATCH');
        }
    } else {
        console.log('Restaurant Found:', restaurant.id, restaurant.name);
    }
}

check().catch(e => console.error(e)).finally(() => prisma.$disconnect());
