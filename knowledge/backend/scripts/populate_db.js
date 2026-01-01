
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
    console.log('🚀 Starting Robust Data Seeding...');

    try {
        console.log('Cleaning up old data...');
        // Cascade delete order
        await prisma.oRderItemExclusion.deleteMany().catch(() => { });
        await prisma.cartItemExclusion.deleteMany().catch(() => { });
        await prisma.menuItemIngredient.deleteMany().catch(() => { });
        await prisma.ingredient.deleteMany().catch(() => { });

        await prisma.tracking.deleteMany().catch(() => { });
        await prisma.payment.deleteMany().catch(() => { });
        await prisma.review.deleteMany().catch(() => { });

        await prisma.orderItem.deleteMany().catch(() => { });
        await prisma.order.deleteMany().catch(() => { });
        await prisma.cartItem.deleteMany().catch(() => { });
        await prisma.cart.deleteMany().catch(() => { });

        await prisma.aIRecommendation.deleteMany().catch(() => { });
        await prisma.aIConversation.deleteMany().catch(() => { });

        await prisma.menuItem.deleteMany().catch(() => { });
        await prisma.restaurant.deleteMany().catch(() => { });

        // Clean up users who are owners/agents/customers created by this script
        await prisma.user.deleteMany({ where: { email: { contains: '@test.com' } } }).catch(() => { });

        console.log('Creating new data...');
        const password = await bcrypt.hash('password123', 10);

        // Create Restaurants with Unique Owners
        const restaurants = [
            {
                name: "Mama Mia's Pizzeria",
                description: "Authentic Naples style pizza with fresh ingredients",
                cuisineTypes: ["Italian", "Pizza"],
                address: "123 Olive Way",
                image: "https://images.unsplash.com/photo-1574071318500-d0d59d9a0d16?w=800&q=80",
                rating: 4.7
            },
            {
                name: "Dragon Wok",
                description: "Spicy Szechuan and Cantonese classics",
                cuisineTypes: ["Chinese", "Asian"],
                address: "88 Golden Ave",
                image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&q=80",
                rating: 4.5
            },
            {
                name: "Taco Fiesta",
                description: "Street style tacos and burritos",
                cuisineTypes: ["Mexican", "Fast Food"],
                address: "456 Salsa St",
                image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80",
                rating: 4.6
            },
            {
                name: "Curry House",
                description: "Rich and creamy North Indian curries",
                cuisineTypes: ["Indian"],
                address: "789 Spice Rd",
                image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80",
                rating: 4.8
            },
            {
                name: "Burger Kingpin",
                description: "Gourmet burgers and handcrafted shakes",
                cuisineTypes: ["Burgers", "Fast Food"],
                address: "321 Bun Blvd",
                image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
                rating: 4.3
            }
        ];

        for (let i = 0; i < restaurants.length; i++) {
            const r = restaurants[i];

            // Unique Owner for each restaurant
            const owner = await prisma.user.create({
                data: {
                    email: `owner${i + 1}_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`,
                    passwordHash: password,
                    firstName: `Owner ${r.name.split(' ')[0]}`,
                    lastName: 'Manager',
                    phone: `555000${1000 + i}`,
                    userType: 'restaurant'
                }
            });

            console.log(`Creating restaurant ${r.name} with owner ${owner.id}`);

            const createdRestaurant = await prisma.restaurant.create({
                data: {
                    name: r.name,
                    description: r.description,
                    address: r.address,
                    phone: "555-0199",
                    rating: r.rating,
                    ownerId: owner.id,
                    latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
                    longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
                    isOpen: true,
                    cuisineTypes: r.cuisineTypes, // MySQL json
                    deliveryFee: Math.floor(Math.random() * 5) + 1,
                    minimumOrder: 15,
                    logoUrl: r.image,
                    bannerUrl: r.image
                }
            });

            // Food images by cuisine type - high quality Unsplash images
            const foodImages = {
                Italian: [
                    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop', // Pizza
                    'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=400&h=300&fit=crop', // Pasta
                    'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=300&fit=crop', // Lasagna
                    'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=400&h=300&fit=crop', // Risotto
                    'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop'  // Bruschetta
                ],
                Chinese: [
                    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop', // Dim sum
                    'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&h=300&fit=crop', // Noodles
                    'https://images.unsplash.com/photo-1584278860047-22db9ff82bed?w=400&h=300&fit=crop', // Fried rice
                    'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&h=300&fit=crop', // Kung pao
                    'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=300&fit=crop'  // Dumplings
                ],
                Mexican: [
                    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop', // Tacos
                    'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop', // Burrito
                    'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400&h=300&fit=crop', // Quesadilla
                    'https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=400&h=300&fit=crop', // Nachos
                    'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop'  // Bowl
                ],
                Indian: [
                    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop', // Curry
                    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop', // Biryani
                    'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400&h=300&fit=crop', // Naan
                    'https://images.unsplash.com/photo-1567188040759-fb8a254b4bb6?w=400&h=300&fit=crop', // Tandoori
                    'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=300&fit=crop'  // Thali
                ],
                Burgers: [
                    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', // Classic burger
                    'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop', // Cheese burger
                    'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&h=300&fit=crop', // Loaded burger
                    'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop', // Double burger
                    'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=300&fit=crop'  // Fries
                ],
                default: [
                    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop', // Salad
                    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop', // Pancakes
                    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop', // Healthy bowl
                    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop', // Plated food
                    'https://images.unsplash.com/photo-1482049016gy-0877df9cc836?w=400&h=300&fit=crop'  // General food
                ]
            };

            // Menu item names by cuisine type
            const menuNames = {
                Italian: ['Margherita Pizza', 'Spaghetti Carbonara', 'Classic Lasagna', 'Mushroom Risotto', 'Garlic Bruschetta'],
                Chinese: ['Dim Sum Platter', 'Chow Mein Noodles', 'Special Fried Rice', 'Kung Pao Chicken', 'Pork Dumplings'],
                Mexican: ['Street Tacos', 'Grande Burrito', 'Cheese Quesadilla', 'Loaded Nachos', 'Burrito Bowl'],
                Indian: ['Butter Chicken', 'Lamb Biryani', 'Garlic Naan', 'Tandoori Platter', 'Vegetable Thali'],
                Burgers: ['Classic Burger', 'Cheese Burger Deluxe', 'BBQ Bacon Burger', 'Double Stack', 'Truffle Fries'],
                default: ['House Special', 'Chef Selection', 'Signature Dish', 'Daily Special', 'Premium Platter']
            };

            // Get cuisine-specific images and names
            const cuisineType = r.cuisineTypes[0];
            const images = foodImages[cuisineType] || foodImages.default;
            const names = menuNames[cuisineType] || menuNames.default;

            // Ingredients by cuisine type for realistic options
            const ingredientsByCuisine = {
                Italian: [
                    { name: 'Mozzarella Cheese', allergen: 'dairy' },
                    { name: 'Tomato Sauce', allergen: null },
                    { name: 'Basil', allergen: null },
                    { name: 'Olive Oil', allergen: null },
                    { name: 'Parmesan', allergen: 'dairy' },
                    { name: 'Garlic', allergen: null },
                    { name: 'Oregano', allergen: null }
                ],
                Chinese: [
                    { name: 'Soy Sauce', allergen: 'soy' },
                    { name: 'Ginger', allergen: null },
                    { name: 'Garlic', allergen: null },
                    { name: 'Sesame Oil', allergen: 'sesame' },
                    { name: 'Green Onion', allergen: null },
                    { name: 'Rice', allergen: null },
                    { name: 'Peanuts', allergen: 'nuts' }
                ],
                Mexican: [
                    { name: 'Cheddar Cheese', allergen: 'dairy' },
                    { name: 'Sour Cream', allergen: 'dairy' },
                    { name: 'Salsa', allergen: null },
                    { name: 'Guacamole', allergen: null },
                    { name: 'Jalapeños', allergen: null },
                    { name: 'Black Beans', allergen: null },
                    { name: 'Cilantro', allergen: null }
                ],
                Indian: [
                    { name: 'Ghee (Butter)', allergen: 'dairy' },
                    { name: 'Cream', allergen: 'dairy' },
                    { name: 'Garam Masala', allergen: null },
                    { name: 'Cumin', allergen: null },
                    { name: 'Coriander', allergen: null },
                    { name: 'Cashews', allergen: 'nuts' },
                    { name: 'Yogurt', allergen: 'dairy' }
                ],
                Burgers: [
                    { name: 'Cheese', allergen: 'dairy' },
                    { name: 'Lettuce', allergen: null },
                    { name: 'Tomato', allergen: null },
                    { name: 'Onion', allergen: null },
                    { name: 'Pickles', allergen: null },
                    { name: 'Mayo', allergen: 'eggs' },
                    { name: 'Bacon', allergen: null }
                ],
                default: [
                    { name: 'Salt', allergen: null },
                    { name: 'Pepper', allergen: null },
                    { name: 'Olive Oil', allergen: null },
                    { name: 'Garlic', allergen: null },
                    { name: 'Onion', allergen: null }
                ]
            };

            // Get cuisine-specific ingredients
            const cuisineIngredients = ingredientsByCuisine[cuisineType] || ingredientsByCuisine.default;

            // Create ingredients for this restaurant first
            const createdIngredients = [];
            for (const ing of cuisineIngredients) {
                const ingredient = await prisma.ingredient.create({
                    data: {
                        restaurantId: createdRestaurant.id,
                        name: ing.name,
                        allergenType: ing.allergen,
                        isAvailable: true
                    }
                });
                createdIngredients.push(ingredient);
            }

            // Add Menu Items with proper food images AND ingredients
            for (let j = 0; j < 5; j++) {
                const price = Math.floor(Math.random() * 20) + 10;
                const menuItem = await prisma.menuItem.create({
                    data: {
                        restaurantId: createdRestaurant.id,
                        name: names[j],
                        description: `Delicious ${cuisineType} dish prepared with fresh ingredients and authentic spices`,
                        price: price,
                        category: j < 3 ? 'Mains' : (j === 3 ? 'Appetizers' : 'Sides'),
                        imageUrl: images[j],
                        isAvailable: true,
                        isVegetarian: j % 3 === 0,
                        isVegan: j === 4 && cuisineType === 'Indian'
                    }
                });

                // Link 4-5 random ingredients to each menu item
                const numIngredients = 4 + Math.floor(Math.random() * 2);
                const shuffled = [...createdIngredients].sort(() => Math.random() - 0.5);
                const selectedIngredients = shuffled.slice(0, numIngredients);

                for (const ing of selectedIngredients) {
                    await prisma.menuItemIngredient.create({
                        data: {
                            menuItemId: menuItem.id,
                            ingredientId: ing.id,
                            quantity: '1 serving',
                            isRequired: Math.random() > 0.3 // 70% chance of being required
                        }
                    });
                }
            }
            console.log(`Created ${r.name} with 5 menu items and ingredients`);
        }

        // Ensure default customer and agent exist for demos
        await prisma.user.upsert({
            where: { email: 'customer_demo@test.com' },
            update: {},
            create: {
                email: 'customer_demo@test.com',
                passwordHash: password,
                firstName: 'John',
                lastName: 'Customer',
                phone: '5551112222',
                userType: 'customer'
            }
        });

        await prisma.user.upsert({
            where: { email: 'agent_demo@test.com' },
            update: {},
            create: {
                email: 'agent_demo@test.com',
                passwordHash: password,
                firstName: 'Speedy',
                lastName: 'Agent',
                phone: '5553334444',
                userType: 'delivery_agent'
            }
        });

        console.log('✅ Seeding Complete!');

    } catch (error) {
        console.error('❌ Seeding Failed:', JSON.stringify(error, null, 2));
    } finally {
        await prisma.$disconnect();
    }
}

main();
