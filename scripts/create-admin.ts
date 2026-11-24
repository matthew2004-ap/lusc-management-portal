import { PrismaClient, AccountRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const prisma = new PrismaClient();
const rl = readline.createInterface({ input, output });

async function main() {
  console.log("\nLUSC — Create the first real system administrator\n");
  const fullName = (await rl.question("Administrator full name: ")).trim();
  const email = (await rl.question("Official email address: ")).trim().toLowerCase();
  const password = await rl.question("Create a strong password (minimum 12 characters): ");
  if (fullName.length < 3 || !email.includes("@") || password.length < 12) {
    throw new Error("Enter a valid name, email and password of at least 12 characters.");
  }
  const existingAdmin = await prisma.user.findFirst({ where: { accountRole: AccountRole.ADMIN } });
  if (existingAdmin) throw new Error("An administrator already exists. Ask the current administrator to create or promote another office account.");
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("That email already has an account. Choose another email address.");
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { fullName, email, passwordHash, accountRole: AccountRole.ADMIN }
  });
  console.log("\nAdministrator account created. No sample members or demo records were added.");
}
main().catch(e => { console.error(e.message); process.exitCode = 1; })
  .finally(async () => { rl.close(); await prisma.$disconnect(); });
