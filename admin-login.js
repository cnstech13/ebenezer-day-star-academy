// ======================================================
// Ebenezer Day Star Academy
// ADMIN AUTHENTICATION + ADMIN PAGE PROTECTION
// Firebase Authentication + Firestore
// ======================================================

import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import { auth, db } from "./firebase-config.js";

const LEGACY_ADMIN_USERNAME = "myschool";
const DEFAULT_ADMIN_EMAIL = "cnstech0013@gmail.com";

// ------------------------------------------------------
// Helpers
// ------------------------------------------------------

function getPageName() {
    return window.location.pathname.split("/").pop() || "index.html";
}

function isAdminLoginPage() {
    return getPageName() === "admin-login.html";
}

async function getAdminRole(user) {
    if (!user) return false;

    // Keep the configured first administrator working even before
    // an optional users/{uid} profile has been created.
    if (
        user.email &&
        user.email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase()
    ) {
        return true;
    }

    try {
        const snapshot = await getDoc(doc(db, "users", user.uid));
        return snapshot.exists() && snapshot.data().role === "admin";
    } catch (error) {
        console.error("Unable to verify administrator role:", error);
        return false;
    }
}

function saveAdminSession(user) {
    sessionStorage.setItem("adminLoggedIn", "true");
    sessionStorage.setItem("adminUsername", "admin");
    sessionStorage.setItem("adminUid", user.uid);
    sessionStorage.setItem("adminEmail", user.email || "");
}

function clearAdminSession() {
    sessionStorage.removeItem("adminLoggedIn");
    sessionStorage.removeItem("adminUsername");
    sessionStorage.removeItem("adminUid");
    sessionStorage.removeItem("adminEmail");
}

function updateAdminUser() {
    const adminUser = document.getElementById("adminUser");
    const adminEmail = document.getElementById("adminEmail");

    if (adminUser) adminUser.textContent = "Administrator";

    if (adminEmail) {
        const email =
            sessionStorage.getItem("adminEmail") ||
            auth.currentUser?.email ||
            DEFAULT_ADMIN_EMAIL;

        adminEmail.textContent = email;
    }
}

function showLoginError(message) {
    const error = document.getElementById("loginError");
    if (error) {
        error.textContent = message;
        error.style.display = "block";
    }

    if (typeof Swal !== "undefined") {
        Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: message,
            confirmButtonText: "OK"
        });
    }
}

// ------------------------------------------------------
// ADMIN LOGIN
// ------------------------------------------------------

const adminLoginForm = document.getElementById("adminLoginForm");

if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username =
            document.getElementById("username")?.value.trim() || "";

        const password =
            document.getElementById("password")?.value || "";

        const loginButton =
            adminLoginForm.querySelector('button[type="submit"]');

        const loginError =
            document.getElementById("loginError");

        if (loginError) {
            loginError.textContent = "";
            loginError.style.display = "none";
        }

        if (!username || !password) {
            showLoginError("Please enter your email/username and password.");
            return;
        }

        const email =
            username.toLowerCase() === LEGACY_ADMIN_USERNAME
                ? DEFAULT_ADMIN_EMAIL
                : username.toLowerCase();

        try {
            if (loginButton) {
                loginButton.disabled = true;
                loginButton.textContent = "Signing in...";
            }

            const credential =
                await signInWithEmailAndPassword(auth, email, password);

            const isAdmin = await getAdminRole(credential.user);

            if (!isAdmin) {
                await signOut(auth);
                clearAdminSession();
                throw new Error(
                    "This account does not have administrator access."
                );
            }

            saveAdminSession(credential.user);

            if (typeof Swal !== "undefined") {
                await Swal.fire({
                    icon: "success",
                    title: "Welcome",
                    text: "Administrator login successful.",
                    timer: 1100,
                    showConfirmButton: false
                });
            }

            window.location.replace("dashboard.html");
        } catch (error) {
            console.error("Admin login error:", error);

            let message = "Unable to sign in. Please try again.";

            switch (error.code) {
                case "auth/invalid-credential":
                case "auth/invalid-login-credentials":
                case "auth/wrong-password":
                case "auth/user-not-found":
                    message = "Incorrect email/username or password.";
                    break;

                case "auth/invalid-email":
                    message = "Please enter a valid email address.";
                    break;

                case "auth/operation-not-allowed":
                    message =
                        "Email/password authentication is not enabled in Firebase.";
                    break;

                case "auth/unauthorized-domain":
                    message =
                        "This website domain is not authorized in Firebase Authentication.";
                    break;

                case "auth/network-request-failed":
                    message =
                        "Network error. Check your internet connection and try again.";
                    break;

                case "auth/too-many-requests":
                    message =
                        "Too many login attempts. Please wait and try again later.";
                    break;

                default:
                    if (error.message) message = error.message;
            }

            showLoginError(message);
        } finally {
            if (loginButton) {
                loginButton.disabled = false;
                loginButton.textContent = "Sign In";
            }
        }
    });
}

// ------------------------------------------------------
// PROTECT EVERY ADMIN PAGE
// ------------------------------------------------------

if (!isAdminLoginPage()) {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            clearAdminSession();
            window.location.replace("admin-login.html");
            return;
        }

        const isAdmin = await getAdminRole(user);

        if (!isAdmin) {
            await signOut(auth).catch(console.error);
            clearAdminSession();

            if (typeof Swal !== "undefined") {
                await Swal.fire({
                    icon: "error",
                    title: "Access Denied",
                    text: "This account is not authorized to access the administrator area.",
                    confirmButtonText: "Return to Login"
                });
            }

            window.location.replace("admin-login.html");
            return;
        }

        saveAdminSession(user);
        updateAdminUser();
    });
}

// ------------------------------------------------------
// LOGIN PAGE MUST ALWAYS REQUIRE CREDENTIALS
// ------------------------------------------------------
// Firebase Authentication normally persists a successful login
// across browser refreshes/revisits. For this school's admin login,
// the login page is intentionally a fresh login screen. Therefore,
// when the admin login page opens, any existing Firebase Auth session
// is signed out and the local admin session is cleared.
//
// IMPORTANT: Do NOT redirect automatically from this page based on
// onAuthStateChanged. The administrator must enter credentials.
// ------------------------------------------------------

if (isAdminLoginPage()) {
    clearAdminSession();

    // Prevent a previously persisted Firebase session from
    // automatically bypassing the credential form.
    signOut(auth).catch((error) => {
        console.warn("Previous Firebase session could not be cleared:", error);
    });
}

// ------------------------------------------------------
// LOGOUT BUTTONS
// ------------------------------------------------------

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", async (event) => {
        event.preventDefault();

        try {
            await signOut(auth);
            clearAdminSession();
            window.location.replace("admin-login.html");
        } catch (error) {
            console.error("Logout error:", error);

            if (typeof Swal !== "undefined") {
                Swal.fire(
                    "Logout Failed",
                    "Unable to sign out. Please try again.",
                    "error"
                );
            }
        }
    });
}
