const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function checkout(productId, quantity) {
  return await prisma.$transaction(async (tx) => {
    // 1. Read the product and check stock
    const product = await tx.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.stock < quantity) {
      throw new Error('Insufficient stock');
    }

    // 2. Decrement stock
    await tx.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
    });

    // 3. Create order
    const order = await tx.order.create({
      data: { productId, quantity },
    });

    return order;
  });
}

async function main() {
  let insufficientStockCaught = false;

  try {
    // Call checkout(1, 3) - should succeed
    console.log('Attempting checkout(1, 3)...');
    await checkout(1, 3);
    console.log('Checkout(1, 3) succeeded.');
  } catch (error) {
    console.error('Checkout(1, 3) failed:', error.message);
  }

  try {
    // Call checkout(1, 100) - should fail
    console.log('Attempting checkout(1, 100)...');
    await checkout(1, 100);
    console.log('Checkout(1, 100) succeeded (unexpected).');
  } catch (error) {
    if (error.message === 'Insufficient stock') {
      insufficientStockCaught = true;
      console.log('Checkout(1, 100) failed as expected: Insufficient stock');
    } else {
      console.error('Checkout(1, 100) failed with unexpected error:', error.message);
    }
  }

  // After both calls, read final product stock and order count
  const finalProduct = await prisma.product.findUnique({
    where: { id: 1 },
  });
  const orderCount = await prisma.order.count();

  const result = {
    finalStock: finalProduct.stock,
    orderCount: orderCount,
    insufficientStockCaught: insufficientStockCaught,
  };

  console.log('Final Result:', result);

  fs.writeFileSync('checkout_result.json', JSON.stringify(result, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
