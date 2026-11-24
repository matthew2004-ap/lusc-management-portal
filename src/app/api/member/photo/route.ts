import { NextRequest,NextResponse } from "next/server";
import { mkdir,writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { isValidImage,error } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const runtime="nodejs";
export async function POST(req:NextRequest){
 const user=await getCurrentUser(); if(!user) return error("Please sign in.",401);
 const form=await req.formData(); const file=form.get("photo");
 if(!(file instanceof File)||!isValidImage(file)) return error("Upload a JPG, PNG or WEBP image under 5MB.");
 if(!user.member) return error("No member profile found.");
 const ext=file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg";
 const dir=path.join(process.cwd(),"public","uploads"); await mkdir(dir,{recursive:true});
 const filename=`${randomUUID()}.${ext}`; await writeFile(path.join(dir,filename),Buffer.from(await file.arrayBuffer()));
 await prisma.member.update({where:{id:user.member.id},data:{profilePhoto:`/uploads/${filename}`}});
 return NextResponse.redirect(new URL("/profile?photo=uploaded",req.url),303);
}
