// ============================================================
// PARENT REGISTRATION
// Ebenezer Day Star Academy
// Firebase Authentication + Firestore
//
// Registration flow:
//
// 1. Validate parent information
// 2. Create Firebase Authentication account
// 3. Parent becomes authenticated
// 4. Search students using parentEmail
// 5. Create users/{Firebase UID}
// 6. Link matching students using parentUid
// 7. Redirect to parent login
// ============================================================


import {

    createUserWithEmailAndPassword,

    updateProfile,

    signOut

}
from
"https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";


import {

    collection,

    query,

    where,

    getDocs,

    doc,

    setDoc,

    updateDoc,

    serverTimestamp

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
        "parentRegisterForm"
    );


const nameInput =
    document.getElementById(
        "name"
    );


const emailInput =
    document.getElementById(
        "email"
    );


const passwordInput =
    document.getElementById(
        "password"
    );


const confirmPasswordInput =
    document.getElementById(
        "confirmPassword"
    );


const registerBtn =
    document.getElementById(
        "registerBtn"
    );


const errorMessage =
    document.getElementById(
        "errorMessage"
    );


const successMessage =
    document.getElementById(
        "successMessage"
    );



// ============================================================
// CHECK REQUIRED ELEMENTS
// ============================================================

if (!form) {

    console.error(
        "parentRegisterForm was not found."
    );

}


if (!nameInput) {

    console.error(
        "name input was not found."
    );

}


if (!emailInput) {

    console.error(
        "email input was not found."
    );

}


if (!passwordInput) {

    console.error(
        "password input was not found."
    );

}


if (!confirmPasswordInput) {

    console.error(
        "confirmPassword input was not found."
    );

}



// ============================================================
// SHOW ERROR
// ============================================================

function showError(message) {

    if (errorMessage) {

        errorMessage.textContent =
            message;

        errorMessage.style.display =
            "block";

    }


    if (successMessage) {

        successMessage.style.display =
            "none";

    }

}



// ============================================================
// SHOW SUCCESS
// ============================================================

function showSuccess(message) {

    if (successMessage) {

        successMessage.textContent =
            message;

        successMessage.style.display =
            "block";

    }


    if (errorMessage) {

        errorMessage.style.display =
            "none";

    }

}



// ============================================================
// FIREBASE ERROR MESSAGE
// ============================================================

function getRegistrationError(error) {

    console.error(
        "Firebase registration error:",
        error
    );


    switch (error.code) {


        // ----------------------------------------------------
        // EMAIL ALREADY EXISTS
        // ----------------------------------------------------

        case "auth/email-already-in-use":

            return (
                "An account already exists with this email.\n\n" +
                "Please use the Parent Login page instead."
            );


        // ----------------------------------------------------
        // INVALID EMAIL
        // ----------------------------------------------------

        case "auth/invalid-email":

            return (
                "Please enter a valid email address."
            );


        // ----------------------------------------------------
        // WEAK PASSWORD
        // ----------------------------------------------------

        case "auth/weak-password":

            return (
                "Your password is too weak.\n\n" +
                "Please use at least 6 characters."
            );


        // ----------------------------------------------------
        // NETWORK
        // ----------------------------------------------------

        case "auth/network-request-failed":

            return (
                "Network error.\n\n" +
                "Please check your internet connection."
            );


        // ----------------------------------------------------
        // FIRESTORE PERMISSION
        // ----------------------------------------------------

        case "permission-denied":

            return (
                "Firestore permission denied.\n\n" +
                "Please check your Firestore security rules."
            );


        // ----------------------------------------------------
        // FIRESTORE UNAUTHENTICATED
        // ----------------------------------------------------

        case "unauthenticated":

            return (
                "Authentication is required to complete registration."
            );


        // ----------------------------------------------------
        // DEFAULT
        // ----------------------------------------------------

        default:

            return (
                error.message ||
                "Unable to create parent account."
            );

    }

}



// ============================================================
// FIND STUDENTS USING PARENT EMAIL
// ============================================================
//
// IMPORTANT:
//
// This function is called AFTER Firebase Authentication
// has successfully created the parent account.
//
// Therefore request.auth is no longer null.
//
// It searches:
//
// students
//    └── student document
//          parentEmail: "parent@gmail.com"
//
// ============================================================

async function findStudentsForParent(
    email
) {

    const studentsCollection =
        collection(
            db,
            "students"
        );


    const parentQuery =
        query(
            studentsCollection,

            where(
                "parentEmail",
                "==",
                email
            )
        );


    const snapshot =
        await getDocs(
            parentQuery
        );


    return snapshot;

}



// ============================================================
// CREATE PARENT FIRESTORE PROFILE
// ============================================================

async function createParentProfile(
    user,
    name,
    email
) {

    const userRef =
        doc(
            db,
            "users",
            user.uid
        );


    await setDoc(
        userRef,
        {

            uid:
                user.uid,

            name:
                name,

            email:
                email,

            role:
                "parent",

            createdAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()

        }
    );

}



// ============================================================
// LINK STUDENTS TO PARENT
// ============================================================

async function linkStudentsToParent(
    studentsSnapshot,
    parentUid
) {

    const updatePromises =
        [];


    studentsSnapshot.forEach(
        studentDocument => {

            const studentRef =
                doc(
                    db,
                    "students",
                    studentDocument.id
                );


            updatePromises.push(

                updateDoc(
                    studentRef,
                    {

                        parentUid:
                            parentUid,

                        updatedAt:
                            serverTimestamp()

                    }
                )

            );

        }
    );


    await Promise.all(
        updatePromises
    );

}



// ============================================================
// REGISTRATION
// ============================================================

if (form) {

    form.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();



            // =================================================
            // GET VALUES
            // =================================================

            const name =
                nameInput.value
                    .trim();


            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();


            const password =
                passwordInput.value;


            const confirmPassword =
                confirmPasswordInput.value;



            // =================================================
            // VALIDATION
            // =================================================

            if (
                !name ||
                !email ||
                !password ||
                !confirmPassword
            ) {

                showError(
                    "Please complete all fields."
                );

                return;

            }



            // =================================================
            // EMAIL VALIDATION
            // =================================================

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(
                    email
                )
            ) {

                showError(
                    "Please enter a valid email address."
                );

                emailInput.focus();

                return;

            }



            // =================================================
            // PASSWORD LENGTH
            // =================================================

            if (
                password.length < 6
            ) {

                showError(
                    "Password must contain at least 6 characters."
                );

                passwordInput.focus();

                return;

            }



            // =================================================
            // PASSWORD MATCH
            // =================================================

            if (
                password !==
                confirmPassword
            ) {

                showError(
                    "Passwords do not match."
                );

                confirmPasswordInput.focus();

                return;

            }



            // =================================================
            // BUTTON STATE
            // =================================================

            if (registerBtn) {

                registerBtn.disabled =
                    true;

                registerBtn.textContent =
                    "Creating Account...";

            }



            let createdUser = null;


            try {


                // =================================================
                // STEP 1
                // CREATE FIREBASE AUTH ACCOUNT
                // =================================================
                //
                // This MUST happen before accessing Firestore.
                //
                // After this succeeds:
                //
                // request.auth != null
                //
                // =================================================

                const credential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                createdUser =
                    credential.user;



                // =================================================
                // STEP 2
                // UPDATE AUTH PROFILE
                // =================================================

                await updateProfile(
                    createdUser,
                    {

                        displayName:
                            name

                    }
                );



                // =================================================
                // STEP 3
                // FIND STUDENTS
                // =================================================
                //
                // The parent is now authenticated.
                //
                // Therefore Firestore rules:
                //
                // allow read, write:
                // if request.auth != null;
                //
                // will allow this request.
                //
                // =================================================

                const studentsSnapshot =
                    await findStudentsForParent(
                        email
                    );



                // =================================================
                // STEP 4
                // CHECK WHETHER PARENT EMAIL EXISTS
                // =================================================

                if (
                    studentsSnapshot.empty
                ) {


                    // ---------------------------------------------
                    // IMPORTANT
                    // ---------------------------------------------
                    // The Auth account has already been created.
                    //
                    // Since no student was found, we sign the user
                    // out rather than leaving them logged in.
                    //
                    // We cannot delete the Auth account from the
                    // client using normal Firebase Authentication
                    // unless recent authentication/re-authentication
                    // requirements are satisfied.
                    //
                    // ---------------------------------------------

                    await signOut(
                        auth
                    );


                    throw new Error(

                        "No student record was found using this email.\n\n" +

                        "Please make sure you are using the same " +
                        "email address that was provided to the school."

                    );

                }



                // =================================================
                // STEP 5
                // CREATE FIRESTORE PARENT PROFILE
                // =================================================

                await createParentProfile(
                    createdUser,
                    name,
                    email
                );



                // =================================================
                // STEP 6
                // LINK ALL STUDENTS
                // =================================================

                await linkStudentsToParent(
                    studentsSnapshot,
                    createdUser.uid
                );



                // =================================================
                // STEP 7
                // SUCCESS
                // =================================================

                const childCount =
                    studentsSnapshot.size;


                const childText =
                    childCount === 1
                        ? "student has"
                        : "students have";


                showSuccess(

                    "Parent account created successfully!\n\n" +

                    `${childCount} ${childText} been linked to your account.\n\n` +

                    "Redirecting to Parent Login..."

                );



                // =================================================
                // STEP 8
                // SIGN OUT
                // =================================================

                await signOut(
                    auth
                );



                // =================================================
                // STEP 9
                // REDIRECT TO LOGIN
                // =================================================

                setTimeout(
                    function() {

                        window.location.href =
                            "parent-login.html";

                    },
                    1800
                );


            }

            catch(error) {


                console.error(
                    "Parent registration failed:",
                    error
                );


                showError(
                    getRegistrationError(
                        error
                    )
                );


            }

            finally {

                if (registerBtn) {

                    registerBtn.disabled =
                        false;

                    registerBtn.textContent =
                        "Create Parent Account";

                }

            }

        }
    );

}