const { PrismaClient } = require('./generated/prisma');
const fs = require('fs');

async function main() {
  const prisma = new PrismaClient();

  // Create an extended client
  const xprisma = prisma.$extends({
    model: {
      user: {
        async softDelete(where) {
          return prisma.user.update({
            where,
            data: { deletedAt: new Date() },
          });
        },
      },
    },
    query: {
      user: {
        async findMany({ args, query }) {
          // Exclude records where deletedAt is not null
          args.where = { ...args.where, deletedAt: null };
          return query(args);
        },
      },
    },
  });

  // Create a user
  // Clean up if exists from previous runs
  try {
    await prisma.user.deleteMany({
      where: { email: 'soft@example.com' }
    });
  } catch (e) {}

  await xprisma.user.create({
    data: { email: 'soft@example.com', name: 'Soft' },
  });

  // Soft delete the user
  await xprisma.user.softDelete({ email: 'soft@example.com' });

  // Call findMany and assert it does NOT include the soft-deleted user
  const users = await xprisma.user.findMany();
  
  const visibleCount = users.length;
  const softDeletedUser = users.find(u => u.email === 'soft@example.com');
  const softDeletedExists = !!softDeletedUser;

  console.log(`Visible count: ${visibleCount}`);
  console.log(`Soft deleted user found in findMany: ${softDeletedExists}`);

  const result = {
    visibleCount,
    softDeletedExists
  };

  fs.writeFileSync('softdelete_result.json', JSON.stringify(result, null, 2));
  console.log('Results written to softdelete_result.json');
  
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
