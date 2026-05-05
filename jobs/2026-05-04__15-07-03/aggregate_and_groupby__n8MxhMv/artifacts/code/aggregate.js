const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const totals = await prisma.order.aggregate({
    _count: true,
    _sum: {
      amount: true,
    },
    _avg: {
      amount: true,
    },
  });

  const byStatus = await prisma.order.groupBy({
    by: ['status'],
    _count: true,
    _sum: {
      amount: true,
    },
  });

  const result = {
    totals: {
      count: totals._count,
      sum: totals._sum.amount,
      avg: totals._avg.amount,
    },
    byStatus: byStatus.map((s) => ({
      status: s.status,
      count: s._count,
      sum: s._sum.amount,
    })),
  };

  fs.writeFileSync('aggregate_result.json', JSON.stringify(result, null, 2));
  console.log('Results written to aggregate_result.json');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
