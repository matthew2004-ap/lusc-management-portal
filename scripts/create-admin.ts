import { PrismaClient, AccountRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input,
  output,
});

async function main() {
  console.log("\n=================================");
  console.log(" LUSC ADMINISTRATOR REGISTRATION ");
  console.log("=================================\n");

  const existingAdmin = await prisma.user.findFirst({
    where: {
      accountRole: AccountRole.ADMIN,
    },
  });

  if (existingAdmin) {
    throw new Error(
      "An administrator already exists. Contact the system administrator for account management."
    );
  }

  const fullName = (
    await rl.question("Administrator full name: ")
  ).trim();

  const email = (
    await rl.question("Official email address: ")
  ).trim().toLowerCase();

  const password = await rl.question(
    "Create password (minimum 12 characters): "
  );

  if (
    fullName.length < 3 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    password.length < 12
  ) {
    throw new Error(
      "Enter a valid name, email and password of at least 12 characters."
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error(
      "This email already belongs to an account."
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      accountRole: AccountRole.ADMIN,
    },
  });

  console.log("\nAdministrator successfully created.");
  console.log("You can now sign in through the portal.");
}

main()
  .catch((error) => {
    console.error("\nERROR:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    rl.close();
    await prisma.$disconnect();
  });