import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PortalShell from "@/components/PortalShell";

export default async function AdminPage({searchParams}:{searchParams:Promise<{q?:string}>}){
 const user=await getCurrentUser(); if(!user) redirect("/login"); if(user.accountRole!=="ADMIN") redirect("/dashboard");
 const {q=""}=await searchParams; const term=q.trim();
 const members=await prisma.member.findMany({where:term?{OR:[{officialId:{contains:term,mode:"insensitive"}},{user:{fullName:{contains:term,mode:"insensitive"}}},{user:{email:{contains:term,mode:"insensitive"}}},{councilRole:{title:{contains:term,mode:"insensitive"}}}]}:undefined,include:{user:true,councilRole:true},orderBy:{createdAt:"desc"},take:250});
 const roles=await prisma.councilRole.findMany({orderBy:{title:"asc"}});
 const accounts=await prisma.user.findMany({orderBy:{createdAt:"desc"},take:150});
 return <PortalShell><h1 className="page-title">System administration</h1><p className="subtle">Manage the central register, ratings and tenure completion.</p>
 <div className="card admin-register" style={{marginTop:22}}><div className="row" style={{justifyContent:"space-between"}}><div><h3>Member register</h3><p className="subtle">Search by name, email, role or official membership ID.</p></div><a className="btn light" href="/api/admin/export">Export CSV</a></div><form method="get" className="row search-form"><input name="q" defaultValue={term} placeholder="Search e.g. LUSC/26/PRO/001 or PRO"/><button className="btn">Search</button>{term&&<a className="btn light" href="/admin">Clear</a>}</form><p className="tiny-note">Showing up to 250 matching records.</p>
 <div className="table-wrap"><table><thead><tr><th>Name</th><th>Role</th><th>Status</th><th>Official ID</th><th>Rating</th><th>Tenure</th><th>Update</th></tr></thead><tbody>
 {members.map(m=><tr key={m.id}><td>{m.user.fullName}<div className="subtle">{m.user.email}</div></td><td>{m.councilRole.title}</td><td><span className={`badge ${m.status}`}>{m.status}</span></td><td>{m.officialId||"—"}</td><td>{m.rating}/5</td><td>{m.tenureCompleted?"Completed":"Active"}</td><td><form action="/api/admin/member" method="post" className="row"><input type="hidden" name="memberId" value={m.id}/><select name="rating" defaultValue={m.rating} style={{width:65,padding:7,border:"1px solid #d8e0ea",borderRadius:7}}>{[0,1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}</select><label style={{fontSize:11}}><input type="checkbox" name="tenureCompleted" value="true" defaultChecked={m.tenureCompleted}/> Tenure complete</label><label style={{fontSize:11}}><input type="checkbox" name="appointmentIssued" value="true" defaultChecked={m.appointmentIssued}/> Letter</label><label style={{fontSize:11}}><input type="checkbox" name="idCardIssued" value="true" defaultChecked={m.idCardIssued}/> ID card</label><label style={{fontSize:11}}><input type="checkbox" name="certificateIssued" value="true" defaultChecked={m.certificateIssued}/> Certificate</label><button className="btn" style={{padding:"7px 9px"}}>Save</button></form></td></tr>)}
 </tbody></table>{members.length===0&&<p className="empty-state">No matching members found.</p>}</div></div>
 <div className="card" style={{marginTop:18}}><h3>Role dictionary</h3><p className="subtle">Current approved role codes used by the ID generator.</p>{roles.map(r=><span key={r.id} style={{display:"inline-block",background:"#edf2f8",padding:"7px 10px",borderRadius:7,margin:"4px",fontSize:12}}>{r.title} · <b>{r.code}</b></span>)}</div>
 <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))"}}>
  <div className="card"><h3>Add official council role</h3><p className="subtle">Use role titles and codes approved by LUSC. These codes appear in official member IDs.</p>
   <form action="/api/admin/role" method="post"><div className="field"><label>Role title</label><input name="title" placeholder="Public Relations Officer" required/></div><div className="field"><label>Role code</label><input name="code" placeholder="PRO" required maxLength={8}/></div><button className="btn">Add role</button></form>
  </div>
  <div className="card"><h3>Authorized office accounts</h3><p className="subtle">Create the office-holder account first, then assign its permission here. The first administrator is created securely from the terminal.</p>
   {accounts.map(a=><form key={a.id} action="/api/admin/account-role" method="post" className="row" style={{justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #edf1f5"}}>
    <input type="hidden" name="userId" value={a.id}/><span style={{fontSize:12}}><b>{a.fullName}</b><br/><span className="subtle">{a.email}</span></span>
    <select name="accountRole" defaultValue={a.accountRole} style={{padding:7,border:"1px solid #d8e0ea",borderRadius:7}}>{["APPLICANT","MEMBER","VCM","VCF","ADMIN"].map(r=><option key={r}>{r}</option>)}</select><button className="btn" style={{padding:"7px 9px"}}>Save</button>
   </form>)}
  </div>
 </div>
 </PortalShell>;
}
