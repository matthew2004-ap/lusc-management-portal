import { NextRequest, NextResponse } from "next/server";
import { AccountRole } from "@prisma/client";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { error } from "@/lib/http";

export async function POST(req: NextRequest) {

  const admin = await requireRole(["ADMIN"]);

  if (!admin) {
    return error("Administrator access required.", 403);
  }

  const form = await req.formData();

  const userId = String(form.get("userId") || "");
  const role = String(form.get("accountRole") || "");

  const allowedRoles = [
    "APPLICANT",
    "VCM",
    "VCF",
    "ADMIN",
  ];

  if (!userId || !allowedRoles.includes(role)) {
    return error("Invalid account or permission.");
  }

  if (userId === admin.id && role !== "ADMIN") {
    return error(
      "You cannot remove your own administrator permission."
    );
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    include: { member: true },
  });

  if (!target) {
    return error("Account not found.", 404);
  }

  if (target.member) {
    return error(
      "This account belongs to an applicant or member. Manage its membership through the approval system."
    );
  }

  if (
    target.accountRole === "ADMIN" &&
    role !== "ADMIN"
  ) {
    const administratorCount = await prisma.user.count({
      where: { accountRole: "ADMIN" },
    });

    if (administratorCount <= 1) {
      return error(
        "You cannot remove the last administrator."
      );
    }
  }

  await prisma.$transaction(async (tx) => {

    await tx.user.update({
      where: { id: userId },
      data: {
        accountRole: role as AccountRole,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: admin.id,
        action: "ACCOUNT_PERMISSION_CHANGED",
        targetId: userId,
        details: {
          previousRole: target.accountRole,
          newRole: role,
        },
      },
    });

  });

  return NextResponse.redirect(
    new URL("/admin", req.url),
    303
  );
}