const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.create({
      data: {
        email: 'nested@example.com',
        name: 'Nested Writer',
        posts: {
          create: [
            { title: 'Nested Post A' },
            { title: 'Nested Post B' }
          ]
        }
      },
      include: { posts: true }
    });

    fs.writeFileSync('nested_result.json', JSON.stringify(user, null, 2));
    console.log('Result written to nested_result.json');
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
