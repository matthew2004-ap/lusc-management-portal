import { NextRequest, NextResponse } from "next/server";
import { AccountRole } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { error } from "@/lib/http";

export async function POST(req: NextRequest) {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) return error("Administrator access required.", 403);
  const form = await req.formData();
  const userId = String(form.get("userId") || "");
  const role = String(form.get("accountRole") || "");
  if (!Object.values(AccountRole).includes(role as AccountRole)) return error("Invalid account permission.");
  if (userId === admin.id && role !== "ADMIN") return error("You cannot remove your own administrator access.");
  const target = await prisma.user.findUnique({ where: { id: userId }, include: { member: true } });
  if (!target) return error("Account not found.", 404);
  await prisma.user.update({ where: { id: userId }, data: { accountRole: role as AccountRole } });
  await prisma.auditLog.create({ data: { actorId: admin.id, action: "ACCOUNT_PERMISSION_CHANGED", targetId: userId, details: { from: target.accountRole, to: role } } });
  return NextResponse.redirect(new URL("/admin", req.url), 303);
}
