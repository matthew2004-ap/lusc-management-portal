import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { error } from "@/lib/http";
export async function GET(){
 const admin=await requireRole(["ADMIN"]); if(!admin) return error("Administrator access required.",403);
 const members=await prisma.member.findMany({include:{user:true,councilRole:true},orderBy:{createdAt:"asc"}});
 const rows=[["Name","Email","Status","Role","Official ID","Rating","Approved Office","Tenure Completed"],...members.map(m=>[m.user.fullName,m.user.email,m.status,m.councilRole.title,m.officialId||"",String(m.rating),m.approvedOffice||"",String(m.tenureCompleted)])];
 const csv=rows.map(row=>row.map(v=>`"${v.replaceAll('"','""')}"`).join(",")).join("\n");
 return new NextResponse(csv,{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":"attachment; filename=lusc-member-register.csv"}});
}
