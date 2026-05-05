const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function main() {
  const prisma = new PrismaClient();

  const xprisma = prisma.$extends({
    query: {
      user: {
        async findMany({ args, query }) {
          args.where = { ...args.where, deletedAt: null };
          return query(args);
        },
      },
    },
    model: {
      user: {
        async softDelete(where) {
          const context = Prisma.getExtensionContext(this);
          return context.update({
            where,
            data: { deletedAt: new Date() },
          });
        },
      },
    },
  });

  // Clean up if exists
  try {
    await prisma.user.delete({ where: { email: 'soft@example.com' } });
  } catch (e) {
    // Ignore if not exists
  }

  // Create user
  await xprisma.user.create({
    data: { email: 'soft@example.com', name: 'Soft' },
  });

  // Soft delete user
  await xprisma.user.softDelete({ email: 'soft@example.com' });

  // Find users
  const users = await xprisma.user.findMany();
  
  // Check if soft-deleted user exists in DB (using base prisma client)
  const dbUser = await prisma.user.findUnique({
    where: { email: 'soft@example.com' },
  });

  const result = {
    visibleCount: users.length,
    softDeletedExists: !!dbUser && dbUser.deletedAt !== null,
  };

  fs.writeFileSync('softdelete_result.json', JSON.stringify(result, null, 2));
  console.log('Result:', result);

  await prisma.$disconnect();
}

// Handle Prisma global if needed for getExtensionContext
const { Prisma } = require('@prisma/client');

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
