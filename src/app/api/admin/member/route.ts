import { NextRequest,NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { error } from "@/lib/http";
export async function POST(req:NextRequest){
 const admin=await requireRole(["ADMIN"]); if(!admin) return error("Administrator access required.",403);
 const form=await req.formData(); const memberId=String(form.get("memberId")||""); const rating=Number(form.get("rating"));
 const tenureCompleted=form.get("tenureCompleted")==="true";
 const appointmentIssued=form.get("appointmentIssued")==="true"; const idCardIssued=form.get("idCardIssued")==="true"; const certificateIssued=form.get("certificateIssued")==="true";
 if(!memberId||!Number.isInteger(rating)||rating<0||rating>5) return error("Rating must be between 0 and 5.");
 const member=await prisma.member.findUnique({where:{id:memberId}}); if(!member) return error("Member record not found.",404);
 if((appointmentIssued||idCardIssued||certificateIssued)&&member.status!=="APPROVED") return error("Only approved members can receive official documents.",400);
 if(certificateIssued&&!tenureCompleted) return error("Complete the tenure before issuing a certificate.",400);
 await prisma.member.update({where:{id:memberId},data:{rating,tenureCompleted,appointmentIssued,idCardIssued,certificateIssued}});
 await prisma.auditLog.create({data:{actorId:admin.id,action:"MEMBER_RECORD_AND_DOCUMENTS_UPDATED",targetId:memberId,details:{rating,tenureCompleted,appointmentIssued,idCardIssued,certificateIssued}}});
 return NextResponse.redirect(new URL("/admin",req.url),303);
}
