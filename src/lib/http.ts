import { NextResponse } from "next/server";
export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
export function isValidImage(file: File) {
  return ["image/jpeg", "image/png", "image/webp"].includes(file.type) && file.size <= 5 * 1024 * 1024;
}
