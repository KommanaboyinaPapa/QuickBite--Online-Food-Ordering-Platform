const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function linkIngredientsToCurd() {
    // Find the Curd item
    const item = await p.menuItem.findFirst({ where: { name: 'Curd' } });
    if (!item) {
        console.log('Curd item not found');
        return;
    }
    console.log('Found Curd item:', item.id);

    // Get all ingredients for this restaurant
    const ings = await p.ingredient.findMany({
        where: { restaurantId: item.restaurantId }
    });
    console.log('Ingredients for this restaurant:', ings.map(i => i.name));

    // Link each ingredient to the Curd item
    for (const ing of ings) {
        try {
            await p.menuItemIngredient.create({
                data: {
                    menuItemId: item.id,
                    ingredientId: ing.id,
                    quantity: '1 serving'
                }
            });
            console.log('Linked:', ing.name);
        } catch (e) {
            console.log('Already linked or error:', ing.name);
        }
    }

    console.log('Done! Curd now has ingredients.');
    await p.$disconnect();
}

linkIngredientsToCurd();
