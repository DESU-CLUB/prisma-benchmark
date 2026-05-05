const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  // Create root
  const root = await prisma.category.create({
    data: { name: 'Electronics' },
  });

  // Create child
  const child = await prisma.category.create({
    data: { 
      name: 'Phones', 
      parentId: root.id 
    },
  });

  // Create grandchild
  const grandchild = await prisma.category.create({
    data: { 
      name: 'Smartphones', 
      parentId: child.id 
    },
  });

  // Query root with nested includes
  const result = await prisma.category.findFirst({
    where: { name: 'Electronics' },
    include: { 
      children: { 
        include: { 
          children: true 
        } 
      } 
    }
  });

  console.log(JSON.stringify(result, null, 2));
  fs.writeFileSync('tree_result.json', JSON.stringify(result, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
