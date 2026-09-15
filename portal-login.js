import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";
const form=document.getElementById("loginForm"), msg=document.getElementById("msg"), parentLink=document.getElementById("parentLink");
let selected="teacher";
document.querySelectorAll("[data-role]").forEach(b=>b.onclick=()=>{selected=b.dataset.role;document.querySelectorAll("[data-role]").forEach(x=>x.classList.remove("active"));b.classList.add("active");parentLink.style.display=selected==="parent"?"block":"none";});
form.onsubmit=async e=>{e.preventDefault();msg.textContent="Signing in...";try{const c=await signInWithEmailAndPassword(auth,email.value.trim(),password.value);const s=await getDoc(doc(db,"users",c.user.uid));if(!s.exists()||s.data().role!==selected){await signOut(auth);throw new Error(`This account is not registered as a ${selected}.`)};const p=s.data();const dest=selected==="teacher"?"teacher-dashboard.html":selected==="student"?"student-dashboard.html":"parent-dashboard.html";location.replace(dest);}catch(e){msg.textContent=e.message||"Login failed.";msg.style.color="#b42318";}};
