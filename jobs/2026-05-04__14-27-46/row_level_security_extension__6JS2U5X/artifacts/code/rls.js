const { PrismaClient } = require('./generated/prisma');
const fs = require('fs');

function createTenantClient(tenantId) {
  return new PrismaClient().$extends({
    query: {
      note: {
        async findMany({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async create({ args, query }) {
          args.data = { ...args.data, tenantId };
          return query(args);
        }
      }
    }
  });
}

async function main() {
  const baseClient = new PrismaClient();
  // Clean up
  await baseClient.note.deleteMany({});
  await baseClient.$disconnect();

  const acmeClient = createTenantClient('acme');
  const globexClient = createTenantClient('globex');

  // Insert 2 notes for acme
  await acmeClient.note.create({ data: { content: 'Acme Note 1' } });
  await acmeClient.note.create({ data: { content: 'Acme Note 2' } });

  // Insert 1 note for globex
  await globexClient.note.create({ data: { content: 'Globex Note 1' } });

  // Query notes
  const acmeNotes = await acmeClient.note.findMany();
  const globexNotes = await globexClient.note.findMany();

  const result = {
    acmeCount: acmeNotes.length,
    globexCount: globexNotes.length
  };

  console.log('Result:', result);

  fs.writeFileSync('rls_result.json', JSON.stringify(result, null, 2));

  await acmeClient.$disconnect();
  await globexClient.$disconnect();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
