import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import PortalShell from "@/components/PortalShell";

export default async function ProfilePage(){
 const user=await getCurrentUser(); if(!user) redirect("/login");
 const m=user.member;
 return <PortalShell><h1 className="page-title">My profile</h1><p className="subtle">Your registered council information and verification status.</p>
 <div className="card" style={{maxWidth:850,marginTop:22}}>
  <div className="row" style={{alignItems:"flex-start"}}>
   <div style={{width:110,height:110,borderRadius:16,background:"#edf2f8",overflow:"hidden",display:"grid",placeItems:"center"}}>{m?.profilePhoto?<img src={m.profilePhoto} alt="Profile" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:40,color:"#9aabc0"}}>👤</span>}</div>
   <div><h2 style={{margin:"0 0 5px"}}>{user.fullName}</h2><div className="subtle">{user.email}</div><div style={{marginTop:10}}><span className={`badge ${m?.status||"PENDING"}`}>{m?.status||"NO PROFILE"}</span></div></div>
  </div>
  <hr style={{border:0,borderTop:"1px solid #edf1f5",margin:"24px 0"}}/>
  <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))"}}>
   <div><div className="subtle">Council role</div><b>{m?.councilRole.title||"—"}</b></div>
   <div><div className="subtle">Official ID</div><b>{m?.officialId||"Pending approval"}</b></div>
   <div><div className="subtle">Approved by</div><b>{m?.approvedOffice||"—"}</b></div>
   <div><div className="subtle">Rating</div><b style={{color:"#bd963d"}}>{m?.rating? "★".repeat(m.rating)+"☆".repeat(5-m.rating):"Not rated"}</b></div>
  </div>
  {m?.rejectionReason&&<div className="card" style={{background:"#fff5f5",marginTop:15}}><b>Application feedback</b><p>{m.rejectionReason}</p></div>}
  <form action="/api/member/photo" method="post" encType="multipart/form-data" style={{marginTop:22}}>
   <div className="field"><label>Upload corporate profile photo (JPG, PNG or WEBP; maximum 5MB)</label><input type="file" name="photo" accept="image/jpeg,image/png,image/webp" required/></div>
   <button className="btn">Upload photo</button>
  </form>
 </div></PortalShell>;
}
