const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  // First run
  console.log('Running first upsert...');
  await prisma.user.upsert({
    where: { email: 'upsert@example.com' },
    create: { email: 'upsert@example.com', name: 'First Run' },
    update: { name: 'Second Run' },
  });

  // Second run
  console.log('Running second upsert...');
  await prisma.user.upsert({
    where: { email: 'upsert@example.com' },
    create: { email: 'upsert@example.com', name: 'First Run' },
    update: { name: 'Second Run' },
  });

  console.log('Fetching user...');
  const user = await prisma.user.findUnique({
    where: { email: 'upsert@example.com' },
  });

  fs.writeFileSync(
    path.join(__dirname, 'upsert_result.json'),
    JSON.stringify(user, null, 2)
  );

  console.log('Upsert result written to upsert_result.json');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
