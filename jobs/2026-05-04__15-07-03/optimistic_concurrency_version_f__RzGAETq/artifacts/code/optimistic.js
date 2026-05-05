const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  let conflictCaught = false;
  let finalVersion = 0;
  let finalContent = "";

  // 1. Read the current document
  const initialDoc = await prisma.document.findUnique({ where: { id: 1 } });
  console.log('Initial Document:', initialDoc);

  // 2. Simulate a concurrent update with an old version
  const oldVersion = initialDoc.version - 1;
  
  try {
    await prisma.$transaction(async (tx) => {
      const current = await tx.document.findUnique({ where: { id: 1 } });
      // Simulate checking against an "old" version that we supposedly thought was current
      if (current.version !== oldVersion) {
        throw new Error('Version mismatch');
      }
      await tx.document.update({
        where: { id: 1 },
        data: { content: 'Should not happen', version: { increment: 1 } }
      });
    });
  } catch (error) {
    if (error.message === 'Version mismatch') {
      conflictCaught = true;
      console.log('Caught expected version mismatch error');
    } else {
      console.error('Unexpected error during conflict simulation:', error);
    }
  }

  // 3. Perform a valid update with the correct version
  try {
    await prisma.$transaction(async (tx) => {
      const current = await tx.document.findUnique({ where: { id: 1 } });
      const expectedVersion = initialDoc.version;
      
      if (current.version !== expectedVersion) {
        throw new Error('Version mismatch');
      }
      
      await tx.document.update({
        where: { id: 1 },
        data: { content: 'Updated', version: { increment: 1 } }
      });
    });
    console.log('Valid update performed successfully');
  } catch (error) {
    console.error('Unexpected error during valid update:', error);
  }

  // 4. Get final state
  const finalDoc = await prisma.document.findUnique({ where: { id: 1 } });
  finalVersion = finalDoc.version;
  finalContent = finalDoc.content;

  const result = {
    conflictCaught,
    finalVersion,
    finalContent
  };

  fs.writeFileSync('optimistic_result.json', JSON.stringify(result, null, 2));
  console.log('Result written to optimistic_result.json:', result);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
