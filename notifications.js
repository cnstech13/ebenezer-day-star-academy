/* =========================================================
   EBENEZER DAY STAR ACADEMY
   NOTIFICATIONS.JS
   FIRESTORE VERSION
========================================================= */


/* =========================================================
   ADMIN SECURITY
========================================================= */

import {
    adminReady,
    withTimeout
} from "./admin-guard.js";


/* =========================================================
   FIREBASE FIRESTORE
========================================================= */

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";


import {
    db
} from "./firebase-config.js";


/* =========================================================
   WAIT FOR ADMIN AUTHENTICATION
========================================================= */

await adminReady;


/* =========================================================
   HTML ELEMENTS
========================================================= */

const form =
    document.getElementById("form");


const msg =
    document.getElementById("msg");


const titleInput =
    document.getElementById("title");


const messageInput =
    document.getElementById("message");


const classIdInput =
    document.getElementById("classId");


/* =========================================================
   CHECK FORM
========================================================= */

if (!form) {

    console.error(
        "Notification form was not found."
    );

}


/* =========================================================
   SUBMIT NOTIFICATION
========================================================= */

if (form) {

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* -----------------------------------------
               GET AUDIENCE
            ----------------------------------------- */

            const audience =
                [
                    ...form.querySelectorAll(
                        'input[type="checkbox"]:checked'
                    )
                ].map(
                    checkbox =>
                        checkbox.value
                );


            /* -----------------------------------------
               VALIDATE AUDIENCE
            ----------------------------------------- */

            if (
                audience.length === 0
            ) {

                showMessage(
                    "Please select at least one audience."
                );

                return;

            }


            /* -----------------------------------------
               GET TITLE
            ----------------------------------------- */

            const title =
                titleInput
                    ?.value
                    .trim();


            /* -----------------------------------------
               GET MESSAGE
            ----------------------------------------- */

            const message =
                messageInput
                    ?.value
                    .trim();


            /* -----------------------------------------
               GET CLASS ID
            ----------------------------------------- */

            const classId =
                classIdInput
                    ?.value
                    .trim() ||
                null;


            /* -----------------------------------------
               VALIDATE TITLE
            ----------------------------------------- */

            if (!title) {

                showMessage(
                    "Please enter a notification title."
                );

                titleInput?.focus();

                return;

            }


            /* -----------------------------------------
               VALIDATE MESSAGE
            ----------------------------------------- */

            if (!message) {

                showMessage(
                    "Please enter the notification message."
                );

                messageInput?.focus();

                return;

            }


            /* -----------------------------------------
               LOADING
            ----------------------------------------- */

            const submitButton =
                form.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Publishing...";

            }


            showMessage("");


            /* -----------------------------------------
               SAVE TO FIRESTORE
            ----------------------------------------- */

            try {

                await withTimeout(

                    addDoc(
                        collection(
                            db,
                            "notifications"
                        ),

                        {

                            title:
                                title,

                            message:
                                message,

                            audience:
                                audience,

                            classId:
                                classId,

                            createdAt:
                                serverTimestamp(),

                            active:
                                true

                        }
                    )

                );


                /* -----------------------------------------
                   SUCCESS
                ----------------------------------------- */

                showMessage(
                    "Notification published successfully."
                );


                /*
                 * Clear the form.
                 */

                form.reset();


            }

            catch (error) {

                console.error(
                    "Notification error:",
                    error
                );


                showMessage(
                    getErrorMessage(
                        error
                    )
                );

            }

            finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Publish Notification";

                }

            }

        }
    );

}


/* =========================================================
   DISPLAY MESSAGE
========================================================= */

function showMessage(message) {

    if (!msg) {
        return;
    }


    msg.textContent =
        message;

}


/* =========================================================
   FIREBASE ERROR MESSAGE
========================================================= */

function getErrorMessage(error) {

    if (!error) {

        return "Something went wrong.";

    }


    if (
        error.code ===
        "permission-denied"
    ) {

        return (
            "Permission denied. " +
            "Check your Firestore security rules."
        );

    }


    if (
        error.code ===
        "unavailable"
    ) {

        return (
            "Firebase is temporarily unavailable. " +
            "Please try again."
        );

    }


    return (
        error.message ||
        "Unable to publish notification."
    );

}


/* =========================================================
   INITIALIZED
========================================================= */

console.log(
    "Notifications system initialized successfully."
);