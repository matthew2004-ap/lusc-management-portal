import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { error } from "@/lib/http";

const schema = z.object({
  fullName: z.string().trim().min(3).max(100),

  email: z.email(),

  password: z.string().min(8).max(100),

  roleTitle: z.string().trim().min(2).max(100),
});

function makeCode(title: string) {

  const words = title
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const code = (
    words.length > 1
      ? words.map((word) => word[0]).join("")
      : words[0] || "ROLE"
  ).slice(0, 8);

  return code.padEnd(2, "X");
}

export async function POST(req: NextRequest) {

  const form = await req.formData();

  const parsed = schema.safeParse(
    Object.fromEntries(form)
  );

  if (!parsed.success) {
    return error("Please complete all fields correctly.");
  }

  const {
    fullName,
    email,
    password,
    roleTitle,
  } = parsed.data;

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return error(
      "An account with this email already exists.",
      409
    );
  }

  const title = roleTitle
    .replace(/^LUSC\s*\/\s*/i, "")
    .trim();

  if (title.length < 2) {
    return error("Enter a valid council position.");
  }

  let role = await prisma.councilRole.findFirst({
    where: {
      title: {
        equals: title,
        mode: "insensitive",
      },
    },
  });

  if (!role) {

    const base = makeCode(title);

    let code = base;
    let suffix = 2;

    while (
      await prisma.councilRole.findUnique({
        where: { code },
      })
    ) {
      code = (
        base.slice(
          0,
          Math.max(2, 8 - String(suffix).length)
        ) + suffix
      ).slice(0, 8);

      suffix++;
    }

    role = await prisma.councilRole.create({
      data: {
        title,
        code,
      },
    });
  }

  const passwordHash = await bcrypt.hash(
    password,
    12
  );

  try {

    const newUser = await prisma.user.create({

      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        passwordHash,
        accountRole: "APPLICANT",

        member: {
          create: {
            councilRoleId: role.id,
            status: "PENDING",

            applicationNote:
              `Applicant-entered position: ${title}`,
          },
        },
      },

    });

    await createSession(newUser.id);

    return NextResponse.redirect(
      new URL("/dashboard", req.url),
      303
    );

  } catch (err) {

    console.error("Registration error:", err);

    return error(
      "Registration failed. Please try again.",
      500
    );

  }
}