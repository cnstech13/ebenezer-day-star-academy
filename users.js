import { adminReady, withTimeout } from "./admin-guard.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { collection, getDocs, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { firebaseConfig, auth, db } from "./firebase-config.js";
import { requireRole } from "./role-guard.js";
const a=await import("./admin-login.js"); // keeps existing admin protection
const rows=document.getElementById("rows"),msg=document.getElementById("msg");
const secondary=initializeApp(firebaseConfig,"portalUserCreation");const secondaryAuth=getAuth(secondary);
async function load(){const s=await withTimeout(getDocs(collection(db,"users")));rows.innerHTML=[...s.docs].map(x=>{const d=x.data();return `<tr><td>${d.name||d.fullName||""}</td><td>${d.email||""}</td><td>${d.role||""}</td><td>${d.studentUid||d.teacherUid||""}</td><td>${d.active===false?"Disabled":"Active"}</td></tr>`}).join("")||'<tr><td colspan=5>No users.</td></tr>'} 
document.getElementById("form").onsubmit=async e=>{e.preventDefault();msg.textContent="Creating account...";try{const role=document.getElementById("role").value,name=document.getElementById("name").value.trim(),email=document.getElementById("email").value.trim().toLowerCase(),password=document.getElementById("password").value,link=document.getElementById("link").value.trim();const c=await createUserWithEmailAndPassword(secondaryAuth,email,password);const profile={name,email,role,active:true,createdAt:serverTimestamp()};if(role==="student")profile.studentUid=link;if(role==="teacher"){profile.teacherUid=link;profile.assignedClassIds=document.getElementById("classes").value.split(",").map(x=>x.trim()).filter(Boolean)}await withTimeout(setDoc(doc(db,"users",c.user.uid),profile));await signOut(secondaryAuth);msg.textContent="Account created successfully.";e.target.reset();await load();}catch(err){console.error(err);msg.textContent=err.message||"Could not create account.";}};
document.getElementById("logout").onclick=async()=>{await signOut(auth);location.replace("admin-login.html")};await load();

await adminReady;
