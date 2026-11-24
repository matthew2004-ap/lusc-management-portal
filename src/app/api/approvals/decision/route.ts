import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { error } from "@/lib/http";

export async function POST(req: NextRequest) {

  const actor = await requireRole([
    "VCM",
    "VCF",
    "ADMIN",
  ]);

  if (!actor) {
    return error(
      "Only the VCM, VCF or administrator can approve applications.",
      403
    );
  }

  const form = await req.formData();

  const memberId = String(
    form.get("memberId") || ""
  );

  const decision = String(
    form.get("decision") || ""
  );

  const reason = String(
    form.get("reason") || ""
  ).trim();

  if (
    !memberId ||
    !["approve", "reject"].includes(decision)
  ) {
    return error("Invalid approval request.");
  }

  try {

    if (decision === "reject") {

      await prisma.$transaction(async (tx) => {

        const member = await tx.member.findUnique({
          where: { id: memberId },
        });

        if (!member) {
          throw new Error("Application not found.");
        }

        if (member.status !== "PENDING") {
          throw new Error(
            "This application has already received a decision."
          );
        }

        await tx.member.update({

          where: { id: memberId },

          data: {
            status: "REJECTED",
            rejectionReason:
              reason || "Application not approved.",
          },

        });

        await tx.auditLog.create({

          data: {
            actorId: actor.id,
            action: "MEMBER_REJECTED",
            targetId: memberId,

            details: {
              office: actor.accountRole,
              reason,
            },
          },

        });

      });

      return NextResponse.redirect(
        new URL(
          "/approvals?decision=rejected",
          req.url
        ),
        303
      );
    }

    const officialId = await prisma.$transaction(
      async (tx) => {

        const member = await tx.member.findUnique({

          where: { id: memberId },

          include: {
            councilRole: true,
          },

        });

        if (!member) {
          throw new Error("Application not found.");
        }

        if (member.status !== "PENDING") {
          throw new Error(
            "This application has already received a decision."
          );
        }

        const sequence = await tx.roleSequence.upsert({

          where: {
            roleCode: member.councilRole.code,
          },

          create: {
            roleCode: member.councilRole.code,
            value: 1,
          },

          update: {
            value: {
              increment: 1,
            },
          },

        });

        const year =
          process.env.TENURE_YEAR || "2026";

        const generatedId =
          `LUSC/${year}/${member.councilRole.code}/${String(
            sequence.value
          ).padStart(3, "0")}`;

        await tx.member.update({

          where: {
            id: member.id,
          },

          data: {

            status: "APPROVED",

            officialId: generatedId,

            approvedById: actor.id,

            approvedOffice: actor.accountRole,

            approvedAt: new Date(),

            rejectionReason: null,

          },

        });

        await tx.user.update({

          where: {
            id: member.userId,
          },

          data: {
            accountRole: "MEMBER",
          },

        });

        await tx.auditLog.create({

          data: {

            actorId: actor.id,

            action: "MEMBER_APPROVED",

            targetId: member.id,

            details: {
              officialId: generatedId,
              office: actor.accountRole,
            },

          },

        });

        return generatedId;

      },
      {
        isolationLevel: "Serializable",
      }
    );

    return NextResponse.redirect(

      new URL(
        `/approvals?approved=${encodeURIComponent(
          officialId
        )}`,
        req.url
      ),

      303

    );

  } catch (cause) {

    const message =
      cause instanceof Error
        ? cause.message
        : "Unable to process this decision.";

    return error(
      message,
      message.includes("already received")
        ? 409
        : 400
    );

  }
}