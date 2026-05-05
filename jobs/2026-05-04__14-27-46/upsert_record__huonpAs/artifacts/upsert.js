const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const email = 'upsert@example.com';

  console.log('Running first upsert...');
  await prisma.user.upsert({
    where: { email },
    create: { email, name: 'First Run' },
    update: { name: 'Second Run' },
  });

  console.log('Running second upsert...');
  await prisma.user.upsert({
    where: { email },
    create: { email, name: 'First Run' },
    update: { name: 'Second Run' },
  });

  const user = await prisma.user.findUnique({
    where: { email },
  });

  console.log('Final user state:', user);

  fs.writeFileSync(
    path.join(__dirname, 'upsert_result.json'),
    JSON.stringify(user, null, 2)
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
