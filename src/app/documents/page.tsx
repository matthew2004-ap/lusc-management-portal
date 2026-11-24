import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import PortalShell from "@/components/PortalShell";

export default async function DocumentsPage(){
 const user=await getCurrentUser(); if(!user) redirect("/login");
 const m=user.member; const approved=m?.status==="APPROVED";
 return <PortalShell><h1 className="page-title">My documents</h1><p className="subtle">Official documents available for your membership record.</p>
 <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))"}}>
  <div className="card"><h3>Appointment letter</h3><p className="subtle">Official appointment confirmation issued after approval.</p>{approved&&m?.appointmentIssued?<a className="btn" href="/documents/appointment">View / Print</a>:<span className="badge PENDING">Awaiting admin issuance</span>}</div>
  <div className="card"><h3>Official ID card</h3><p className="subtle">Council identification card with your photo and unique ID.</p>{approved&&m?.idCardIssued?<a className="btn" href="/documents/id-card">View / Print</a>:<span className="badge PENDING">Awaiting admin issuance</span>}</div>
  <div className="card"><h3>End-of-tenure certificate</h3><p className="subtle">Certificate of service and role performance rating.</p>{approved&&m?.tenureCompleted&&m?.certificateIssued?<a className="btn" href="/documents/certificate">View / Print</a>:<span className="badge PENDING">Awaiting tenure completion and admin issuance</span>}</div>
 </div></PortalShell>;
}
