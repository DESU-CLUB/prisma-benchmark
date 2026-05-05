const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'query.log');

const prisma = new PrismaClient();

const xprisma = prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }) {
        const result = await query(args);
        fs.appendFileSync(logFile,
          JSON.stringify({ model, operation, args }) + '\n');
        return result;
      }
    }
  }
});

async function main() {
  try {
    // Run 3 queries
    await xprisma.user.findMany();
    await xprisma.user.count();
    await xprisma.user.findFirst();

    // After all queries, read query.log and write the number of logged lines to logging_result.json
    const logContent = fs.readFileSync(logFile, 'utf8');
    const lines = logContent.trim().split('\n').filter(line => line.length > 0);
    
    const result = { loggedQueries: lines.length };
    fs.writeFileSync(path.join(__dirname, 'logging_result.json'), JSON.stringify(result, null, 2));
    
    console.log(`Successfully logged ${lines.length} queries.`);
  } catch (error) {
    console.error('Error executing queries:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
