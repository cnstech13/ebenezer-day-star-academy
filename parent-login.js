// ============================================================
// PARENT LOGIN
// EBENEZER DAY STAR ACADEMY
//
// IMPORTANT:
// 1. Parent email verification is NOT required.
// 2. Dashboard redirect happens ONLY after pressing Login.
// 3. Existing Firebase sessions do NOT automatically redirect.
// ============================================================

import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
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


// ============================================================
// ELEMENTS
// ============================================================

const form = document.getElementById("parentLoginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");
const forgotPassword = document.getElementById("forgotPassword");


// ============================================================
// LOGIN STATE
// ============================================================

let loginInProgress = false;


// ============================================================
// SHOW ERROR
// ============================================================

function showError(message) {

    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = "block";
    }

    if (successMessage) {
        successMessage.textContent = "";
        successMessage.style.display = "none";
    }
}


// ============================================================
// SHOW SUCCESS
// ============================================================

function showSuccess(message) {

    if (successMessage) {
        successMessage.textContent = message;
        successMessage.style.display = "block";
    }

    if (errorMessage) {
        errorMessage.textContent = "";
        errorMessage.style.display = "none";
    }
}


// ============================================================
// HIDE MESSAGES
// ============================================================

function hideMessages() {

    if (errorMessage) {
        errorMessage.textContent = "";
        errorMessage.style.display = "none";
    }

    if (successMessage) {
        successMessage.textContent = "";
        successMessage.style.display = "none";
    }
}


// ============================================================
// FIREBASE ERROR MESSAGE
// ============================================================

function getLoginError(error) {

    switch (error?.code) {

        case "auth/invalid-credential":
            return "Incorrect email or password.";

        case "auth/user-not-found":
            return "No account exists with this email.";

        case "auth/wrong-password":
            return "Incorrect email or password.";

        case "auth/too-many-requests":
            return "Too many login attempts. Please try again later.";

        case "auth/network-request-failed":
            return "Network error. Please check your internet connection.";

        case "auth/user-disabled":
            return "This Firebase account has been disabled.";

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        default:
            return error?.message || "Unable to login. Please try again.";
    }
}


// ============================================================
// VERIFY PARENT PROFILE
// ============================================================

async function verifyParentAccount(user) {

    if (!user) {
        throw new Error("No authenticated user was found.");
    }


    console.log(
        "Checking parent profile:",
        user.uid
    );


    const userRef = doc(
        db,
        "users",
        user.uid
    );


    const snapshot = await getDoc(userRef);


    // ========================================================
    // NO USERS DOCUMENT
    // ========================================================

    if (!snapshot.exists()) {

        throw new Error(
            "Your parent profile has not been created yet. Please contact the school."
        );
    }


    const userData = snapshot.data();


    console.log(
        "Parent profile found:",
        userData
    );


    // ========================================================
    // CHECK ROLE
    // ========================================================

    const role = String(
        userData.role || ""
    )
    .trim()
    .toLowerCase();


    if (role !== "parent") {

        throw new Error(
            "This account is not registered as a parent account."
        );
    }


    // ========================================================
    // CHECK ACTIVE STATUS
    // ========================================================

    if (userData.active === false) {

        throw new Error(
            "Your parent account has been deactivated. Please contact the school."
        );
    }


    // ========================================================
    // IMPORTANT
    //
    // NO emailVerified CHECK.
    // ========================================================

    return userData;
}


// ============================================================
// LOGIN FORM
// ============================================================

if (!form) {

    console.error(
        "Parent login form #parentLoginForm was not found."
    );

} else {

    form.addEventListener(
        "submit",

        async function(event) {

            event.preventDefault();


            // Prevent double-click
            if (loginInProgress) {
                return;
            }


            hideMessages();


            // =================================================
            // CHECK INPUTS
            // =================================================

            if (!emailInput || !passwordInput) {

                showError(
                    "Login form is incomplete. Please contact the school."
                );

                return;
            }


            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();


            const password =
                passwordInput.value;


            // =================================================
            // VALIDATE
            // =================================================

            if (!email) {

                showError(
                    "Please enter your email address."
                );

                emailInput.focus();

                return;
            }


            if (!password) {

                showError(
                    "Please enter your password."
                );

                passwordInput.focus();

                return;
            }


            // =================================================
            // START LOGIN
            // =================================================

            loginInProgress = true;


            if (loginBtn) {

                loginBtn.disabled = true;
                loginBtn.textContent = "Logging in...";
            }


            let firebaseUser = null;


            try {

                console.log(
                    "Parent login started..."
                );


                // =================================================
                // AUTHENTICATE
                // =================================================

                const credential =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                firebaseUser =
                    credential.user;


                console.log(
                    "Firebase authentication successful:",
                    firebaseUser.uid
                );


                // =================================================
                // VERIFY FIRESTORE PARENT PROFILE
                // =================================================

                await verifyParentAccount(
                    firebaseUser
                );


                // =================================================
                // SUCCESS
                // =================================================

                showSuccess(
                    "Login successful. Opening Parent Portal..."
                );


                console.log(
                    "Parent verified. Redirecting..."
                );


                // =================================================
                // REDIRECT ONLY HERE
                // =================================================

                setTimeout(
                    () => {

                        window.location.replace(
                            "parent-dashboard.html"
                        );

                    },
                    500
                );

            }

            catch (error) {

                console.error(
                    "Parent login failed:",
                    error
                );


                // =================================================
                // IMPORTANT:
                // If authentication succeeded but Firestore
                // parent verification failed, sign out.
                // =================================================

                if (firebaseUser) {

                    try {

                        await signOut(auth);

                    } catch (signOutError) {

                        console.error(
                            "Sign out after failed parent verification:",
                            signOutError
                        );
                    }
                }


                // =================================================
                // SHOW ERROR
                // =================================================

                if (error?.code) {

                    showError(
                        getLoginError(error)
                    );

                } else {

                    showError(
                        error?.message ||
                        "Unable to login. Please try again."
                    );
                }

            }

            finally {

                loginInProgress = false;


                if (loginBtn) {

                    loginBtn.disabled = false;
                    loginBtn.textContent = "Login";
                }
            }

        }
    );
}


// ============================================================
// FORGOT PASSWORD
// ============================================================

if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",

        async function() {

            hideMessages();


            if (!emailInput) {

                showError(
                    "Email field was not found."
                );

                return;
            }


            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();


            if (!email) {

                showError(
                    "Enter your email address first."
                );

                emailInput.focus();

                return;
            }


            try {

                await sendPasswordResetEmail(
                    auth,
                    email
                );


                showSuccess(
                    "Password reset instructions have been sent to your email."
                );

            }

            catch (error) {

                console.error(
                    "Password reset error:",
                    error
                );


                switch (error?.code) {

                    case "auth/user-not-found":

                        showError(
                            "No account exists with this email."
                        );

                        break;


                    case "auth/invalid-email":

                        showError(
                            "Please enter a valid email address."
                        );

                        break;


                    case "auth/network-request-failed":

                        showError(
                            "Network error. Please check your internet connection."
                        );

                        break;


                    default:

                        showError(
                            "Unable to send password reset email."
                        );
                }
            }
        }
    );
}


// ============================================================
// IMPORTANT
// ============================================================
//
// THERE IS NO onAuthStateChanged() HERE.
//
// This is intentional.
//
// A Firebase session already existing on the device will NOT
// automatically redirect the user to parent-dashboard.html.
//
// The user must explicitly press LOGIN.
//
// ============================================================

console.log(
    "Parent login page JavaScript loaded successfully."
);