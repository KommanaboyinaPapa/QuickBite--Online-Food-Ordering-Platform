
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        where: { userType: 'customer' },
        take: 1,
        orderBy: { createdAt: 'desc' }
    });
    if (users.length > 0) {
        console.log(`LOGIN_EMAIL: ${users[0].email}`);
    } else {
        console.log('NO_USERS_FOUND');
    }
}
main().finally(() => prisma.$disconnect());
