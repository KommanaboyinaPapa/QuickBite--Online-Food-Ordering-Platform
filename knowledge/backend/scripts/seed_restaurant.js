
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

// Generate unique emails/phones to avoid unique constraint errors
const generateEmail = (role) => `${role}_${Date.now()}@test.com`;
const generatePhone = () => `9${Math.floor(Math.random() * 1000000000)}`;

async function seed() {
    console.log('🌱 Seeding Restaurant Data...');
    try {
        // 1. Create Restaurant Owner
        const ownerPassword = await bcrypt.hash('password123', 10);
        const owner = await prisma.user.create({
            data: {
                email: generateEmail('owner'),
                passwordHash: ownerPassword,
                firstName: 'Luigi',
                lastName: 'Chef',
                phone: generatePhone(),
                userType: 'restaurant'
            }
        });

        // 2. Create Restaurant
        const restaurant = await prisma.restaurant.create({
            data: {
                name: "Luigi's Trattoria",
                description: "Authentic homemade pasta and pizza",
                address: "456 Mario Lane",
                phone: "555-0200",
                rating: 4.5,
                ratingCount: 120,
                latitude: 40.7200,
                longitude: -74.0100,
                ownerId: owner.id,
                isOpen: true,
                cuisineTypes: ["Italian", "Pasta", "Pizza"],
                deliveryFee: 3.99,
                minimumOrder: 15.00,
                estimatedDeliveryTime: 45
            }
        });

        // 3. Create Ingredients
        const flour = await prisma.ingredient.create({ data: { name: "Flour", restaurantId: restaurant.id } });
        const cheese = await prisma.ingredient.create({ data: { name: "Mozzarella", restaurantId: restaurant.id } });
        const tomato = await prisma.ingredient.create({ data: { name: "Tomato Sauce", restaurantId: restaurant.id } });
        const basil = await prisma.ingredient.create({ data: { name: "Fresh Basil", restaurantId: restaurant.id } });

        // 4. Create Menu Items
        await prisma.menuItem.create({
            data: {
                restaurantId: restaurant.id,
                name: "Margherita Pizza",
                description: "Classic tomato and mozzarella",
                price: 14.99,
                category: "Pizza",
                imageUrl: "https://placehold.co/400?text=Margherita",
                isVegetarian: true,
                ingredients: {
                    create: [
                        { ingredientId: flour.id },
                        { ingredientId: cheese.id },
                        { ingredientId: tomato.id },
                        { ingredientId: basil.id }
                    ]
                }
            }
        });

        await prisma.menuItem.create({
            data: {
                restaurantId: restaurant.id,
                name: "Penne Arrabbiata",
                description: "Spicy tomato sauce pasta",
                price: 12.99,
                category: "Pasta",
                imageUrl: "https://placehold.co/400?text=Penne",
                isVegetarian: true,
                isVegan: true,
                spiceLevel: "medium",
                ingredients: {
                    create: [
                        { ingredientId: flour.id },
                        { ingredientId: tomato.id },
                        { ingredientId: basil.id }
                    ]
                }
            }
        });

        console.log('✅ Seeding completed! Created restaurant:', restaurant.name);
        console.log('🔑 CREDENTIALS:');
        console.log('Email:', owner.email);
        console.log('Password: password123');

    } catch (e) {
        console.error('Error seeding data:', e);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
