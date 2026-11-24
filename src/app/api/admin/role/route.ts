import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { error } from "@/lib/http";

export async function POST(req: NextRequest) {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) return error("Administrator access required.", 403);
  const form = await req.formData();
  const title = String(form.get("title") || "").trim();
  const code = String(form.get("code") || "").trim().toUpperCase();
  if (title.length < 2 || !/^[A-Z0-9]{2,8}$/.test(code)) {
    return error("Enter a role title and a 2–8 character code using letters or numbers.");
  }
  try {
    await prisma.councilRole.create({ data: { title, code } });
    await prisma.auditLog.create({ data: { actorId: admin.id, action: "COUNCIL_ROLE_CREATED", details: { title, code } } });
  } catch {
    return error("That role title or code already exists.", 409);
  }
  return NextResponse.redirect(new URL("/admin", req.url), 303);
}
