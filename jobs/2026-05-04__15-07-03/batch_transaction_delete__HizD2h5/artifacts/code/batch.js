const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Perform the transaction
    await prisma.$transaction([
      prisma.user.deleteMany({
        where: {
          email: {
            endsWith: '@old.com',
          },
        },
      }),
      prisma.user.create({
        data: {
          email: 'new@example.com',
          name: 'New User',
        },
      }),
    ]);

    // 2. Query results
    const remainingCount = await prisma.user.count();
    const newUser = await prisma.user.findUnique({
      where: {
        email: 'new@example.com',
      },
    });

    const result = {
      remaining: remainingCount,
      newUserExists: !!newUser,
    };

    // 3. Write results to file
    fs.writeFileSync(
      path.join(__dirname, 'batch_result.json'),
      JSON.stringify(result, null, 2)
    );

    console.log('Batch transaction completed successfully.');
    console.log('Result:', result);
  } catch (error) {
    console.error('Error during batch transaction:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
