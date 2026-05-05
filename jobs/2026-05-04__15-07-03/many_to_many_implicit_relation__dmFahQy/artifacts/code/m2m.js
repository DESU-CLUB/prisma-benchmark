const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  // 1. Create a user
  const user = await prisma.user.create({
    data: {
      email: 'm2m@example.com',
      name: 'M2M User',
    },
  });

  // 2. Create two tags
  await prisma.tag.create({ data: { name: 'nodejs' } });
  await prisma.tag.create({ data: { name: 'prisma' } });

  // 3. Create a post connected to both tags
  const post = await prisma.post.create({
    data: {
      title: 'Prisma Node',
      authorId: user.id,
      tags: {
        connect: [{ name: 'nodejs' }, { name: 'prisma' }],
      },
    },
  });

  // 4. Query the post with tags
  const result = await prisma.post.findUnique({
    where: { id: post.id },
    include: { tags: true },
  });

  // 5. Write result to m2m_result.json
  fs.writeFileSync('m2m_result.json', JSON.stringify(result, null, 2));
  console.log('Result written to m2m_result.json');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
