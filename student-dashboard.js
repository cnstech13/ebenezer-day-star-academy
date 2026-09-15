import { collection, getDocs, query, where, limit } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { requireRole, logoutToLogin } from "./role-guard.js";
import { db } from "./firebase-config.js";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); const box=(id,h)=>document.getElementById(id).innerHTML=h;
const a=await requireRole("student");const p=a.profile;const sid=p.studentUid;
document.getElementById("welcome").textContent=`Welcome, ${p.name||p.fullName||"Student"}`;document.getElementById("details").textContent=p.email||a.user.email||"";document.getElementById("logout").onclick=logoutToLogin;
if(!sid){["results","attendance","fees","reports"].forEach(x=>box(x,"<p class=muted>No student record is linked to this account.</p>"));}
else try{
 const loads=async(c,field)=>{const q=await getDocs(query(collection(db,c),where("studentId","==",sid),limit(20)));return [...q.docs].map(x=>x.data());};
 const r=await loads("results");box("results",r.length?r.map(x=>`<div class=item>${esc(x.subject||"Subject")} — <b>${esc(x.total??x.score??"")}</b><div class=muted>${esc(x.term||"")} ${esc(x.session||"")}</div></div>`).join(""):"<p class=muted>No results published.</p>");
 const at=await loads("attendance");box("attendance",at.length?at.slice(0,8).map(x=>`<div class=item>${esc(x.date||"")} — <b>${esc(x.status||"")}</b></div>`).join(""):"<p class=muted>No attendance records.</p>");
 const f=await loads("fees");box("fees",f.length?f.slice(0,8).map(x=>`<div class=item>${esc(x.description||x.title||"School fees")} — <b>₦${Number(x.amount||0).toLocaleString()}</b><div class=muted>${esc(x.status||"Pending")}</div></div>`).join(""):"<p class=muted>No fee records.</p>");
 const rc=await loads("reportCards");box("reports",rc.length?rc.map(x=>`<div class=item><b>${esc(x.term||"Report Card")}</b><div>${esc(x.teacherComment||"")}</div></div>`).join(""):"<p class=muted>No report cards published.</p>");
 const n=await getDocs(query(collection(db,"notifications"),where("audience","array-contains","student"),limit(10)));box("notices",n.size?[...n.docs].map(x=>`<div class=item><b>${esc(x.data().title)}</b><div>${esc(x.data().message)}</div></div>`).join(""):"<p class=muted>No notifications.</p>");
}catch(e){console.error(e);["results","attendance","fees","reports","notices"].forEach(x=>box(x,"<p class=muted>Unable to load data.</p>"));}
