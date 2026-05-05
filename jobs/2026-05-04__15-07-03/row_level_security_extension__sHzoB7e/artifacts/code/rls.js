const { PrismaClient } = require('@prisma/client');
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
  // Use a base client for cleanup
  const baseClient = new PrismaClient();
  await baseClient.note.deleteMany();
  await baseClient.$disconnect();

  const acmeClient = createTenantClient('acme');
  const globexClient = createTenantClient('globex');

  // Insert 2 notes for acme
  await acmeClient.note.create({ data: { content: 'Note 1 for Acme' } });
  await acmeClient.note.create({ data: { content: 'Note 2 for Acme' } });

  // Insert 1 note for globex
  await globexClient.note.create({ data: { content: 'Note 1 for Globex' } });

  // Query notes using each tenant client
  const acmeNotes = await acmeClient.note.findMany();
  const globexNotes = await globexClient.note.findMany();

  const result = {
    acmeCount: acmeNotes.length,
    globexCount: globexNotes.length
  };

  console.log(JSON.stringify(result, null, 2));

  fs.writeFileSync('/home/user/myproject/rls_result.json', JSON.stringify(result, null, 2));

  // Disconnect clients
  await acmeClient.$disconnect();
  await globexClient.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
