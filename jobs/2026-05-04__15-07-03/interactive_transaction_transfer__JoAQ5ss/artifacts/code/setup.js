const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Setting up accounts...');
  
  await prisma.account.upsert({
    where: { owner: 'alice' },
    update: { balance: 100 },
    create: { owner: 'alice', balance: 100 },
  });

  await prisma.account.upsert({
    where: { owner: 'bob' },
    update: { balance: 50 },
    create: { owner: 'bob', balance: 50 },
  });

  console.log('Accounts setup complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
