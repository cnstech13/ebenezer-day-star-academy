// ============================================================
// PARENT LOGIN
// Ebenezer Day Star Academy
// Firebase Authentication + Firestore
// ============================================================


import {

    signInWithEmailAndPassword,

    onAuthStateChanged,

    sendPasswordResetEmail,

    signOut

}
from
"https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";


import {

    doc,

    getDoc

}
from
"https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";


import {

    auth,

    db

}
from "./firebase-config.js";



// ============================================================
// ELEMENTS
// ============================================================

const form =
    document.getElementById(
        "parentLoginForm"
    );


const emailInput =
    document.getElementById(
        "email"
    );


const passwordInput =
    document.getElementById(
        "password"
    );


const loginBtn =
    document.getElementById(
        "loginBtn"
    );


const errorMessage =
    document.getElementById(
        "errorMessage"
    );


const successMessage =
    document.getElementById(
        "successMessage"
    );


const forgotPassword =
    document.getElementById(
        "forgotPassword"
    );



// ============================================================
// SHOW ERROR
// ============================================================

function showError(message) {

    errorMessage.textContent =
        message;

    errorMessage.style.display =
        "block";

    successMessage.style.display =
        "none";

}



// ============================================================
// SHOW SUCCESS
// ============================================================

function showSuccess(message) {

    successMessage.textContent =
        message;

    successMessage.style.display =
        "block";

    errorMessage.style.display =
        "none";

}



// ============================================================
// GET FIREBASE ERROR
// ============================================================

function getLoginError(error) {

    switch (error.code) {

        case "auth/invalid-credential":

            return "Incorrect email or password.";

        case "auth/user-not-found":

            return "No account exists with this email.";

        case "auth/wrong-password":

            return "Incorrect password.";

        case "auth/too-many-requests":

            return "Too many login attempts. Please try again later.";

        case "auth/network-request-failed":

            return "Network error. Check your internet connection.";

        default:

            return (
                error.message ||
                "Unable to login."
            );

    }

}



// ============================================================
// VERIFY PARENT ACCOUNT
// ============================================================

async function verifyParentAccount(user) {

    const userRef =
        doc(
            db,
            "users",
            user.uid
        );


    const userSnapshot =
        await getDoc(
            userRef
        );


    if (!userSnapshot.exists()) {

        await signOut(auth);

        throw new Error(
            "Your parent profile has not been created yet."
        );

    }


    const userData =
        userSnapshot.data();


    if (
        userData.role !==
        "parent"
    ) {

        await signOut(auth);

        throw new Error(
            "This account is not registered as a parent account."
        );

    }


    return userData;

}



// ============================================================
// LOGIN
// ============================================================

form.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const email =
            emailInput.value
                .trim()
                .toLowerCase();


        const password =
            passwordInput.value;


        if (!email || !password) {

            showError(
                "Please enter your email and password."
            );

            return;

        }


        loginBtn.disabled =
            true;

        loginBtn.textContent =
            "Logging in...";


        try {

            const credential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            await verifyParentAccount(
                credential.user
            );


            showSuccess(
                "Login successful. Opening your portal..."
            );


            setTimeout(
                function() {

                    window.location.href =
                        "parent-dashboard.html";

                },
                700
            );

        }

        catch(error) {

            console.error(
                "Parent login error:",
                error
            );


            showError(
                getLoginError(error)
            );

        }

        finally {

            loginBtn.disabled =
                false;

            loginBtn.textContent =
                "Login";

        }

    }
);



// ============================================================
// FORGOT PASSWORD
// ============================================================

forgotPassword.addEventListener(
    "click",
    async function() {

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

        catch(error) {

            console.error(
                error
            );


            showError(
                "Unable to send password reset email."
            );

        }

    }
);



// ============================================================
// CHECK EXISTING LOGIN
// ============================================================

onAuthStateChanged(
    auth,
    async function(user) {

        if (!user) {

            return;

        }


        try {

            await verifyParentAccount(
                user
            );


            window.location.href =
                "parent-dashboard.html";

        }

        catch(error) {

            console.error(
                error
            );

        }

    }
);