if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

const { execSync } = require("node:child_process");
const { PrismaClient } = require("@prisma/client");

execSync("npx prisma db push", { stdio: "inherit", env: process.env });

const prisma = new PrismaClient();

async function bootstrap() {
  const count = await prisma.category.count().catch(() => 0);
  if (count === 0) {
    execSync("npx tsx prisma/seed.ts", { stdio: "inherit", env: process.env });
  }
  await prisma.$disconnect();
}

bootstrap()
  .then(() => {
    require("../server.js");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
