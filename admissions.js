/* =========================================================
   EBENEZER DAY STAR ACADEMY
   PUBLIC ADMISSION APPLICATION
   Saves applications to Firestore Messages
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
   GET FORM ELEMENTS
========================================================= */

const admissionForm = document.getElementById("admissionForm");

const submitButton =
    document.getElementById("admissionSubmitBtn");

const buttonText =
    document.getElementById("admissionButtonText");

const spinner =
    document.getElementById("admissionSpinner");

const formMessage =
    document.getElementById("admissionFormMessage");


/* =========================================================
   CHECK FORM
========================================================= */

if (!admissionForm) {

    console.error(
        "Admission form was not found."
    );

} else {

    console.log(
        "Admission form JavaScript is working."
    );


    /* =====================================================
       SUBMIT APPLICATION
    ===================================================== */

    admissionForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            console.log(
                "Admission form submitted."
            );


            /* =================================================
               GET VALUES
            ================================================= */

            const firstName =
                document
                    .getElementById("studentFirstName")
                    .value
                    .trim();

            const lastName =
                document
                    .getElementById("studentLastName")
                    .value
                    .trim();

            const dob =
                document
                    .getElementById("studentDob")
                    .value
                    .trim();

            const gender =
                document
                    .getElementById("studentGender")
                    .value
                    .trim();

            const classApplying =
                document
                    .getElementById("classApplying")
                    .value
                    .trim();

            const previousSchool =
                document
                    .getElementById("previousSchool")
                    .value
                    .trim();

            const parentName =
                document
                    .getElementById("parentName")
                    .value
                    .trim();

            const parentPhone =
                document
                    .getElementById("parentPhone")
                    .value
                    .trim();

            const parentEmail =
                document
                    .getElementById("parentEmail")
                    .value
                    .trim()
                    .toLowerCase();

            const relationship =
                document
                    .getElementById("relationship")
                    .value
                    .trim();

            const address =
                document
                    .getElementById("address")
                    .value
                    .trim();


            /* =================================================
               VALIDATION
            ================================================= */

            if (!firstName) {

                showError(
                    "Please enter the student's first name."
                );

                return;
            }


            if (!lastName) {

                showError(
                    "Please enter the student's last name."
                );

                return;
            }


            if (!dob) {

                showError(
                    "Please enter the student's date of birth."
                );

                return;
            }


            if (!gender) {

                showError(
                    "Please select the student's gender."
                );

                return;
            }


            if (!classApplying) {

                showError(
                    "Please select the class the student is applying for."
                );

                return;
            }


            if (!parentName) {

                showError(
                    "Please enter the parent or guardian's name."
                );

                return;
            }


            if (!parentPhone) {

                showError(
                    "Please enter the parent or guardian's phone number."
                );

                return;
            }


            if (!parentEmail) {

                showError(
                    "Please enter the parent or guardian's email address."
                );

                return;
            }


            if (!relationship) {

                showError(
                    "Please select the parent/guardian relationship."
                );

                return;
            }


            if (!address) {

                showError(
                    "Please enter the residential address."
                );

                return;
            }


            /* =================================================
               LOADING STATE
            ================================================= */

            submitButton.disabled = true;

            buttonText.textContent =
                "Submitting...";

            if (spinner) {
                spinner.style.display = "inline-block";
            }

            if (formMessage) {
                formMessage.textContent = "";
            }


            /* =================================================
               SAVE TO FIRESTORE
            ================================================= */

            try {

                const applicationData = {

                    /* -----------------------------------------
                       MESSAGE IDENTIFICATION
                    ----------------------------------------- */

                    messageType:
                        "admission",

                    category:
                        "Admission Application",

                    subject:
                        `New Admission Application - ${firstName} ${lastName}`,

                    status:
                        "unread",


                    /* -----------------------------------------
                       STUDENT INFORMATION
                    ----------------------------------------- */

                    studentFirstName:
                        firstName,

                    studentLastName:
                        lastName,

                    studentFullName:
                        `${firstName} ${lastName}`,

                    studentDateOfBirth:
                        dob,

                    studentGender:
                        gender,

                    classApplyingFor:
                        classApplying,

                    previousSchool:
                        previousSchool,


                    /* -----------------------------------------
                       PARENT INFORMATION
                    ----------------------------------------- */

                    parentName:
                        parentName,

                    parentPhone:
                        parentPhone,

                    parentEmail:
                        parentEmail,

                    relationship:
                        relationship,


                    /* -----------------------------------------
                       ADDRESS
                    ----------------------------------------- */

                    residentialAddress:
                        address,


                    /* -----------------------------------------
                       MESSAGE DISPLAY FIELDS
                    ----------------------------------------- */

                    name:
                        parentName,

                    email:
                        parentEmail,

                    phone:
                        parentPhone,

                    message:
                        `ADMISSION APPLICATION

Student:
${firstName} ${lastName}

Date of Birth:
${dob}

Gender:
${gender}

Class Applying For:
${classApplying}

Previous School:
${previousSchool || "Not provided"}

Parent/Guardian:
${parentName}

Relationship:
${relationship}

Phone:
${parentPhone}

Email:
${parentEmail}

Residential Address:
${address}`,

                    reply:
                        "",

                    createdAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp()
                };


                await addDoc(
                    collection(db, "messages"),
                    applicationData
                );


                console.log(
                    "Admission application saved successfully."
                );


                /* =================================================
                   RESET FORM
                ================================================= */

                admissionForm.reset();


                /* =================================================
                   SUCCESS MESSAGE
                ================================================= */

                await Swal.fire({

                    icon: "success",

                    title:
                        "Application Submitted!",

                    text:
                        "Thank you. Your child's admission application has been received by Ebenezer Day Star Academy.",

                    confirmButtonText:
                        "OK",

                    confirmButtonColor:
                        "#0b1f3a"
                });


            } catch (error) {

                console.error(
                    "Error submitting admission application:",
                    error
                );


                /* =================================================
                   ERROR MESSAGE
                ================================================= */

                await Swal.fire({

                    icon: "error",

                    title:
                        "Application Not Submitted",

                    text:
                        "We could not submit your application. Please check your internet connection and try again.",

                    confirmButtonText:
                        "Try Again",

                    confirmButtonColor:
                        "#0b1f3a"
                });


            } finally {

                /* =================================================
                   RESTORE BUTTON
                ================================================= */

                submitButton.disabled = false;

                buttonText.textContent =
                    "Submit Application";

                if (spinner) {
                    spinner.style.display = "none";
                }

            }

        }
    );

}


/* =========================================================
   ERROR HELPER
========================================================= */

function showError(message) {

    Swal.fire({

        icon: "warning",

        title:
            "Incomplete Application",

        text:
            message,

        confirmButtonText:
            "OK",

        confirmButtonColor:
            "#0b1f3a"

    });

}