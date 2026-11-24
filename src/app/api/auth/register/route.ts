import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { error } from "@/lib/http";
import { createSession } from "@/lib/auth";

const schema=z.object({fullName:z.string().trim().min(3).max(100),email:z.email(),password:z.string().min(8).max(100),roleTitle:z.string().trim().min(2).max(100)});
function makeCode(title:string){
 const words=title.toUpperCase().replace(/[^A-Z0-9 ]/g," ").trim().split(/\s+/).filter(Boolean);
 const code=(words.length>1?words.map(w=>w[0]).join(""):words[0]||"ROLE").slice(0,8);
 return code.padEnd(2,"X");
}
export async function POST(req:NextRequest){
 const form=await req.formData(); const parsed=schema.safeParse(Object.fromEntries(form));
 if(!parsed.success) return error("Please complete all fields correctly.");
 const {fullName,email,password,roleTitle}=parsed.data; const normalized=email.toLowerCase().trim();
 if(await prisma.user.findUnique({where:{email:normalized}})) return error("An account with this email already exists.",409);
 const title=roleTitle.replace(/^LUSC\s*\/\s*/i,"").trim();
 if(title.length<2) return error("Please enter a valid council position.");
 let role=await prisma.councilRole.findFirst({where:{title:{equals:title,mode:"insensitive"}}});
 if(!role){
  const base=makeCode(title); let code=base; let suffix=2;
  while(await prisma.councilRole.findUnique({where:{code}})){code=(base.slice(0,Math.max(2,8-String(suffix).length))+suffix).slice(0,8);suffix++;}
  role=await prisma.councilRole.create({data:{title,code}});
 }
 const passwordHash=await bcrypt.hash(password,12);
 try { await prisma.user.create({data:{fullName:fullName.trim(),email:normalized,passwordHash,accountRole:"APPLICANT",member:{create:{councilRoleId:role.id,status:"PENDING",applicationNote:`Applicant-entered position: ${title}`}}}}); }
 catch { return error("We could not create your account. Check whether this email is already registered and try again.",409); }
 const created = await prisma.user.findUnique({ where: { email: normalized }, select: { id: true } });
 if (!created) return error("Account created but sign-in could not be started. Please sign in.", 500);
 await createSession(created.id);
 return NextResponse.redirect(new URL("/dashboard?welcome=1",req.url),303);
}
