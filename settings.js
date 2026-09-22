/* =========================================================
   EBENEZER DAY STAR ACADEMY
   ADMIN SETTINGS
========================================================= */

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    updatePassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";


/* =========================================================
   ADMIN CONFIGURATION
========================================================= */

const ADMIN_EMAIL = "cnstech0013@gmail.com";

const SETTINGS_REF = doc(db, "settings", "school");


/* =========================================================
   GET ELEMENTS
========================================================= */

const schoolForm = document.getElementById("schoolSettingsForm");

const schoolName = document.getElementById("schoolName");
const schoolAddress = document.getElementById("schoolAddress");
const schoolPhone = document.getElementById("schoolPhone");
const schoolEmail = document.getElementById("schoolEmail");

const schoolMessage = document.getElementById("schoolMessage");


const passwordForm = document.getElementById("passwordForm");

const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");

const passwordMessage = document.getElementById("passwordMessage");


const themeSelect = document.getElementById("themeSelect");
const languageSelect = document.getElementById("languageSelect");

const saveDisplayBtn = document.getElementById("saveDisplayBtn");
const displayMessage = document.getElementById("displayMessage");


const notificationSelect =
    document.getElementById("notificationSelect");

const resultNotificationSelect =
    document.getElementById("resultNotificationSelect");

const saveNotificationBtn =
    document.getElementById("saveNotificationBtn");

const notificationMessage =
    document.getElementById("notificationMessage");


const signOutBtn = document.getElementById("signOutBtn");

const adminEmailDisplay =
    document.getElementById("adminEmail");


/* =========================================================
   SWEETALERT HELPER
========================================================= */

function showSuccess(title, text = "") {

    if (typeof Swal !== "undefined") {

        Swal.fire({
            icon: "success",
            title,
            text,
            confirmButtonColor: "#d4af37"
        });

    }
}


function showError(title, text = "") {

    if (typeof Swal !== "undefined") {

        Swal.fire({
            icon: "error",
            title,
            text,
            confirmButtonColor: "#0b1f3a"
        });

    }
}


/* =========================================================
   DISPLAY MESSAGE HELPER
========================================================= */

function showMessage(element, message, type = "success") {

    if (!element) return;

    element.textContent = message;

    element.style.display = "block";

    if (type === "error") {
        element.style.color = "#b91c1c";
    } else {
        element.style.color = "#15803d";
    }

}


/* =========================================================
   AUTHENTICATION
========================================================= */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "admin-login.html";

        return;
    }


    const email = (user.email || "").toLowerCase();


    /* ---------------------------------------------
       CHECK ADMIN EMAIL
    --------------------------------------------- */

    if (email !== ADMIN_EMAIL.toLowerCase()) {

        showError(
            "Access Denied",
            "Only the school administrator can access Settings."
        );

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1500);

        return;
    }


    /* ---------------------------------------------
       SHOW ADMIN EMAIL
    --------------------------------------------- */

    if (adminEmailDisplay) {
        adminEmailDisplay.textContent = user.email;
    }


    /* ---------------------------------------------
       LOAD SETTINGS
    --------------------------------------------- */

    await loadSettings();

});


/* =========================================================
   LOAD SETTINGS
========================================================= */

async function loadSettings() {

    try {

        const snapshot = await getDoc(SETTINGS_REF);


        if (!snapshot.exists()) {

            /*
             * No settings document yet.
             * Use default values.
             */

            setDefaultSettings();

            return;
        }


        const data = snapshot.data();


        /* SCHOOL INFORMATION */

        if (schoolName) {
            schoolName.value = data.schoolName || "";
        }

        if (schoolAddress) {
            schoolAddress.value = data.schoolAddress || "";
        }

        if (schoolPhone) {
            schoolPhone.value = data.schoolPhone || "";
        }

        if (schoolEmail) {
            schoolEmail.value = data.schoolEmail || "";
        }


        /* DISPLAY */

        if (themeSelect) {
            themeSelect.value = data.theme || "light";
        }

        if (languageSelect) {
            languageSelect.value = data.language || "English";
        }


        /* NOTIFICATIONS */

        if (notificationSelect) {
            notificationSelect.value =
                data.notifications || "enabled";
        }

        if (resultNotificationSelect) {
            resultNotificationSelect.value =
                data.resultNotifications || "enabled";
        }


        /* APPLY THEME */

        applyTheme(data.theme || "light");

    } catch (error) {

        console.error("LOAD SETTINGS ERROR:", error);

        showError(
            "Unable to load settings",
            getFirebaseError(error)
        );

    }

}


/* =========================================================
   DEFAULT SETTINGS
========================================================= */

function setDefaultSettings() {

    if (themeSelect) {
        themeSelect.value = "light";
    }

    if (languageSelect) {
        languageSelect.value = "English";
    }

    if (notificationSelect) {
        notificationSelect.value = "enabled";
    }

    if (resultNotificationSelect) {
        resultNotificationSelect.value = "enabled";
    }

}


/* =========================================================
   SAVE SCHOOL SETTINGS
========================================================= */

if (schoolForm) {

    schoolForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const user = auth.currentUser;


        if (!user) {

            showError(
                "Not signed in",
                "Please log in as administrator again."
            );

            return;
        }


        if (
            (user.email || "").toLowerCase()
            !== ADMIN_EMAIL.toLowerCase()
        ) {

            showError(
                "Access denied",
                "Administrator access is required."
            );

            return;
        }


        const name = schoolName?.value.trim() || "";
        const address = schoolAddress?.value.trim() || "";
        const phone = schoolPhone?.value.trim() || "";
        const email = schoolEmail?.value.trim() || "";


        if (!name) {

            showError(
                "School name required",
                "Please enter the school name."
            );

            return;
        }


        if (schoolMessage) {
            schoolMessage.textContent = "Saving...";
            schoolMessage.style.color = "#b8860b";
            schoolMessage.style.display = "block";
        }


        const submitButton =
            schoolForm.querySelector(
                'button[type="submit"]'
            );


        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Saving...";
        }


        try {

            await setDoc(
                SETTINGS_REF,
                {
                    schoolName: name,
                    schoolAddress: address,
                    schoolPhone: phone,
                    schoolEmail: email,

                    updatedAt: serverTimestamp(),
                    updatedBy: user.uid
                },
                {
                    merge: true
                }
            );


            showMessage(
                schoolMessage,
                "School settings saved successfully."
            );


            showSuccess(
                "Settings Saved",
                "School information has been updated successfully."
            );


        } catch (error) {

            console.error(
                "SAVE SCHOOL SETTINGS ERROR:",
                error
            );


            showMessage(
                schoolMessage,
                getFirebaseError(error),
                "error"
            );


            showError(
                "Unable to save settings",
                getFirebaseError(error)
            );


        } finally {

            if (submitButton) {

                submitButton.disabled = false;
                submitButton.textContent = "Save Changes";

            }

        }

    });

}


/* =========================================================
   SAVE DISPLAY SETTINGS
========================================================= */

if (saveDisplayBtn) {

    saveDisplayBtn.addEventListener("click", async () => {

        const user = auth.currentUser;


        if (!user) {

            showError(
                "Not signed in",
                "Please log in again."
            );

            return;
        }


        const theme =
            themeSelect?.value || "light";

        const language =
            languageSelect?.value || "English";


        saveDisplayBtn.disabled = true;

        saveDisplayBtn.textContent = "Saving...";


        try {

            await setDoc(
                SETTINGS_REF,
                {
                    theme,
                    language,

                    updatedAt: serverTimestamp(),
                    updatedBy: user.uid
                },
                {
                    merge: true
                }
            );


            applyTheme(theme);


            showMessage(
                displayMessage,
                "Display settings saved successfully."
            );


            showSuccess(
                "Display Settings Saved"
            );


        } catch (error) {

            console.error(
                "SAVE DISPLAY ERROR:",
                error
            );


            showMessage(
                displayMessage,
                getFirebaseError(error),
                "error"
            );


            showError(
                "Unable to save display settings",
                getFirebaseError(error)
            );


        } finally {

            saveDisplayBtn.disabled = false;

            saveDisplayBtn.textContent =
                "Save Display Settings";

        }

    });

}


/* =========================================================
   SAVE NOTIFICATION SETTINGS
========================================================= */

if (saveNotificationBtn) {

    saveNotificationBtn.addEventListener("click", async () => {

        const user = auth.currentUser;


        if (!user) {

            showError(
                "Not signed in",
                "Please log in again."
            );

            return;
        }


        const notifications =
            notificationSelect?.value || "enabled";

        const resultNotifications =
            resultNotificationSelect?.value || "enabled";


        saveNotificationBtn.disabled = true;

        saveNotificationBtn.textContent = "Saving...";


        try {

            await setDoc(
                SETTINGS_REF,
                {
                    notifications,
                    resultNotifications,

                    updatedAt: serverTimestamp(),
                    updatedBy: user.uid
                },
                {
                    merge: true
                }
            );


            showMessage(
                notificationMessage,
                "Notification settings saved successfully."
            );


            showSuccess(
                "Notification Settings Saved"
            );


        } catch (error) {

            console.error(
                "SAVE NOTIFICATION ERROR:",
                error
            );


            showMessage(
                notificationMessage,
                getFirebaseError(error),
                "error"
            );


            showError(
                "Unable to save notification settings",
                getFirebaseError(error)
            );


        } finally {

            saveNotificationBtn.disabled = false;

            saveNotificationBtn.textContent =
                "Save Notification Settings";

        }

    });

}


/* =========================================================
   APPLY THEME
========================================================= */

function applyTheme(theme) {

    if (!theme) return;


    document.documentElement.setAttribute(
        "data-theme",
        theme
    );


    if (theme === "dark") {

        document.body.classList.add("dark-mode");

    } else {

        document.body.classList.remove("dark-mode");

    }

}


/* =========================================================
   CHANGE PASSWORD
========================================================= */

if (passwordForm) {

    passwordForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const user = auth.currentUser;


        if (!user) {

            showError(
                "Not signed in",
                "Please log in again."
            );

            return;
        }


        const password =
            newPassword?.value || "";

        const confirm =
            confirmPassword?.value || "";


        if (password.length < 6) {

            showError(
                "Password too short",
                "Your new password must contain at least 6 characters."
            );

            return;
        }


        if (password !== confirm) {

            showError(
                "Passwords do not match",
                "Please enter the same password in both fields."
            );

            return;
        }


        try {

            await updatePassword(
                user,
                password
            );


            if (passwordMessage) {

                passwordMessage.textContent =
                    "Password changed successfully.";

                passwordMessage.style.color =
                    "#15803d";

                passwordMessage.style.display =
                    "block";

            }


            passwordForm.reset();


            showSuccess(
                "Password Changed",
                "Your administrator password has been updated."
            );


        } catch (error) {

            console.error(
                "PASSWORD UPDATE ERROR:",
                error
            );


            showError(
                "Unable to change password",
                getFirebaseError(error)
            );

        }

    });

}


/* =========================================================
   SIGN OUT
========================================================= */

if (signOutBtn) {

    signOutBtn.addEventListener("click", async () => {

        const result = await Swal.fire({

            icon: "question",

            title: "Sign out?",

            text: "Are you sure you want to sign out?",

            showCancelButton: true,

            confirmButtonText: "Yes, sign out",

            cancelButtonText: "Cancel",

            confirmButtonColor: "#0b1f3a"

        });


        if (!result.isConfirmed) {
            return;
        }


        try {

            await signOut(auth);

            window.location.href =
                "admin-login.html";

        } catch (error) {

            console.error(
                "SIGN OUT ERROR:",
                error
            );

            showError(
                "Unable to sign out",
                getFirebaseError(error)
            );

        }

    });

}


/* =========================================================
   FIREBASE ERROR MESSAGE
========================================================= */

function getFirebaseError(error) {

    if (!error) {
        return "An unknown error occurred.";
    }


    console.error(error);


    switch (error.code) {

        case "permission-denied":

            return "Permission denied. Make sure you are signed in as the administrator and that the Firestore settings rule is published.";

        case "auth/requires-recent-login":

            return "For security, please sign out and sign in again before changing your password.";

        case "auth/weak-password":

            return "The password is too weak. Use at least 6 characters.";

        case "auth/network-request-failed":

            return "Network error. Check your internet connection and try again.";

        default:

            return error.message ||
                "Something went wrong. Please try again.";

    }

}