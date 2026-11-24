import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PortalShell from "@/components/PortalShell";

export default async function ApprovalsPage(){
 const user=await getCurrentUser(); if(!user) redirect("/login");
 if(!["VCM","VCF","ADMIN"].includes(user.accountRole)) redirect("/dashboard");
 const pending=await prisma.member.findMany({where:{status:"PENDING"},include:{user:true,councilRole:true},orderBy:{createdAt:"asc"}});
 return <PortalShell><h1 className="page-title">Approval queue</h1><p className="subtle">Either the VCM or VCF may independently approve or reject an applicant. A second approval is not required.</p>
 <div className="card" style={{marginTop:22}}><div className="table-wrap"><table><thead><tr><th>Applicant</th><th>Email</th><th>Requested role</th><th>Submitted</th><th>Decision</th></tr></thead><tbody>
 {pending.map(m=><tr key={m.id}><td><b>{m.user.fullName}</b></td><td>{m.user.email}</td><td>{m.councilRole.title}</td><td>{m.createdAt.toLocaleDateString()}</td><td><div className="row"><form action="/api/approvals/decision" method="post"><input type="hidden" name="memberId" value={m.id}/><input type="hidden" name="decision" value="approve"/><button className="btn" style={{padding:"8px 11px"}}>Approve</button></form><form action="/api/approvals/decision" method="post"><input type="hidden" name="memberId" value={m.id}/><input type="hidden" name="decision" value="reject"/><input type="hidden" name="reason" value="Please contact the council office for clarification."/><button className="btn danger" style={{padding:"8px 11px"}}>Reject</button></form></div></td></tr>)}
 {pending.length===0&&<tr><td colSpan={5} style={{textAlign:"center",padding:35}}>No pending applications.</td></tr>}
 </tbody></table></div></div></PortalShell>;
}
