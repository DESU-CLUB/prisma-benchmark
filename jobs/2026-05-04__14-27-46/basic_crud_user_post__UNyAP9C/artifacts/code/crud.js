const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    // a. Create a user
    const newUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    });
    console.log('Created user:', newUser);

    // b. Read it back
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });
    console.log('Read user:', user);

    // c. Update the name
    const updatedUser = await prisma.user.update({
      where: { email: 'test@example.com' },
      data: { name: 'Updated User' },
    });
    console.log('Updated user:', updatedUser);

    // d. Delete the user
    const deletedUser = await prisma.user.delete({
      where: { email: 'test@example.com' },
    });
    console.log('Deleted user:', deletedUser);

    // e. Confirm deletion
    const confirmedDeleted = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });
    console.log('Confirmed deleted (should be null):', confirmedDeleted);

    if (confirmedDeleted === null) {
      const result = { status: "ok", deleted: true };
      fs.writeFileSync(
        path.join(__dirname, 'crud_result.json'),
        JSON.stringify(result, null, 2)
      );
      console.log('Result written to crud_result.json');
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
