const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// 1. Define a reusable include config
const userWithPostsArgs = { include: { posts: true } };

// 2. Implement getUserWithPosts(email)
async function getUserWithPosts(email) {
  return await prisma.user.findUnique({
    where: { email },
    ...userWithPostsArgs
  });
}

async function main() {
  try {
    const email = 'shape@example.com';

    // 3. Create a test user with 2 posts
    // Cleanup first to ensure clean state
    await prisma.post.deleteMany({ where: { author: { email } } });
    await prisma.user.deleteMany({ where: { email } });

    await prisma.user.create({
      data: {
        email,
        name: 'Shape',
        posts: {
          create: [
            { title: 'Shape Post 1' },
            { title: 'Shape Post 2' }
          ]
        }
      }
    });

    // 4. Call getUserWithPosts
    const user = await getUserWithPosts(email);

    // 5. Validate the returned object shape
    const hasId = 'id' in user;
    const hasEmail = 'email' in user;
    const hasName = 'name' in user;
    const hasPosts = Array.isArray(user.posts);
    const postCount = user.posts ? user.posts.length : 0;
    const postsHaveTitle = user.posts ? user.posts.every(p => 'title' in p) : false;

    const shapeValid = hasId && hasEmail && hasName && hasPosts && postCount === 2 && postsHaveTitle;

    console.log('User:', JSON.stringify(user, null, 2));
    console.log('Validation:', { shapeValid, postCount });

    // 6. Write validation result
    const result = { shapeValid, postCount };
    fs.writeFileSync(
      path.join(__dirname, 'payload_result.json'),
      JSON.stringify(result, null, 2)
    );

  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
