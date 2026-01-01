
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Testing Ingredient System...');

    // 1. Get Restaurant (Owner)
    const restaurant = await prisma.restaurant.findFirst();
    if (!restaurant) {
        console.log('No restaurant found. Run verify_roles_data.js first.');
        return;
    }
    console.log('Using Restaurant:', restaurant.name);

    // 2. Create Ingredients
    console.log('Creating Ingredients...');

    // Delete existing to clear slate
    await prisma.ingredient.deleteMany({
        where: {
            restaurantId: restaurant.id,
            name: { in: ['Toadstool', 'Fire Flower'] }
        }
    });

    const ing1 = await prisma.ingredient.create({
        data: {
            restaurantId: restaurant.id,
            name: 'Toadstool',
            allergenType: 'fungus',
            description: 'Magical mushrooms'
        }
    });

    const ing2 = await prisma.ingredient.create({
        data: {
            restaurantId: restaurant.id,
            name: 'Fire Flower',
            // spicePreference removed
            description: 'Hot stuff'
        }
    });

    // 3. Create/Update Menu Item with Ingredients
    console.log('Linking to Menu Item...');
    const menuItem = await prisma.menuItem.create({
        data: {
            restaurantId: restaurant.id,
            name: `Super Star Salad - ${Date.now()}`, // Unique name
            price: 15.00,
            category: 'Salads',
            description: 'Makes you invincible',
            ingredients: {
                create: [
                    { ingredientId: ing1.id, quantity: '3 slices' },
                    { ingredientId: ing2.id, quantity: '1 petal' }
                ]
            }
        },
        include: { ingredients: { include: { ingredient: true } } }
    });

    console.log('Menu Item Created with Ingredients:', JSON.stringify(menuItem, null, 2));

    // 4. Verify Fetch
    const fetchedItem = await prisma.menuItem.findUnique({
        where: { id: menuItem.id },
        include: { ingredients: { include: { ingredient: true } } }
    });

    if (fetchedItem.ingredients.length === 2) {
        console.log('SUCCESS: Ingredients linked correctly.');
    } else {
        console.error('FAILURE: Missing ingredients.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
