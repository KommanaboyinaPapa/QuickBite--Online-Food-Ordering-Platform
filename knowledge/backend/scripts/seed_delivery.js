const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function seedDelivery() {
    try {
        const email = 'delivery_test_' + Date.now() + '@test.com';
        const password = await bcrypt.hash('password123', 10);

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash: password,
                firstName: 'Fast',
                lastName: 'Driver',
                phone: '999' + Math.floor(Math.random() * 10000000),
                userType: 'delivery',
                isActive: true
            }
        });

        console.log('✅ Delivery Agent Created!');
        console.log('Email:', email);
        console.log('Password: password123');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

seedDelivery();
