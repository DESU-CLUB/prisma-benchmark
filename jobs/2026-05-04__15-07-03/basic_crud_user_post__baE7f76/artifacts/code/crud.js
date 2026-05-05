const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    // a. Create a user
    console.log('Creating user...');
    const newUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    });
    console.log('User created:', newUser);

    // b. Read it back
    console.log('Reading user...');
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });
    console.log('User read:', user);

    // c. Update the name
    console.log('Updating user...');
    const updatedUser = await prisma.user.update({
      where: { email: 'test@example.com' },
      data: { name: 'Updated User' },
    });
    console.log('User updated:', updatedUser);

    // d. Delete the user
    console.log('Deleting user...');
    await prisma.user.delete({
      where: { email: 'test@example.com' },
    });
    console.log('User deleted.');

    // e. Confirm deletion
    console.log('Confirming deletion...');
    const deletedUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (deletedUser === null) {
      console.log('Deletion confirmed.');
      const result = { status: 'ok', deleted: true };
      fs.writeFileSync(
        path.join(__dirname, 'crud_result.json'),
        JSON.stringify(result, null, 2)
      );
    } else {
      throw new Error('User was not deleted');
    }
  } catch (error) {
    console.error('Error during CRUD operations:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
