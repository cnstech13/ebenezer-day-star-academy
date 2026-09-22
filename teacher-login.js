// =========================================================
// TEACHER LOGIN
// EBENEZER DAY STAR ACADEMY
// =========================================================

import {
    signInWithEmailAndPassword,
    sendEmailVerification,
    signOut
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    limit,
    getDocs,
    doc,
    getDoc,
    writeBatch,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import { auth, db } from "./firebase-config.js";


console.log("=================================");
console.log("Teacher Login JavaScript is working.");
console.log("=================================");


// =========================================================
// NORMALIZE EMAIL
// =========================================================

function normalizeEmail(email) {

    return String(email || "")
        .trim()
        .toLowerCase();

}


// =========================================================
// SHOW MESSAGE
// =========================================================

function showMessage(icon, title, text) {

    if (typeof Swal !== "undefined") {

        return Swal.fire({

            icon: icon,

            title: title,

            text: text,

            confirmButtonColor: "#d4af37"

        });

    }

    alert(`${title}\n\n${text}`);

}


// =========================================================
// LOGIN BUTTON LOADING
// =========================================================

function startLoading(button) {

    if (!button) return;

    button.disabled = true;

    button.innerHTML = `
        <span class="teacher-loading-content">
            <span class="teacher-spinner"></span>
            Signing in...
        </span>
    `;

}


function stopLoading(button) {

    if (!button) return;

    button.disabled = false;

    button.innerHTML = "Login to Teacher Portal";

}


// =========================================================
// ADD LOADING STYLES
// =========================================================

const loadingStyles = document.createElement("style");

loadingStyles.textContent = `

    .teacher-loading-content {

        display: flex;

        align-items: center;

        justify-content: center;

        gap: 10px;

    }


    .teacher-spinner {

        width: 18px;

        height: 18px;

        border: 3px solid rgba(255,255,255,0.35);

        border-top-color: #f4d35e;

        border-radius: 50%;

        display: inline-block;

        animation:
            teacherSpin
            0.8s linear infinite;

    }


    @keyframes teacherSpin {

        from {
            transform: rotate(0deg);
        }

        to {
            transform: rotate(360deg);
        }

    }


    .show-password {

        z-index: 10;

        min-width: 45px;

        padding: 6px 5px;

        cursor: pointer;

        -webkit-tap-highlight-color: transparent;

    }


    .show-password:active {

        transform:
            translateY(-50%)
            scale(0.95);

    }

`;

document.head.appendChild(loadingStyles);


// =========================================================
// FIND TEACHER BY EMAIL
// =========================================================

async function findTeacherByEmail(email) {

    console.log("---------------------------------");
    console.log("Searching teachers collection");
    console.log("Email:", email);
    console.log("---------------------------------");


    const teacherQuery = query(

        collection(db, "teachers"),

        where("email", "==", email),

        limit(1)

    );


    const snapshot = await getDocs(teacherQuery);


    console.log(
        "Teacher query completed."
    );


    console.log(
        "Number of matching teachers:",
        snapshot.size
    );


    if (snapshot.empty) {

        console.log(
            "No teacher record found."
        );

        return null;

    }


    const teacherDoc =
        snapshot.docs[0];


    const teacherData =
        teacherDoc.data();


    console.log(
        "Teacher document ID:",
        teacherDoc.id
    );


    console.log(
        "Teacher data:",
        teacherData
    );


    return {

        id: teacherDoc.id,

        ...teacherData

    };

}


// =========================================================
// COMPLETE TEACHER REGISTRATION
// =========================================================

async function completeTeacherRegistration(user) {

    const email =
        normalizeEmail(user.email);


    console.log(
        "Completing teacher registration..."
    );


    const teacher =
        await findTeacherByEmail(email);


    if (!teacher) {

        throw new Error(
            "No teacher record was found for this email address. Please contact the school administrator."
        );

    }


    // -----------------------------------------------------
    // CHECK TEACHER STATUS
    // -----------------------------------------------------

    if (
        String(teacher.status || "")
            .toLowerCase() !== "active"
    ) {

        throw new Error(
            "Your teacher account is currently inactive. Please contact the school administrator."
        );

    }


    // -----------------------------------------------------
    // ACCOUNT ALREADY REGISTERED
    // -----------------------------------------------------

    if (teacher.accountCreated === true) {

        console.log(
            "Teacher account is already registered."
        );


        if (
            teacher.uid &&
            teacher.uid !== user.uid
        ) {

            throw new Error(
                "This teacher account is already connected to another Firebase account. Please contact the school administrator."
            );

        }


        const userRef =
            doc(db, "users", user.uid);


        const userSnapshot =
            await getDoc(userRef);


        if (!userSnapshot.exists()) {

            throw new Error(
                "Your teacher account is registered, but your teacher profile is missing. Please contact the school administrator."
            );

        }


        const userData =
            userSnapshot.data();


        if (
            userData.role !== "teacher"
        ) {

            throw new Error(
                "Your account is not configured as a teacher account."
            );

        }


        saveTeacherSession(
            user,
            teacher
        );


        return teacher;

    }


    // -----------------------------------------------------
    // CREATE TEACHER FIRESTORE PROFILE
    // -----------------------------------------------------

    console.log(
        "Creating teacher Firestore profile..."
    );


    const userRef =
        doc(db, "users", user.uid);


    const teacherRef =
        doc(db, "teachers", teacher.id);


    const teacherProfile = {

        uid: user.uid,

        name: teacher.name || "",

        email: email,

        role: "teacher",

        teacherId: teacher.id,

        phone: teacher.phone || "",

        subject: teacher.subject || "",

        assignedClassIds:
            Array.isArray(
                teacher.assignedClassIds
            )
                ? teacher.assignedClassIds
                : [],

        status:
            teacher.status || "active",

        createdAt:
            serverTimestamp(),

        updatedAt:
            serverTimestamp()

    };


    const batch =
        writeBatch(db);


    // Create user profile

    batch.set(
        userRef,
        teacherProfile
    );


    // Mark teacher as registered

    batch.update(

        teacherRef,

        {

            accountCreated: true,

            uid: user.uid,

            accountCreatedAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()

        }

    );


    console.log(
        "Saving teacher profile..."
    );


    await batch.commit();


    console.log(
        "Teacher Firestore profile created successfully."
    );


    saveTeacherSession(
        user,
        teacher
    );


    return teacher;

}


// =========================================================
// SAVE TEACHER SESSION
// =========================================================

function saveTeacherSession(
    user,
    teacher
) {

    localStorage.setItem(
        "teacherLoggedIn",
        "true"
    );


    localStorage.setItem(
        "teacherUid",
        user.uid
    );


    localStorage.setItem(
        "teacherEmail",
        normalizeEmail(user.email)
    );


    localStorage.setItem(
        "teacherId",
        teacher.id
    );


    localStorage.setItem(
        "teacherName",
        teacher.name || ""
    );


    localStorage.setItem(
        "teacherSubject",
        teacher.subject || ""
    );

}


// =========================================================
// GET LOGIN FORM
// =========================================================

const loginForm =
    document.getElementById(
        "teacherLoginForm"
    );


const emailInput =
    document.getElementById(
        "teacherEmail"
    );


const passwordInput =
    document.getElementById(
        "teacherPassword"
    );


const loginButton =
    document.getElementById(
        "loginBtn"
    );


console.log(
    "Login form:",
    loginForm
);


console.log(
    "Email input:",
    emailInput
);


console.log(
    "Password input:",
    passwordInput
);


console.log(
    "Login button:",
    loginButton
);


// =========================================================
// LOGIN FORM
// =========================================================

if (!loginForm) {

    console.error(
        "ERROR: teacherLoginForm was not found."
    );

} else {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            console.log(
                "Teacher login button clicked."
            );


            const email =
                normalizeEmail(
                    emailInput?.value
                );


            const password =
                passwordInput?.value || "";


            // -------------------------------------------------
            // VALIDATION
            // -------------------------------------------------

            if (!email) {

                showMessage(
                    "warning",
                    "Email Required",
                    "Please enter your email address."
                );

                return;

            }


            if (!password) {

                showMessage(
                    "warning",
                    "Password Required",
                    "Please enter your password."
                );

                return;

            }


            try {

                // ---------------------------------------------
                // START LOADING
                // ---------------------------------------------

                startLoading(
                    loginButton
                );


                console.log(
                    "Signing in with Firebase..."
                );


                // ---------------------------------------------
                // FIREBASE LOGIN
                // ---------------------------------------------

                const credential =
                    await signInWithEmailAndPassword(

                        auth,

                        email,

                        password

                    );


                let user =
                    credential.user;


                console.log(
                    "Firebase login successful."
                );


                console.log(
                    "Teacher UID:",
                    user.uid
                );


                // ---------------------------------------------
                // RELOAD USER
                // ---------------------------------------------

                await user.reload();


                user =
                    auth.currentUser;


                console.log(
                    "Email verified:",
                    user.emailVerified
                );


                // ---------------------------------------------
                // REFRESH TOKEN
                // ---------------------------------------------

                await user.getIdToken(true);


                console.log(
                    "Firebase ID token refreshed."
                );


                // ---------------------------------------------
                // EMAIL VERIFICATION
                // ---------------------------------------------

                if (!user.emailVerified) {

                    console.log(
                        "Email is not verified."
                    );


                    try {

                        await sendEmailVerification(
                            user
                        );

                    } catch (
                        verificationError
                    ) {

                        console.warn(
                            "Could not resend verification email:",
                            verificationError
                        );

                    }


                    await signOut(auth);


                    throw new Error(
                        "Your email address has not been verified. Please check your email and click the verification link before logging in."
                    );

                }


                console.log(
                    "Email verification confirmed."
                );


                // ---------------------------------------------
                // COMPLETE TEACHER REGISTRATION
                // ---------------------------------------------

                const teacher =
                    await completeTeacherRegistration(
                        user
                    );


                // ---------------------------------------------
                // CLEAN OLD REGISTRATION DATA
                // ---------------------------------------------

                localStorage.removeItem(
                    "teacherPendingEmail"
                );


                localStorage.removeItem(
                    "teacherRegistrationComplete"
                );


                // ---------------------------------------------
                // SUCCESS MESSAGE
                // ---------------------------------------------

                await showMessage(

                    "success",

                    "Login Successful",

                    `Welcome, ${teacher.name || "Teacher"}.`

                );


                // ---------------------------------------------
                // OPEN DASHBOARD
                // ---------------------------------------------

                window.location.href =
                    "teacher-dashboard.html";

            }


            catch (error) {

                console.error(
                    "================================="
                );


                console.error(
                    "TEACHER LOGIN ERROR"
                );


                console.error(
                    "Error code:",
                    error.code
                );


                console.error(
                    "Error message:",
                    error.message
                );


                console.error(
                    error
                );


                console.error(
                    "================================="
                );


                let message =
                    error.message ||
                    "Unable to log in.";


                // ---------------------------------------------
                // FIREBASE AUTH ERRORS
                // ---------------------------------------------

                if (
                    error.code ===
                    "auth/invalid-credential"
                ) {

                    message =
                        "The email or password is incorrect.";

                }


                else if (
                    error.code ===
                    "auth/user-not-found"
                ) {

                    message =
                        "No Firebase account exists with this email.";

                }


                else if (
                    error.code ===
                    "auth/wrong-password"
                ) {

                    message =
                        "The password is incorrect.";

                }


                else if (
                    error.code ===
                    "auth/too-many-requests"
                ) {

                    message =
                        "Too many login attempts. Please wait and try again later.";

                }


                else if (
                    error.code ===
                    "auth/network-request-failed"
                ) {

                    message =
                        "Network connection failed. Please check your internet connection.";

                }


                // ---------------------------------------------
                // FIRESTORE ERRORS
                // ---------------------------------------------

                else if (
                    error.code ===
                    "permission-denied"
                ) {

                    message =
                        "Firestore permission was denied. Make sure the teacher email is verified and that the Admin has created an active teacher record using exactly the same email address.";

                }


                else if (
                    error.code ===
                    "failed-precondition"
                ) {

                    message =
                        "The teacher account could not be completed because the Firestore data is not in the expected state.";

                }


                // ---------------------------------------------
                // SHOW ERROR
                // ---------------------------------------------

                await showMessage(

                    "error",

                    "Teacher Login Failed",

                    message

                );


                // ---------------------------------------------
                // SIGN OUT
                // ---------------------------------------------

                try {

                    await signOut(auth);

                } catch (
                    signOutError
                ) {

                    console.warn(
                        "Sign out cleanup failed:",
                        signOutError
                    );

                }

            }


            finally {

                // ---------------------------------------------
                // STOP LOADING
                // ---------------------------------------------

                stopLoading(
                    loginButton
                );

            }

        }
    );

}


// =========================================================
// SHOW / HIDE PASSWORD
// =========================================================

const showPasswordButtons =
    document.querySelectorAll(
        ".show-password"
    );


console.log(
    "Password buttons found:",
    showPasswordButtons.length
);


showPasswordButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            (event) => {

                // VERY IMPORTANT:
                // Prevent this button from submitting
                // the login form.

                event.preventDefault();

                event.stopPropagation();


                const targetId =
                    button.getAttribute(
                        "data-target"
                    );


                console.log(
                    "Password toggle clicked."
                );


                console.log(
                    "Target:",
                    targetId
                );


                const target =
                    document.getElementById(
                        targetId
                    );


                if (!target) {

                    console.error(
                        "Password field not found:",
                        targetId
                    );

                    return;

                }


                // ---------------------------------------------
                // HIDE PASSWORD
                // ---------------------------------------------

                if (
                    target.type ===
                    "password"
                ) {

                    target.type =
                        "text";


                    button.textContent =
                        "Hide";


                    button.setAttribute(
                        "aria-label",
                        "Hide password"
                    );


                    console.log(
                        "Password is now visible."
                    );

                }


                // ---------------------------------------------
                // SHOW PASSWORD
                // ---------------------------------------------

                else {

                    target.type =
                        "password";


                    button.textContent =
                        "Show";


                    button.setAttribute(
                        "aria-label",
                        "Show password"
                    );


                    console.log(
                        "Password is now hidden."
                    );

                }

            }
        );

    }
);


// =========================================================
// LOAD PREVIOUSLY ENTERED EMAIL
// =========================================================

const pendingEmail =
    localStorage.getItem(
        "teacherPendingEmail"
    );


if (
    emailInput &&
    pendingEmail &&
    !emailInput.value
) {

    emailInput.value =
        pendingEmail;

}


// =========================================================
// FINAL DEBUG
// =========================================================

console.log(
    "Teacher Login page initialized successfully."
);

console.log(
    "Password Show/Hide buttons:",
    showPasswordButtons.length
);

console.log(
    "Login button ID:",
    loginButton?.id
);