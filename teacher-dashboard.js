import { collection, getDocs, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { requireRole, logoutToLogin } from "./role-guard.js";
import { db } from "./firebase-config.js";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
const box=(id,html)=>document.getElementById(id).innerHTML=html;
const authz=await requireRole("teacher"); const p=authz.profile;
document.getElementById("welcome").textContent=`Welcome, ${p.name||p.fullName||"Teacher"}`;document.getElementById("details").textContent=p.email||authz.user.email||"";
document.getElementById("logout").onclick=logoutToLogin;
const classIds=Array.isArray(p.assignedClassIds)?p.assignedClassIds:[];
try{
 const cs=[]; for(const id of classIds){const q=await getDocs(query(collection(db,"classes"),where("id","==",id)));q.forEach(x=>cs.push({...x.data(),_id:x.id}));}
 box("classes",cs.length?cs.map(x=>`<div class=item><b>${esc(x.name||x.className||x.id||x._id)}</b><div class=muted>${esc(x.session||"Active session")}</div></div>`).join(""):"<p class=muted>No classes assigned yet.</p>");
 let students=[]; for(let i=0;i<classIds.length;i+=10){const part=classIds.slice(i,i+10);if(part.length){const q=await getDocs(query(collection(db,"students"),where("classId","in",part)));q.forEach(x=>students.push({...x.data(),_id:x.id}));}}
 box("students",students.length?students.map(x=>`<div class=item>${esc(x.name||x.fullName||"Student")} <span class=muted>(${esc(x.className||x.classId||"")})</span></div>`).join(""):"<p class=muted>No students found.</p>");
 const rq=await getDocs(query(collection(db,"results"),where("teacherUid","==",authz.user.uid),orderBy("createdAt","desc"),limit(10))).catch(async()=>await getDocs(query(collection(db,"results"),where("teacherUid","==",authz.user.uid),limit(10))));
 box("results",rq.size?[...rq.docs].map(x=>`<div class=item>${esc(x.data().studentName||x.data().studentId)} — ${esc(x.data().subject||"")} <b>${esc(x.data().total??x.data().score??"")}</b></div>`).join(""):"<p class=muted>No recent results.</p>");
 const nq=await getDocs(query(collection(db,"notifications"),where("audience","array-contains","teacher"),limit(10)));box("notices",nq.size?[...nq.docs].map(x=>`<div class=item><b>${esc(x.data().title)}</b><div>${esc(x.data().message)}</div></div>`).join(""):"<p class=muted>No notifications.</p>");
}catch(e){console.error(e);box("students","Unable to load data.");box("results","Unable to load data.");box("notices","Unable to load notifications.");}
