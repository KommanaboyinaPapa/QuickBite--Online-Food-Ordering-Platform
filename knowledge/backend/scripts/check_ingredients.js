const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const items = await prisma.menuItem.findMany({
            include: { ingredients: true }
        });

        console.log('Total Items:', items.length);
        const withIng = items.filter(i => i.ingredients.length > 0);
        console.log('Items with Ingredients:', withIng.length);

        if (withIng.length > 0) {
            console.log('Sample Ingredient Count:', withIng[0].ingredients.length);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
