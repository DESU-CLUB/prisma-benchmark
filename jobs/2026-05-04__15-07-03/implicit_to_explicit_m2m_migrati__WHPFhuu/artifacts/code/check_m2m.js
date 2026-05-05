const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$queryRawUnsafe('SELECT * FROM _PostToTag LIMIT 1');
    console.log('Sample row:', result);
    
    const posts = await prisma.post.findMany({ take: 1 });
    const tags = await prisma.tag.findMany({ take: 1 });
    console.log('Sample post:', posts);
    console.log('Sample tag:', tags);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
