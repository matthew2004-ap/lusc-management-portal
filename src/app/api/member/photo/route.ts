import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { error, isValidImage } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return error("Please sign in.", 401);

  const form = await req.formData();
  const file = form.get("photo");
  if (!(file instanceof File) || !isValidImage(file)) {
    return error("Upload a JPG, PNG or WEBP image under 5MB.");
  }
  if (!user.member) return error("No member profile found.");

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `${randomUUID()}.${extension}`;
  let photoUrl: string;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(filename, file, {
        access: "public",
        contentType: file.type,
      });
      photoUrl = blob.url;
    } catch (cause) {
      console.error("Profile photo upload to Vercel Blob failed:", cause);
      return error("Photo storage is unavailable. Please try again later.", 502);
    }
  } else {
    if (process.env.NODE_ENV === "production") {
      return error("Photo storage is not configured. Please contact the administrator.", 503);
    }

    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
    photoUrl = `/uploads/${filename}`;
  }

  await prisma.member.update({
    where: { id: user.member.id },
    data: { profilePhoto: photoUrl },
  });

  return NextResponse.redirect(new URL("/profile?photo=uploaded", req.url), 303);
}
