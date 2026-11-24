import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { error } from "@/lib/http";

export async function POST(req: NextRequest) {
  const sender = await getCurrentUser();
  if (!sender) return error("Please sign in before sending a message.", 401);
  const form = await req.formData();
  const recipientId = String(form.get("recipientId") || "");
  const body = String(form.get("body") || "").trim();
  if (!recipientId || body.length < 1 || body.length > 5000) return error("Write a message of 1–5,000 characters.");
  if (recipientId === sender.id) return error("You cannot send a message to yourself.");
  const recipient = await prisma.user.findUnique({ where: { id: recipientId }, select: { id: true, fullName: true, accountRole: true, member: { select: { id: true } } } });
  if (!recipient) return error("Recipient account was not found.", 404);
  const senderIsManagement = ["ADMIN", "VCM", "VCF"].includes(sender.accountRole);
  const recipientIsManagement = ["ADMIN", "VCM", "VCF"].includes(recipient.accountRole);
  if (senderIsManagement ? !recipient.member && !recipientIsManagement : !recipientIsManagement) {
    return error("You are not permitted to message this account.", 403);
  }
  await prisma.$transaction(async (tx) => {
    const message = await tx.message.create({ data: { senderId: sender.id, recipientId, body } });
    await tx.notification.create({ data: { userId: recipientId, title: `New message from ${sender.fullName}`, body: body.length > 180 ? `${body.slice(0, 177)}...` : body, link: `/messages?with=${sender.id}` } });
    await tx.auditLog.create({ data: { actorId: sender.id, action: "MESSAGE_SENT", targetId: message.id, details: { recipientId } } });
  });
  return NextResponse.redirect(new URL(`/messages?with=${encodeURIComponent(recipientId)}&sent=1`, req.url), 303);
}
