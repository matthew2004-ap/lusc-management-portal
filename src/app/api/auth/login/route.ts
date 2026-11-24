import { NextRequest,NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { error } from "@/lib/http";

export async function POST(req:NextRequest){
 const form=await req.formData(); const email=String(form.get("email")||"").toLowerCase().trim(); const password=String(form.get("password")||"");
 const user=await prisma.user.findUnique({where:{email}});
 if(!user||!(await bcrypt.compare(password,user.passwordHash))) return error("Invalid email or password.",401);
 await createSession(user.id);
 return NextResponse.redirect(new URL("/dashboard",req.url),303);
}
