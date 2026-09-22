/* =========================================================
   ADMIN GUARD
   EBENEZER DAY STAR ACADEMY

   PURPOSE:
   - Protect admin pages
   - Allow only administrator accounts
   - Keep the admin logged in as admin
   - Never redirect an admin to teacher/parent/student login
   - Redirect unauthenticated users to admin-login.html
========================================================= */

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase-config.js";


/* =========================================================
   DEFAULT ADMIN EMAIL
========================================================= */

const DEFAULT_ADMIN_EMAIL =
    "cnstech0013@gmail.com";


/* =========================================================
   AUTH TIMEOUT
========================================================= */

const AUTH_TIMEOUT = 12000;


/* =========================================================
   WAIT FOR FIREBASE AUTH
========================================================= */

function waitForAuth() {

    return new Promise((resolve, reject) => {

        let settled = false;

        let unsubscribe = null;


        const timer = setTimeout(() => {

            if (settled) return;

            settled = true;

            if (unsubscribe) {
                unsubscribe();
            }

            reject(
                new Error(
                    "Firebase Authentication is taking too long. " +
                    "Please check your internet connection."
                )
            );

        }, AUTH_TIMEOUT);


        unsubscribe = onAuthStateChanged(
            auth,

            (user) => {

                if (settled) return;

                settled = true;

                clearTimeout(timer);

                if (unsubscribe) {
                    unsubscribe();
                }

                resolve(user);

            },

            (error) => {

                if (settled) return;

                settled = true;

                clearTimeout(timer);

                if (unsubscribe) {
                    unsubscribe();
                }

                reject(error);

            }
        );

    });

}


/* =========================================================
   VERIFY ADMIN
========================================================= */

async function verifyAdmin(user) {

    if (!user) {
        return false;
    }


    /* -----------------------------------------------------
       DEFAULT ADMIN ACCOUNT

       This allows the main administrator email to access
       the admin portal even if there is no users/{uid}
       document yet.
    ----------------------------------------------------- */

    const userEmail =
        (user.email || "").trim().toLowerCase();


    if (
        userEmail ===
        DEFAULT_ADMIN_EMAIL.toLowerCase()
    ) {

        return true;

    }


    /* -----------------------------------------------------
       OTHER ADMIN ACCOUNTS

       Check users/{uid}
    ----------------------------------------------------- */

    try {

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        const userSnapshot =
            await getDoc(userRef);


        if (!userSnapshot.exists()) {

            return false;

        }


        const profile =
            userSnapshot.data() || {};


        const role =
            String(
                profile.role || ""
            )
            .trim()
            .toLowerCase();


        const active =
            profile.active !== false;


        return (
            role === "admin" &&
            active
        );


    } catch (error) {

        console.error(
            "Error verifying administrator:",
            error
        );

        return false;

    }

}


/* =========================================================
   ADMIN AUTHENTICATION
========================================================= */

export const adminReady =
    (async () => {

        try {

            /* ---------------------------------------------
               Wait for Firebase to determine the user
            --------------------------------------------- */

            const user =
                await waitForAuth();


            /* ---------------------------------------------
               NO USER LOGGED IN
            --------------------------------------------- */

            if (!user) {

                sessionStorage.removeItem(
                    "adminLoggedIn"
                );

                sessionStorage.removeItem(
                    "adminUid"
                );

                sessionStorage.removeItem(
                    "adminEmail"
                );


                /*
                 * IMPORTANT:
                 *
                 * Only redirect to ADMIN login.
                 *
                 * Never teacher-login.html
                 * Never parent-login.html
                 * Never student-login.html
                 */

                location.replace(
                    "admin-login.html"
                );


                throw new Error(
                    "Administrator authentication required."
                );

            }


            /* ---------------------------------------------
               VERIFY ADMIN
            --------------------------------------------- */

            const isAdmin =
                await verifyAdmin(user);


            /* ---------------------------------------------
               NOT AN ADMIN
            --------------------------------------------- */

            if (!isAdmin) {

                console.warn(
                    "Access denied. Current account is not an administrator."
                );


                /*
                 * Sign out the unauthorized account.
                 */

                await signOut(auth)
                    .catch(
                        error => {
                            console.error(
                                "Sign-out error:",
                                error
                            );
                        }
                    );


                sessionStorage.removeItem(
                    "adminLoggedIn"
                );

                sessionStorage.removeItem(
                    "adminUid"
                );

                sessionStorage.removeItem(
                    "adminEmail"
                );


                /*
                 * IMPORTANT:
                 *
                 * Even if the account is a teacher,
                 * parent, or student, DO NOT redirect
                 * them to their respective login pages.
                 *
                 * This is an ADMIN PAGE.
                 */

                location.replace(
                    "admin-login.html"
                );


                throw new Error(
                    "Administrator access required."
                );

            }


            /* ---------------------------------------------
               ADMIN VERIFIED
            --------------------------------------------- */

            sessionStorage.setItem(
                "adminLoggedIn",
                "true"
            );


            sessionStorage.setItem(
                "adminUid",
                user.uid
            );


            sessionStorage.setItem(
                "adminEmail",
                user.email || ""
            );


            /*
             * Store administrator name if available.
             */

            if (user.displayName) {

                sessionStorage.setItem(
                    "adminName",
                    user.displayName
                );

            }


            console.log(
                "Administrator verified:",
                user.email
            );


            return user;


        } catch (error) {

            console.error(
                "Admin authentication error:",
                error
            );


            /*
             * Do not redirect to teacher,
             * student, or parent login.
             *
             * Admin pages always return to
             * admin-login.html when authentication
             * fails.
             */

            throw error;

        }

    })();


/* =========================================================
   FIREBASE REQUEST TIMEOUT
========================================================= */

export function withTimeout(
    promise,
    ms = 60000,
    message =
        "The Firebase request timed out. " +
        "Please check your internet connection " +
        "and Firebase configuration."
) {

    let timer;


    const timeout =
        new Promise(
            (_, reject) => {

                timer =
                    setTimeout(
                        () => {

                            reject(
                                new Error(
                                    message
                                )
                            );

                        },
                        ms
                    );

            }
        );


    return Promise.race([
        promise,
        timeout
    ]).finally(
        () => clearTimeout(timer)
    );

}