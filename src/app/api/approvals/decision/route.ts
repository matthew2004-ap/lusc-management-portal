import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { error } from "@/lib/http";

/**
 * VCM and VCF are independent approval authorities: either office may make
 * the final decision on a pending application without waiting for the other.
 * ADMIN retains an administrative override.
 */
export async function POST(req: NextRequest) {
  const actor = await requireRole(["VCM", "VCF", "ADMIN"]);
  if (!actor) return error("Only the VCM, VCF, or system administrator can decide applications.", 403);

  const form = await req.formData();
  const memberId = String(form.get("memberId") || "");
  const decision = String(form.get("decision") || "");
  const reason = String(form.get("reason") || "Application not approved.").trim();
  if (!memberId || !["approve", "reject"].includes(decision)) {
    return error("Invalid approval request.");
  }

  try {
    if (decision === "reject") {
      await prisma.$transaction(async (tx) => {
        const member = await tx.member.findUnique({ where: { id: memberId } });
        if (!member) throw new Error("Application not found.");
        if (member.status !== "PENDING") throw new Error("This application has already received a decision.");
        await tx.member.update({
          where: { id: memberId },
          data: { status: "REJECTED", rejectionReason: reason || "Application not approved." },
        });
        await tx.notification.create({ data: { userId: member.userId, title: "Your LUSC application was not approved", body: reason, link: "/dashboard" } });
        await tx.auditLog.create({
          data: {
            actorId: actor.id,
            action: "MEMBER_REJECTED",
            targetId: memberId,
            details: { office: actor.accountRole, reason },
          },
        });
      }, { isolationLevel: "Serializable" });
      return NextResponse.redirect(new URL("/approvals?decision=rejected", req.url), 303);
    }

    const officialId = await prisma.$transaction(async (tx) => {
      const member = await tx.member.findUnique({
        where: { id: memberId },
        include: { councilRole: true },
      });
      if (!member) throw new Error("Application not found.");
      if (member.status !== "PENDING") throw new Error("This application has already received a decision.");

      // Incrementing the sequence and approving the applicant happen atomically.
      const sequence = await tx.roleSequence.upsert({
        where: { roleCode: member.councilRole.code },
        create: { roleCode: member.councilRole.code, value: 1 },
        update: { value: { increment: 1 } },
      });
      const year = process.env.TENURE_YEAR || "26";
      const generatedId = `LUSC/${year}/${member.councilRole.code}/${String(sequence.value).padStart(3, "0")}`;

      await tx.member.update({
        where: { id: member.id },
        data: {
          status: "APPROVED",
          officialId: generatedId,
          approvedById: actor.id,
          approvedOffice: actor.accountRole,
          approvedAt: new Date(),
          rejectionReason: null,
        },
      });
      await tx.user.update({ where: { id: member.userId }, data: { accountRole: "MEMBER" } });
      await tx.notification.create({ data: { userId: member.userId, title: "Your LUSC application has been approved", body: `Your membership has been approved. Your official membership ID is ${generatedId}.`, link: "/dashboard" } });
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: "MEMBER_APPROVED",
          targetId: member.id,
          details: { officialId: generatedId, office: actor.accountRole },
        },
      });
      return generatedId;
    }, { isolationLevel: "Serializable" });

    return NextResponse.redirect(
      new URL(`/approvals?approved=${encodeURIComponent(officialId)}`, req.url),
      303,
    );
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Unable to process this decision.";
    return error(message, message.includes("already received") ? 409 : 400);
  }
}
