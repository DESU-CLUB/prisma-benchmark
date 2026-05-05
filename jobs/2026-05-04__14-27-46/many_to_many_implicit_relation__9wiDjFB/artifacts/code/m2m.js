const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
  // Create tags
  await prisma.tag.upsert({
    where: { name: 'nodejs' },
    update: {},
    create: { name: 'nodejs' }
  });
  await prisma.tag.upsert({
    where: { name: 'prisma' },
    update: {},
    create: { name: 'prisma' }
  });

  // Create user
  const user = await prisma.user.upsert({
    where: { email: 'm2m@example.com' },
    update: {},
    create: {
      email: 'm2m@example.com',
      name: 'M2M User',
    },
  });

  // Create post connected to tags
  const post = await prisma.post.create({
    data: {
      title: 'Prisma Node',
      authorId: user.id,
      tags: {
        connect: [
          { name: 'nodejs' },
          { name: 'prisma' }
        ]
      }
    },
    include: {
      tags: true
    }
  });

  fs.writeFileSync('m2m_result.json', JSON.stringify(post, null, 2));
  console.log('Result written to m2m_result.json');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
