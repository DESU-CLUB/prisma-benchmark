const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        bio: 'Hello world',
      },
    });

    const foundUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    fs.writeFileSync('drift_result.json', JSON.stringify(foundUser, null, 2));
    console.log('Successfully wrote drift_result.json');
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
