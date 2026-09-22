// ======================================================
// CONTACT FORM
// EBENEZER DAY STAR ACADEMY
// Firebase Firestore Version
// ======================================================

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import { db } from "./firebase-config.js";


const contactForm = document.getElementById("contactForm");
const submitBtn = document.getElementById("submitBtn");


if (contactForm) {

    contactForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        // --------------------------------------------
        // GET FORM VALUES
        // --------------------------------------------

        const name =
            document.getElementById("name")?.value.trim() || "";

        const email =
            document.getElementById("email")?.value.trim() || "";

        const phone =
            document.getElementById("phone")?.value.trim() || "";

        const subject =
            document.getElementById("messageSubject")?.value.trim() || "";

        const message =
            document.getElementById("message")?.value.trim() || "";


        // --------------------------------------------
        // DEBUGGING
        // --------------------------------------------

        console.log("Contact form values:", {
            name,
            email,
            phone,
            subject,
            message
        });


        // --------------------------------------------
        // VALIDATION
        // --------------------------------------------

        if (
            name === "" ||
            email === "" ||
            phone === "" ||
            subject === "" ||
            message === ""
        ) {

            Swal.fire({
                icon: "warning",
                title: "Incomplete Form",
                text: "Please fill in all required fields.",
                confirmButtonText: "OK"
            });

            return;
        }


        // --------------------------------------------
        // DISABLE BUTTON
        // --------------------------------------------

        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";


        try {

            // ----------------------------------------
            // SAVE MESSAGE TO FIRESTORE
            // ----------------------------------------

            await addDoc(
                collection(db, "messages"),
                {
                    name: name,
                    email: email,
                    phone: phone,
                    subject: subject,
                    message: message,
                    status: "unread",
                    createdAt: serverTimestamp()
                }
            );


            // ----------------------------------------
            // SUCCESS MESSAGE
            // ----------------------------------------

            await Swal.fire({
                icon: "success",
                title: "Message Sent!",
                text: "Thank you for contacting Ebenezer Day Star Academy. Your message has been sent successfully.",
                confirmButtonText: "OK"
            });


            // ----------------------------------------
            // RESET FORM
            // ----------------------------------------

            contactForm.reset();


        } catch (error) {

            console.error(
                "Error sending contact message:",
                error
            );


            Swal.fire({
                icon: "error",
                title: "Unable to Send",
                text: "Your message could not be sent. Please try again later.",
                confirmButtonText: "OK"
            });

        }


        // --------------------------------------------
        // ENABLE BUTTON AGAIN
        // --------------------------------------------

        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";

    });

}