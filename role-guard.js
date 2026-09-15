// ============================================================
// ROLE GUARD — Teacher / Parent / Student portals
// Server-side Firestore rules remain the real security boundary.
// ============================================================
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";

export function requireRole(allowedRoles, redirect = "portal-login.html") {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) { location.replace(redirect); return; }
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const profile = snap.exists() ? snap.data() : null;
        if (!profile || !roles.includes(profile.role)) {
          await signOut(auth).catch(() => {});
          location.replace(redirect);
          return;
        }
        resolve({ user, profile });
      } catch (e) {
        console.error(e);
        await signOut(auth).catch(() => {});
        location.replace(redirect);
      }
    });
  });
}

export async function logoutToLogin() {
  await signOut(auth).catch(() => {});
  location.replace("portal-login.html");
}
