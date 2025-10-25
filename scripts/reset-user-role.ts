import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Delete the existing user so they can start fresh
  const result = await prisma.user.deleteMany({
    where: {
      email: 'sandeepkumarswain65@gmail.com',
    },
  });

  console.log(`Deleted ${result.count} user(s) - user can now sign up fresh`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
