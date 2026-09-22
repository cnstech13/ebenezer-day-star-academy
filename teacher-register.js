// =========================================================
// TEACHER REGISTRATION
// EBENEZER DAY STAR ACADEMY
// =========================================================

import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signOut
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import { auth } from "./firebase-config.js";

console.log("Teacher Registration JavaScript is working.");


// =========================================================
// HELPER
// =========================================================

function showMessage(icon, title, text) {

    if (typeof Swal !== "undefined") {

        Swal.fire({
            icon: icon,
            title: title,
            text: text,
            confirmButtonColor: "#d4af37"
        });

    } else {

        alert(`${title}\n\n${text}`);

    }

}


function normalizeEmail(email) {

    return String(email || "")
        .trim()
        .toLowerCase();

}


// =========================================================
// GET ELEMENTS
// =========================================================

const form =
    document.getElementById("teacherRegisterForm");

const emailInput =
    document.getElementById("teacherEmail");

const passwordInput =
    document.getElementById("teacherPassword");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

const registerButton =
    document.getElementById("registerBtn");


// =========================================================
// DEBUG
// =========================================================

console.log("Registration form:", form);
console.log("Email input:", emailInput);
console.log("Password input:", passwordInput);
console.log("Confirm password input:", confirmPasswordInput);
console.log("Register button:", registerButton);


// =========================================================
// FORM SUBMIT
// =========================================================

if (!form) {

    console.error(
        "teacherRegisterForm was not found."
    );

} else {

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        console.log(
            "Create Teacher Account button clicked."
        );


        // -------------------------------------------------
        // GET VALUES
        // -------------------------------------------------

        const email =
            normalizeEmail(emailInput.value);

        const password =
            passwordInput.value;

        const confirmPassword =
            confirmPasswordInput.value;


        console.log("Email:", email);

        console.log(
            "Password length:",
            password.length
        );

        console.log(
            "Confirm password length:",
            confirmPassword.length
        );


        // -------------------------------------------------
        // EMAIL VALIDATION
        // -------------------------------------------------

        if (!email) {

            showMessage(
                "warning",
                "Email Required",
                "Please enter your registered email address."
            );

            return;

        }


        // -------------------------------------------------
        // PASSWORD VALIDATION
        // -------------------------------------------------

        if (password.length < 6) {

            showMessage(
                "warning",
                "Password Too Short",
                "Your password must contain at least 6 characters."
            );

            return;

        }


        // -------------------------------------------------
        // CONFIRM PASSWORD
        // -------------------------------------------------

        if (password !== confirmPassword) {

            showMessage(
                "warning",
                "Passwords Do Not Match",
                "Please make sure both password fields contain exactly the same password."
            );

            return;

        }


        try {

            // -------------------------------------------------
            // DISABLE BUTTON
            // -------------------------------------------------

            registerButton.disabled = true;

            registerButton.textContent =
                "Creating Account...";


            console.log(
                "Creating Firebase Authentication account..."
            );


            // -------------------------------------------------
            // CREATE FIREBASE ACCOUNT
            // -------------------------------------------------

            const credential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                credential.user;


            console.log(
                "Firebase account created successfully:",
                user.uid
            );


            // -------------------------------------------------
            // SEND VERIFICATION EMAIL
            // -------------------------------------------------

            console.log(
                "Sending verification email..."
            );


            await sendEmailVerification(user);


            console.log(
                "Verification email sent successfully."
            );


            // -------------------------------------------------
            // SAVE EMAIL
            // -------------------------------------------------

            localStorage.setItem(
                "teacherPendingEmail",
                email
            );


            // -------------------------------------------------
            // SIGN OUT
            // -------------------------------------------------

            await signOut(auth);


            // -------------------------------------------------
            // SUCCESS MESSAGE
            // -------------------------------------------------

            if (typeof Swal !== "undefined") {

                await Swal.fire({

                    icon: "success",

                    title: "Account Created!",

                    text:
                        "Your Teacher Portal account has been created. Please check your email and click the verification link before logging in.",

                    confirmButtonColor: "#d4af37"

                });

            } else {

                alert(
                    "Account created successfully. Please check your email and verify your account."
                );

            }


            // -------------------------------------------------
            // GO TO LOGIN
            // -------------------------------------------------

            window.location.href =
                "teacher-login.html";


        } catch (error) {

            console.error(
                "Teacher registration error:",
                error
            );

            console.error(
                "Firebase error code:",
                error.code
            );


            let message =
                error.message ||
                "Unable to create the teacher account.";


            // -------------------------------------------------
            // FIREBASE ERRORS
            // -------------------------------------------------

            if (
                error.code ===
                "auth/email-already-in-use"
            ) {

                message =
                    "This email already has a Firebase account. Please use Teacher Login instead.";

            }


            else if (
                error.code ===
                "auth/invalid-email"
            ) {

                message =
                    "Please enter a valid email address.";

            }


            else if (
                error.code ===
                "auth/weak-password"
            ) {

                message =
                    "The password is too weak. Please use at least 6 characters.";

            }


            else if (
                error.code ===
                "auth/network-request-failed"
            ) {

                message =
                    "Network connection failed. Please check your internet connection.";

            }


            else if (
                error.code ===
                "auth/operation-not-allowed"
            ) {

                message =
                    "Email/password authentication is not enabled in Firebase Authentication.";

            }


            // -------------------------------------------------
            // SHOW ERROR
            // -------------------------------------------------

            showMessage(
                "error",
                "Registration Failed",
                message
            );


        } finally {

            // -------------------------------------------------
            // ENABLE BUTTON
            // -------------------------------------------------

            registerButton.disabled = false;

            registerButton.textContent =
                "Create Teacher Account";

        }

    });

}


// =========================================================
// SHOW / HIDE PASSWORD BUTTONS
// =========================================================

const showPasswordButtons =
    document.querySelectorAll(
        ".show-password"
    );


showPasswordButtons.forEach((button) => {

    button.addEventListener("click", () => {

        const targetId =
            button.getAttribute("data-target");

        const target =
            document.getElementById(targetId);


        if (!target) {
            return;
        }


        if (target.type === "password") {

            target.type = "text";

            button.textContent =
                "Hide";

        } else {

            target.type = "password";

            button.textContent =
                "Show";

        }

    });

});