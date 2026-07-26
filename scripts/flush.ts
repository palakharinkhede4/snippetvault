import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database flush...");

  const deletedSnippets = await prisma.snippet.deleteMany({});
  console.log(`Deleted ${deletedSnippets.count} snippets.`);

  const deletedUsers = await prisma.user.deleteMany({});
  console.log(`Deleted ${deletedUsers.count} users.`);

  console.log("Database flush completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during database flush:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
