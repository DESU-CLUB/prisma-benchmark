const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function main() {
  const prisma = new PrismaClient();
  const xprisma = prisma.$extends({
    result: {
      user: {
        fullLabel: {
          needs: { name: true, email: true },
          compute(user) {
            return `${user.name} <${user.email}>`;
          }
        }
      }
    }
  });

  try {
    // Ensure the user exists
    await xprisma.user.upsert({
      where: { email: 'computed@example.com' },
      update: { name: 'Computed' },
      create: { email: 'computed@example.com', name: 'Computed' },
    });

    // Query it with the extended client
    const result = await xprisma.user.findUnique({
      where: { email: 'computed@example.com' }
    });

    console.log('Query Result:', result);

    // Write the result to computed_result.json
    fs.writeFileSync('/home/user/myproject/computed_result.json', JSON.stringify(result, null, 2));
    console.log('Result written to computed_result.json');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
