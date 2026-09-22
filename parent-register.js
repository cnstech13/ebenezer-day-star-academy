// ============================================================
// PARENT REGISTRATION
// Ebenezer Day Star Academy
//
// Registration flow:
//
// 1. Validate parent information
// 2. Create Firebase Authentication account
// 3. Create users/{UID} parent profile
// 4. Find students using parentEmail
// 5. Link matching students using parentUid
// 6. Redirect to Parent Login
// ============================================================


import {
    createUserWithEmailAndPassword,
    updateProfile,
    deleteUser,
    signOut
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";


import {
    collection,
    query,
    where,
    getDocs,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";


import {
    auth,
    db
} from "./firebase-config.js";



// ============================================================
// ELEMENTS
// ============================================================

const form =
    document.getElementById("parentRegisterForm");


const nameInput =
    document.getElementById("name");


const emailInput =
    document.getElementById("email");


const passwordInput =
    document.getElementById("password");


const confirmPasswordInput =
    document.getElementById("confirmPassword");


const registerBtn =
    document.getElementById("registerBtn");


const errorMessage =
    document.getElementById("errorMessage");


const successMessage =
    document.getElementById("successMessage");



// ============================================================
// CHECK REQUIRED ELEMENTS
// ============================================================

if (!form) {
    console.error(
        "Parent registration error: parentRegisterForm was not found."
    );
}


if (!nameInput) {
    console.error(
        "Parent registration error: name input was not found."
    );
}


if (!emailInput) {
    console.error(
        "Parent registration error: email input was not found."
    );
}


if (!passwordInput) {
    console.error(
        "Parent registration error: password input was not found."
    );
}


if (!confirmPasswordInput) {
    console.error(
        "Parent registration error: confirmPassword input was not found."
    );
}



// ============================================================
// SHOW ERROR
// ============================================================

function showError(message) {

    if (successMessage) {

        successMessage.textContent = "";

        successMessage.style.display =
            "none";
    }


    if (errorMessage) {

        errorMessage.textContent =
            message;

        errorMessage.style.display =
            "block";

        errorMessage.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }

    console.error(
        "Parent registration message:",
        message
    );
}



// ============================================================
// SHOW SUCCESS
// ============================================================

function showSuccess(message) {

    if (errorMessage) {

        errorMessage.textContent = "";

        errorMessage.style.display =
            "none";
    }


    if (successMessage) {

        successMessage.textContent =
            message;

        successMessage.style.display =
            "block";

        successMessage.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }
}



// ============================================================
// GET FRIENDLY FIREBASE ERROR
// ============================================================

function getRegistrationError(error) {

    console.error(
        "Firebase registration error:",
        error
    );


    const code =
        error?.code || "";


    const message =
        error?.message || "";



    // ========================================================
    // FIREBASE AUTHENTICATION ERRORS
    // ========================================================

    switch (code) {


        case "auth/email-already-in-use":

            return (
                "An account already exists with this email address.\n\n" +
                "Please use the Parent Login page instead."
            );


        case "auth/invalid-email":

            return (
                "The email address you entered is not valid.\n\n" +
                "Please check the email and try again."
            );


        case "auth/weak-password":

            return (
                "Your password is too weak.\n\n" +
                "Please use at least 6 characters."
            );


        case "auth/network-request-failed":

            return (
                "Unable to connect to the school system.\n\n" +
                "Please check your internet connection and try again."
            );


        case "auth/too-many-requests":

            return (
                "Too many registration attempts have been made.\n\n" +
                "Please wait a few minutes and try again."
            );


        case "auth/operation-not-allowed":

            return (
                "Parent account registration is currently unavailable.\n\n" +
                "Please contact the school administrator."
            );


        case "auth/invalid-api-key":

            return (
                "The school portal configuration is incorrect.\n\n" +
                "Please contact the school administrator."
            );


        case "auth/app-not-authorized":

            return (
                "This website is not authorized to use the school authentication system.\n\n" +
                "Please contact the school administrator."
            );


        case "auth/user-disabled":

            return (
                "This account has been disabled.\n\n" +
                "Please contact the school administrator."
            );

    }



    // ========================================================
    // FIRESTORE PERMISSION ERRORS
    // ========================================================

    if (
        code === "permission-denied" ||
        code === "firestore/permission-denied" ||
        message.toLowerCase().includes(
            "missing or insufficient permissions"
        )
    ) {

        return (
            "The school system could not access the required student records.\n\n" +
            "Please make sure the email address you used for registration " +
            "matches the parent email registered by the school.\n\n" +
            "If the problem continues, please contact the school administrator."
        );
    }



    // ========================================================
    // UNAUTHENTICATED
    // ========================================================

    if (
        code === "unauthenticated"
    ) {

        return (
            "Your registration session could not be verified.\n\n" +
            "Please try registering again."
        );
    }



    // ========================================================
    // NOT FOUND
    // ========================================================

    if (
        code === "not-found"
    ) {

        return (
            "The required school record could not be found.\n\n" +
            "Please contact the school administrator."
        );
    }



    // ========================================================
    // ALREADY EXISTS
    // ========================================================

    if (
        code === "already-exists"
    ) {

        return (
            "This parent record already exists.\n\n" +
            "Please try logging in instead."
        );
    }



    // ========================================================
    // DEFAULT ERROR
    // ========================================================

    return (
        "We could not complete your parent registration.\n\n" +
        "Please check your information and internet connection, " +
        "then try again.\n\n" +
        "If the problem continues, please contact the school administrator."
    );
}



// ============================================================
// FIND STUDENTS USING PARENT EMAIL
// ============================================================

async function findStudentsForParent(email) {

    try {

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

    catch (error) {

        console.error(
            "Unable to find students:",
            error
        );

        throw error;
    }
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

            active:
                true,

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

    const updatePromises = [];


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
// CLEAN UP FAILED REGISTRATION
// ============================================================

async function cleanupFailedRegistration(
    createdUser
) {

    if (!createdUser) {
        return;
    }


    // --------------------------------------------------------
    // DELETE FIRESTORE PROFILE
    // --------------------------------------------------------

    try {

        await deleteDoc(
            doc(
                db,
                "users",
                createdUser.uid
            )
        );

    }

    catch (error) {

        console.warn(
            "Could not delete parent Firestore profile:",
            error
        );

    }


    // --------------------------------------------------------
    // DELETE AUTH ACCOUNT
    // --------------------------------------------------------

    try {

        await deleteUser(
            createdUser
        );

    }

    catch (error) {

        console.warn(
            "Could not delete Firebase Authentication account:",
            error
        );


        try {

            await signOut(
                auth
            );

        }

        catch (_) {}

    }

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
            // CLEAR OLD MESSAGES
            // =================================================

            if (errorMessage) {

                errorMessage.textContent =
                    "";

                errorMessage.style.display =
                    "none";

            }


            if (successMessage) {

                successMessage.textContent =
                    "";

                successMessage.style.display =
                    "none";

            }



            // =================================================
            // GET VALUES
            // =================================================

            const name =
                nameInput
                    ? nameInput.value.trim()
                    : "";


            const email =
                emailInput
                    ? emailInput.value
                        .trim()
                        .toLowerCase()
                    : "";


            const password =
                passwordInput
                    ? passwordInput.value
                    : "";


            const confirmPassword =
                confirmPasswordInput
                    ? confirmPasswordInput.value
                    : "";



            // =================================================
            // VALIDATE REQUIRED FIELDS
            // =================================================

            if (
                !name ||
                !email ||
                !password ||
                !confirmPassword
            ) {

                showError(
                    "Please complete all required fields."
                );

                return;
            }



            // =================================================
            // NAME VALIDATION
            // =================================================

            if (
                name.length < 2
            ) {

                showError(
                    "Please enter your full name."
                );

                nameInput.focus();

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



            // =================================================
            // CREATED USER
            // =================================================

            let createdUser =
                null;



            try {


                // =================================================
                // STEP 1
                // CREATE AUTH ACCOUNT
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
                // UPDATE PROFILE
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
                // CREATE PARENT PROFILE
                // =================================================

                await createParentProfile(
                    createdUser,
                    name,
                    email
                );



                // =================================================
                // STEP 4
                // FIND STUDENTS
                // =================================================

                let studentsSnapshot;


                try {

                    studentsSnapshot =
                        await findStudentsForParent(
                            email
                        );

                }

                catch (error) {

                    await cleanupFailedRegistration(
                        createdUser
                    );

                    createdUser =
                        null;

                    throw error;
                }



                // =================================================
                // STEP 5
                // CHECK STUDENTS
                // =================================================

                if (
                    studentsSnapshot.empty
                ) {

                    await cleanupFailedRegistration(
                        createdUser
                    );

                    createdUser =
                        null;


                    throw new Error(
                        "NO_STUDENT_RECORD"
                    );
                }



                // =================================================
                // STEP 6
                // LINK STUDENTS
                // =================================================

                try {

                    await linkStudentsToParent(
                        studentsSnapshot,
                        createdUser.uid
                    );

                }

                catch (error) {

                    console.error(
                        "Unable to link students:",
                        error
                    );


                    await cleanupFailedRegistration(
                        createdUser
                    );

                    createdUser =
                        null;

                    throw error;
                }



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
                // REDIRECT
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



                // =================================================
                // NO STUDENT RECORD ERROR
                // =================================================

                if (
                    error.message ===
                    "NO_STUDENT_RECORD"
                ) {

                    showError(

                        "No student record was found for this email address.\n\n" +

                        "Please make sure you are using the same email " +
                        "address that was provided to the school.\n\n" +

                        "If you believe your email is correct, please contact " +
                        "the school administrator."

                    );

                }


                else {

                    showError(
                        getRegistrationError(
                            error
                        )
                    );

                }

            }


            finally {


                // =================================================
                // RESTORE BUTTON
                // =================================================

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