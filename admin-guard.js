// ============================================================
// ADMIN GUARD + FIRESTORE READINESS
// Ebenezer Day Star Academy
//
// IMPORTANT:
// All admin CRUD pages wait for Firebase Authentication before
// making Firestore requests. This prevents requests from running
// while auth is still initializing and appearing to load forever.
// ============================================================

import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";

const DEFAULT_ADMIN_EMAIL = "cnstech0013@gmail.com";
const AUTH_TIMEOUT = 12000;

function waitForAuth() {
    return new Promise((resolve, reject) => {
        let settled = false;
        const timer = setTimeout(() => {
            if (!settled) {
                settled = true;
                unsubscribe?.();
                reject(new Error("Firebase Authentication is taking too long. Check your internet connection and Firebase configuration."));
            }
        }, AUTH_TIMEOUT);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            unsubscribe();
            resolve(user);
        }, (error) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            unsubscribe();
            reject(error);
        });
    });
}

async function verifyAdmin(user) {
    if (!user) return false;

    if ((user.email || "").toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase()) {
        return true;
    }

    const snap = await getDoc(doc(db, "users", user.uid));
    return snap.exists() && snap.data()?.role === "admin" && snap.data()?.active !== false;
}

export const adminReady = (async () => {
    const user = await waitForAuth();

    if (!user) {
        sessionStorage.removeItem("adminLoggedIn");
        location.replace("admin-login.html");
        throw new Error("Administrator authentication required.");
    }

    const ok = await verifyAdmin(user);

    if (!ok) {
        await signOut(auth).catch(() => {});
        sessionStorage.removeItem("adminLoggedIn");
        location.replace("admin-login.html");
        throw new Error("Administrator access required.");
    }

    sessionStorage.setItem("adminLoggedIn", "true");
    sessionStorage.setItem("adminUid", user.uid);
    sessionStorage.setItem("adminEmail", user.email || "");

    return user;
})();

export function withTimeout(promise, ms = 15000, message = "The Firebase request timed out. Please check your internet connection and Firestore configuration.") {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
