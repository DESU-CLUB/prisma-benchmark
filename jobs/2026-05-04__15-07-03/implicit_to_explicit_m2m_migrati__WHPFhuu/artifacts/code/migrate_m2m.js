const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Read all entries from _PostToTag
    const relations = await prisma.$queryRawUnsafe('SELECT * FROM _PostToTag');
    console.log(`Found ${relations.length} relations in _PostToTag`);

    // 2. Create corresponding PostTag records
    let migratedCount = 0;
    for (const rel of relations) {
      await prisma.postTag.create({
        data: {
          postId: rel.A,
          tagId: rel.B,
          addedAt: new Date()
        }
      });
      migratedCount++;
    }

    // 3. Query PostTag count
    const count = await prisma.postTag.count();
    console.log(`Successfully migrated ${count} records to PostTag`);

    // 4. Write to result file
    const result = { migratedCount: count };
    fs.writeFileSync(
      path.join(__dirname, 'm2m_migrate_result.json'),
      JSON.stringify(result, null, 2)
    );

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
