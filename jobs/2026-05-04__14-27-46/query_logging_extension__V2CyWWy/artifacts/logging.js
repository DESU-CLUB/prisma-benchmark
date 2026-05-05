const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const xprisma = new PrismaClient().$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }) {
        const result = await query(args);
        fs.appendFileSync('/home/user/myproject/query.log',
          JSON.stringify({ model, operation, args }) + '\n');
        return result;
      }
    }
  }
});

async function main() {
  try {
    await xprisma.user.findMany();
    await xprisma.user.count();
    await xprisma.user.findFirst();
  } catch (e) {
    console.error("Query execution error:", e);
  } finally {
    await xprisma.$disconnect();
  }

  try {
    const logData = fs.readFileSync('/home/user/myproject/query.log', 'utf8');
    const loggedQueries = logData.trim().split('\n').filter(l => l.length > 0).length;
    fs.writeFileSync('/home/user/myproject/logging_result.json', JSON.stringify({ loggedQueries }));
  } catch (e) {
    console.error("Error writing result file:", e);
    fs.writeFileSync('/home/user/myproject/logging_result.json', JSON.stringify({ loggedQueries: 0 }));
  }
}

main();
