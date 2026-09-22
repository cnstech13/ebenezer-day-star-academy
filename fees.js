/* =========================================================
   EBENEZER DAY STAR ACADEMY
   FEES.JS
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
    getDocs,
    query,
    orderBy,
    limit,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";


import { db } from "./firebase-config.js";


/* =========================================================
   WAIT FOR ADMIN AUTHENTICATION
========================================================= */

await adminReady;


/* =========================================================
   HTML ELEMENTS
========================================================= */

const form =
    document.getElementById("form");


const rows =
    document.getElementById("rows");


const msg =
    document.getElementById("msg");


const studentIdInput =
    document.getElementById("studentId");


const titleInput =
    document.getElementById("title");


const amountInput =
    document.getElementById("amount");


const statusInput =
    document.getElementById("status");


const sessionInput =
    document.getElementById("session");


const termInput =
    document.getElementById("term");


const logoutButton =
    document.getElementById("logout");


/* =========================================================
   FEES COLLECTION
========================================================= */

const feesCollection =
    collection(db, "fees");


/* =========================================================
   LOAD FEE RECORDS
========================================================= */

async function loadFees() {

    if (!rows) {
        return;
    }


    rows.innerHTML = `
        <tr>
            <td colspan="5">
                Loading fee records...
            </td>
        </tr>
    `;


    try {

        let snapshot;


        /*
         * First try to load records ordered
         * by creation date.
         */

        try {

            const feesQuery =
                query(
                    feesCollection,
                    orderBy(
                        "createdAt",
                        "desc"
                    ),
                    limit(100)
                );


            snapshot =
                await withTimeout(
                    getDocs(feesQuery)
                );

        }

        catch (error) {

            console.warn(
                "Ordered fee query failed. Loading records without ordering.",
                error
            );


            /*
             * This fallback is useful when
             * existing Firestore records do
             * not have createdAt.
             */

            snapshot =
                await withTimeout(
                    getDocs(
                        feesCollection
                    )
                );

        }


        /* -----------------------------------------
           NO RECORDS
        ----------------------------------------- */

        if (
            snapshot.empty
        ) {

            rows.innerHTML = `
                <tr>
                    <td colspan="5">
                        No fee records found.
                    </td>
                </tr>
            `;

            return;

        }


        /* -----------------------------------------
           BUILD TABLE
        ----------------------------------------- */

        const records =
            snapshot.docs.map(
                documentSnapshot => {

                    const data =
                        documentSnapshot.data();


                    return {

                        id:
                            documentSnapshot.id,

                        ...data

                    };

                }
            );


        rows.innerHTML =
            records.map(
                fee => {

                    const studentId =
                        escapeHTML(
                            fee.studentId || ""
                        );


                    const title =
                        escapeHTML(
                            fee.title ||
                            fee.description ||
                            ""
                        );


                    const amount =
                        Number(
                            fee.amount || 0
                        ).toLocaleString(
                            "en-NG"
                        );


                    const status =
                        escapeHTML(
                            fee.status ||
                            "Pending"
                        );


                    const session =
                        escapeHTML(
                            fee.session ||
                            ""
                        );


                    return `

                        <tr>

                            <td>
                                ${studentId}
                            </td>

                            <td>
                                ${title}
                            </td>

                            <td>
                                ₦${amount}
                            </td>

                            <td>
                                ${status}
                            </td>

                            <td>
                                ${session}
                            </td>

                        </tr>

                    `;

                }
            ).join("");


    }

    catch (error) {

        console.error(
            "Error loading fee records:",
            error
        );


        rows.innerHTML = `
            <tr>
                <td colspan="5">
                    Unable to load fee records.
                </td>
            </tr>
        `;


        if (msg) {

            msg.textContent =
                "Unable to load fee records.";

        }

    }

}


/* =========================================================
   SAVE FEE
========================================================= */

if (form) {

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* -----------------------------------------
               GET VALUES
            ----------------------------------------- */

            const studentId =
                studentIdInput
                    ?.value
                    .trim();


            const title =
                titleInput
                    ?.value
                    .trim();


            const amount =
                Number(
                    amountInput
                        ?.value || 0
                );


            const status =
                statusInput
                    ?.value ||
                "Pending";


            const session =
                sessionInput
                    ?.value
                    .trim();


            const term =
                termInput
                    ?.value
                    .trim();


            /* -----------------------------------------
               VALIDATION
            ----------------------------------------- */

            if (!studentId) {

                showMessage(
                    "Please enter the Student ID."
                );

                studentIdInput?.focus();

                return;

            }


            if (!title) {

                showMessage(
                    "Please enter the fee description."
                );

                titleInput?.focus();

                return;

            }


            if (
                !amountInput?.value ||
                amount < 0
            ) {

                showMessage(
                    "Please enter a valid fee amount."
                );

                amountInput?.focus();

                return;

            }


            /* -----------------------------------------
               LOADING STATE
            ----------------------------------------- */

            const submitButton =
                form.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Saving...";

            }


            if (msg) {

                msg.textContent =
                    "";

            }


            /* -----------------------------------------
               SAVE TO FIRESTORE
            ----------------------------------------- */

            try {

                await withTimeout(

                    addDoc(
                        feesCollection,
                        {

                            studentId:
                                studentId,

                            title:
                                title,

                            amount:
                                amount,

                            status:
                                status,

                            session:
                                session,

                            term:
                                term,

                            createdAt:
                                serverTimestamp()

                        }
                    )

                );


                /* -----------------------------------------
                   SUCCESS
                ----------------------------------------- */

                showMessage(
                    "Fee saved successfully."
                );


                /*
                 * Clear the form.
                 */

                form.reset();


                /*
                 * Reload fee records.
                 */

                await loadFees();


            }

            catch (error) {

                console.error(
                    "Error saving fee:",
                    error
                );


                showMessage(
                    "Unable to save fee. " +
                    getFirebaseErrorMessage(
                        error
                    )
                );

            }

            finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Save Fee";

                }

            }

        }
    );

}


/* =========================================================
   LOGOUT
========================================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "logout.html";

        }
    );

}


/* =========================================================
   MESSAGE
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

function getFirebaseErrorMessage(error) {

    if (!error) {

        return "Please try again.";

    }


    if (
        error.code ===
        "permission-denied"
    ) {

        return (
            "Firestore permission denied."
        );

    }


    if (
        error.code ===
        "unavailable"
    ) {

        return (
            "Firebase is temporarily unavailable."
        );

    }


    return (
        error.message ||
        "Please check your Firebase settings."
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   INITIALIZE
========================================================= */

await loadFees();


/* =========================================================
   READY
========================================================= */

console.log(
    "Fees management initialized successfully."
);