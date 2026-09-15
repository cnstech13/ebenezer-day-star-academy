// ============================================================
// Ebenezer Day Star Academy
// SETTINGS
// Firebase Authentication + Firestore
// NO LOCAL STORAGE
// ============================================================


import {
    auth,
    db
} from "./firebase-config.js";


import {
    onAuthStateChanged,
    updatePassword,
    signOut
} from
    "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";


import {
    doc,
    getDoc,
    setDoc
} from
    "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";


// ============================================================
// ELEMENTS
// ============================================================

const adminEmail =
    document.getElementById("adminEmail");

const adminUser =
    document.getElementById("adminUser");


const schoolForm =
    document.getElementById("schoolSettingsForm");

const schoolName =
    document.getElementById("schoolName");

const schoolAddress =
    document.getElementById("schoolAddress");

const schoolPhone =
    document.getElementById("schoolPhone");

const schoolEmail =
    document.getElementById("schoolEmail");

const schoolMessage =
    document.getElementById("schoolMessage");


const passwordForm =
    document.getElementById("passwordForm");

const newPassword =
    document.getElementById("newPassword");

const confirmPassword =
    document.getElementById("confirmPassword");

const passwordMessage =
    document.getElementById("passwordMessage");


const themeSelect =
    document.getElementById("themeSelect");

const languageSelect =
    document.getElementById("languageSelect");

const saveDisplayBtn =
    document.getElementById("saveDisplayBtn");

const displayMessage =
    document.getElementById("displayMessage");


const notificationSelect =
    document.getElementById("notificationSelect");

const resultNotificationSelect =
    document.getElementById(
        "resultNotificationSelect"
    );

const saveNotificationBtn =
    document.getElementById(
        "saveNotificationBtn"
    );

const notificationMessage =
    document.getElementById(
        "notificationMessage"
    );


const signOutBtn =
    document.getElementById("signOutBtn");


// ============================================================
// SHOW MESSAGE
// ============================================================

function showMessage(
    element,
    message,
    type
) {

    element.textContent = message;

    element.className =
        "settings-message " + type;

}


// ============================================================
// AUTHENTICATION
// ============================================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "admin-login.html";

            return;

        }


        // Display administrator email

        adminEmail.textContent =
            user.email || "Administrator";


        adminUser.textContent =
            "Administrator";


        // Load Firestore settings

        await loadSettings();

    }
);


// ============================================================
// LOAD SETTINGS FROM FIRESTORE
// ============================================================

async function loadSettings() {

    try {

        const settingsRef =
            doc(
                db,
                "settings",
                "school"
            );


        const snapshot =
            await getDoc(settingsRef);


        if (!snapshot.exists()) {

            return;

        }


        const data =
            snapshot.data();


        // School

        if (data.schoolName) {

            schoolName.value =
                data.schoolName;

        }


        if (data.schoolAddress) {

            schoolAddress.value =
                data.schoolAddress;

        }


        if (data.schoolPhone) {

            schoolPhone.value =
                data.schoolPhone;

        }


        if (data.schoolEmail) {

            schoolEmail.value =
                data.schoolEmail;

        }


        // Display

        if (data.theme) {

            themeSelect.value =
                data.theme;

        }


        if (data.language) {

            languageSelect.value =
                data.language;

        }


        // Notifications

        if (data.notifications) {

            notificationSelect.value =
                data.notifications;

        }


        if (data.resultNotifications) {

            resultNotificationSelect.value =
                data.resultNotifications;

        }

    }

    catch (error) {

        console.error(
            "Error loading settings:",
            error
        );

    }

}


// ============================================================
// SAVE SCHOOL SETTINGS
// ============================================================

schoolForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        try {

            await setDoc(

                doc(
                    db,
                    "settings",
                    "school"
                ),

                {

                    schoolName:
                        schoolName.value.trim(),

                    schoolAddress:
                        schoolAddress.value.trim(),

                    schoolPhone:
                        schoolPhone.value.trim(),

                    schoolEmail:
                        schoolEmail.value.trim()

                },

                {
                    merge: true
                }

            );


            showMessage(
                schoolMessage,
                "School settings saved successfully.",
                "success"
            );

        }

        catch (error) {

            console.error(error);


            showMessage(
                schoolMessage,
                "Failed to save school settings.",
                "error"
            );

        }

    }
);


// ============================================================
// CHANGE PASSWORD
// ============================================================

passwordForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const password =
            newPassword.value.trim();

        const confirm =
            confirmPassword.value.trim();


        if (password.length < 6) {

            showMessage(
                passwordMessage,
                "Password must contain at least 6 characters.",
                "error"
            );

            return;

        }


        if (password !== confirm) {

            showMessage(
                passwordMessage,
                "Passwords do not match.",
                "error"
            );

            return;

        }


        const user =
            auth.currentUser;


        if (!user) {

            return;

        }


        try {

            await updatePassword(
                user,
                password
            );


            newPassword.value = "";

            confirmPassword.value = "";


            showMessage(
                passwordMessage,
                "Password changed successfully.",
                "success"
            );

        }

        catch (error) {

            console.error(error);


            if (
                error.code ===
                "auth/requires-recent-login"
            ) {

                showMessage(
                    passwordMessage,
                    "For security, please sign in again before changing your password.",
                    "error"
                );

            }

            else {

                showMessage(
                    passwordMessage,
                    error.message,
                    "error"
                );

            }

        }

    }
);


// ============================================================
// SAVE DISPLAY SETTINGS
// ============================================================

saveDisplayBtn.addEventListener(
    "click",
    async () => {

        try {

            await setDoc(

                doc(
                    db,
                    "settings",
                    "school"
                ),

                {

                    theme:
                        themeSelect.value,

                    language:
                        languageSelect.value

                },

                {
                    merge: true
                }

            );


            showMessage(
                displayMessage,
                "Display settings saved successfully.",
                "success"
            );

        }

        catch (error) {

            console.error(error);


            showMessage(
                displayMessage,
                "Failed to save display settings.",
                "error"
            );

        }

    }
);


// ============================================================
// SAVE NOTIFICATION SETTINGS
// ============================================================

saveNotificationBtn.addEventListener(
    "click",
    async () => {

        try {

            await setDoc(

                doc(
                    db,
                    "settings",
                    "school"
                ),

                {

                    notifications:
                        notificationSelect.value,

                    resultNotifications:
                        resultNotificationSelect.value

                },

                {
                    merge: true
                }

            );


            showMessage(
                notificationMessage,
                "Notification settings saved successfully.",
                "success"
            );

        }

        catch (error) {

            console.error(error);


            showMessage(
                notificationMessage,
                "Failed to save notification settings.",
                "error"
            );

        }

    }
);


// ============================================================
// SIGN OUT
// ============================================================

signOutBtn.addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);


            window.location.href =
                "admin-login.html";

        }

        catch (error) {

            console.error(
                "Sign out error:",
                error
            );

        }

    }
);