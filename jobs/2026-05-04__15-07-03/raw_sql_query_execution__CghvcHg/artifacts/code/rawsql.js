const { PrismaClient, Prisma } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Use prisma.$queryRaw with a tagged template literal to count users
    const countResult = await prisma.$queryRaw`SELECT COUNT(*) as cnt FROM User`;
    console.log('Count Result:', countResult);

    // 2. Use prisma.$executeRaw to update all users' names to uppercase
    const updateResult = await prisma.$executeRaw`UPDATE User SET name = UPPER(name)`;
    console.log('Update Result (rows affected):', updateResult);

    // 3. Query all users after the update with prisma.user.findMany()
    const users = await prisma.user.findMany();
    console.log('Users after update:', users);

    // 4. Write to /home/user/myproject/rawsql_result.json
    const result = {
      countResult,
      users
    };

    fs.writeFileSync('rawsql_result.json', JSON.stringify(result, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    , 2));
    console.log('Results written to rawsql_result.json');

  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
