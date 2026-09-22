/* =========================================================
   PUBLIC CONTACT MESSAGE
   EBENEZER DAY STAR ACADEMY

   Messages submitted from contact.html are saved directly
   into the Firestore "messages" collection.
========================================================= */

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import {
    db
} from "./firebase-config.js";

import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm";


/* =========================================================
   GET FORM
========================================================= */

const form =
    document.getElementById("schoolMessageForm");


/* =========================================================
   GET BUTTON ELEMENTS
========================================================= */

const sendButton =
    document.getElementById("sendMessageBtn");

const sendText =
    document.getElementById("sendMessageText");

const sendLoading =
    document.getElementById("sendMessageLoading");


/* =========================================================
   CHECK THAT FORM EXISTS
========================================================= */

if (!form) {

    console.error(
        "School message form was not found."
    );

} else {


    /* =====================================================
       FORM SUBMISSION
    ===================================================== */

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* =============================================
               GET FORM VALUES
            ============================================= */

            const name =
                document
                    .getElementById("visitorName")
                    .value
                    .trim();

            const email =
                document
                    .getElementById("visitorEmail")
                    .value
                    .trim()
                    .toLowerCase();

            const phone =
                document
                    .getElementById("visitorPhone")
                    .value
                    .trim();

            const subject =
                document
                    .getElementById("messageSubject")
                    .value
                    .trim();

            const message =
                document
                    .getElementById("visitorMessage")
                    .value
                    .trim();


            /* =============================================
               VALIDATION
            ============================================= */

            if (!name) {

                Swal.fire({
                    icon: "warning",
                    title: "Name Required",
                    text: "Please enter your full name."
                });

                return;
            }


            if (!email) {

                Swal.fire({
                    icon: "warning",
                    title: "Email Required",
                    text: "Please enter your email address."
                });

                return;
            }


            if (!subject) {

                Swal.fire({
                    icon: "warning",
                    title: "Subject Required",
                    text: "Please enter a subject."
                });

                return;
            }


            if (!message) {

                Swal.fire({
                    icon: "warning",
                    title: "Message Required",
                    text: "Please write your message."
                });

                return;
            }


            /* =============================================
               LOADING STATE
            ============================================= */

            if (sendButton) {
                sendButton.disabled = true;
            }

            if (sendText) {
                sendText.style.display = "none";
            }

            if (sendLoading) {
                sendLoading.style.display = "inline";
            }


            try {


                /* =========================================
                   SAVE MESSAGE TO FIRESTORE
                ========================================= */

                await addDoc(
                    collection(db, "messages"),
                    {

                        name: name,

                        email: email,

                        phone: phone,

                        subject: subject,

                        message: message,

                        status: "unread",

                        reply: "",

                        createdAt:
                            serverTimestamp(),

                        updatedAt:
                            serverTimestamp()

                    }
                );


                /* =========================================
                   CLEAR FORM
                ========================================= */

                form.reset();


                /* =========================================
                   SUCCESS MESSAGE
                ========================================= */

                await Swal.fire({

                    icon: "success",

                    title: "Message Sent Successfully!",

                    text:
                        "Thank you for contacting Ebenezer Day Star Academy. Your message has been received by the school.",

                    confirmButtonText:
                        "OK",

                    confirmButtonColor:
                        "#0b1f3a"

                });


            } catch (error) {


                console.error(
                    "Error sending school message:",
                    error
                );


                /* =========================================
                   ERROR MESSAGE
                ========================================= */

                await Swal.fire({

                    icon: "error",

                    title: "Message Not Sent",

                    text:
                        "We could not send your message. Please check your internet connection and try again.",

                    confirmButtonText:
                        "Try Again",

                    confirmButtonColor:
                        "#0b1f3a"

                });


            } finally {


                /* =========================================
                   RESTORE BUTTON
                ========================================= */

                if (sendButton) {
                    sendButton.disabled = false;
                }

                if (sendText) {
                    sendText.style.display = "inline";
                }

                if (sendLoading) {
                    sendLoading.style.display = "none";
                }

            }

        }
    );

}