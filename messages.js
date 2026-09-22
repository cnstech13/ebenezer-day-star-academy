/* =========================================================
   MESSAGES MANAGEMENT
   EBENEZER DAY STAR ACADEMY

   Firebase Firestore + EmailJS
========================================================= */

import {
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
    db,
    auth
} from "./firebase-config.js";


/* =========================================================
   ADMIN SETTINGS
========================================================= */

const ADMIN_EMAIL = "cnstech0013@gmail.com";


/* =========================================================
   EMAILJS SETTINGS
=========================================================

   REPLACE ONLY THESE THREE VALUES.

========================================================= */

const EMAILJS_PUBLIC_KEY = "Q1lpBo6EthcCGhVMl";

const EMAILJS_SERVICE_ID = "service_bzb1esg";

const EMAILJS_TEMPLATE_ID = "template_48w3ulf";


/* =========================================================
   INITIALIZE EMAILJS
========================================================= */

try {

    if (
        typeof emailjs !== "undefined" &&
        EMAILJS_PUBLIC_KEY !== "YOUR_EMAILJS_PUBLIC_KEY"
    ) {

        emailjs.init({
            publicKey: EMAILJS_PUBLIC_KEY
        });

        console.log("EmailJS initialized successfully.");

    } else {

        console.warn(
            "EmailJS is not initialized yet. Add your Public Key."
        );

    }

} catch (error) {

    console.error(
        "EmailJS initialization error:",
        error
    );

}


/* =========================================================
   DOM ELEMENTS
========================================================= */

const messagesList =
    document.getElementById("messagesList");

const loading =
    document.getElementById("loading");

const emptyState =
    document.getElementById("emptyState");

const totalMessages =
    document.getElementById("totalMessages");

const unreadMessages =
    document.getElementById("unreadMessages");

const readMessages =
    document.getElementById("readMessages");

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

const typeFilter =
    document.getElementById("typeFilter");

const refreshBtn =
    document.getElementById("refreshBtn");

const backBtn =
    document.getElementById("backBtn");


/* =========================================================
   GLOBAL DATA
========================================================= */

let allMessages = [];


/* =========================================================
   BACK TO DASHBOARD
========================================================= */

if (backBtn) {

    backBtn.addEventListener("click", () => {

        window.location.href = "dashboard.html";

    });

}


/* =========================================================
   ADMIN AUTHENTICATION
========================================================= */

onAuthStateChanged(auth, async (user) => {

    try {

        if (!user) {

            window.location.href = "admin-login.html";

            return;

        }


        /*
           Check administrator email.
        */

        if (
            user.email !== ADMIN_EMAIL
        ) {

            await Swal.fire({
                icon: "error",
                title: "Access Denied",
                text: "Only the school administrator can access messages."
            });

            window.location.href = "dashboard.html";

            return;

        }


        console.log(
            "Administrator authenticated:",
            user.email
        );


        await loadMessages();

    } catch (error) {

        console.error(
            "Authentication error:",
            error
        );

        await Swal.fire({
            icon: "error",
            title: "Authentication Error",
            text: error.message
        });

    }

});


/* =========================================================
   LOAD MESSAGES
========================================================= */

async function loadMessages() {

    loading.style.display = "block";

    messagesList.innerHTML = "";

    emptyState.style.display = "none";


    try {

        const snapshot =
            await getDocs(
                collection(db, "messages")
            );


        allMessages = [];


        snapshot.forEach((documentSnapshot) => {

            allMessages.push({

                id: documentSnapshot.id,

                ...documentSnapshot.data()

            });

        });


        /*
           Sort newest first.
        */

        allMessages.sort((a, b) => {

            const dateA =
                getMessageDate(a);

            const dateB =
                getMessageDate(b);

            return dateB - dateA;

        });


        updateStatistics();

        displayMessages();


    } catch (error) {

        console.error(
            "Error loading messages:",
            error
        );


        messagesList.innerHTML = "";


        await Swal.fire({
            icon: "error",
            title: "Unable to Load Messages",
            text: getFirestoreErrorMessage(error)
        });

    }


    loading.style.display = "none";

}


/* =========================================================
   FIRESTORE ERROR MESSAGE
========================================================= */

function getFirestoreErrorMessage(error) {

    if (
        error &&
        error.code === "permission-denied"
    ) {

        return "You do not have permission to access school messages. Please check your Firestore security rules.";

    }

    return error?.message ||
        "An unexpected error occurred.";

}


/* =========================================================
   GET MESSAGE DATE
========================================================= */

function getMessageDate(message) {

    if (
        message.createdAt &&
        typeof message.createdAt.toDate === "function"
    ) {

        return message.createdAt.toDate();

    }


    if (
        message.createdAt &&
        !isNaN(
            new Date(message.createdAt)
        )
    ) {

        return new Date(
            message.createdAt
        );

    }


    return new Date(0);

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(message) {

    const date =
        getMessageDate(message);


    if (
        date.getTime() === 0
    ) {

        return "Date unavailable";

    }


    return date.toLocaleString(
        "en-NG",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}


/* =========================================================
   UPDATE STATISTICS
========================================================= */

function updateStatistics() {

    const total =
        allMessages.length;


    const unread =
        allMessages.filter(
            message =>
                message.status === "unread"
        ).length;


    const read =
        allMessages.filter(
            message =>
                message.status === "read"
        ).length;


    totalMessages.textContent =
        total;


    unreadMessages.textContent =
        unread;


    readMessages.textContent =
        read;

}


/* =========================================================
   DISPLAY MESSAGES
========================================================= */

function displayMessages() {

    const searchTerm =
        searchInput.value
            .trim()
            .toLowerCase();


    const selectedStatus =
        statusFilter.value;


    const selectedType =
        typeFilter.value;


    const filteredMessages =
        allMessages.filter(message => {


            /* SEARCH */

            const searchableText = [

                message.name,

                message.email,

                message.phone,

                message.subject,

                message.message,

                message.studentFullName,

                message.parentName,

                message.parentEmail,

                message.classApplyingFor

            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            const matchesSearch =
                !searchTerm ||
                searchableText.includes(
                    searchTerm
                );


            /* STATUS */

            const matchesStatus =
                selectedStatus === "all" ||
                message.status === selectedStatus;


            /* TYPE */

            let messageType = "contact";


            if (
                message.messageType === "admission"
            ) {

                messageType = "admission";

            }


            const matchesType =
                selectedType === "all" ||
                messageType === selectedType;


            return (
                matchesSearch &&
                matchesStatus &&
                matchesType
            );

        });


    messagesList.innerHTML = "";


    if (
        filteredMessages.length === 0
    ) {

        emptyState.style.display =
            "block";

        return;

    }


    emptyState.style.display =
        "none";


    filteredMessages.forEach(
        message => {

            const card =
                createMessageCard(message);

            messagesList.appendChild(card);

        }
    );

}


/* =========================================================
   CREATE MESSAGE CARD
========================================================= */

function createMessageCard(message) {

    const card =
        document.createElement("article");


    const isUnread =
        message.status !== "read";


    const isAdmission =
        message.messageType === "admission";


    card.className =
        `message-card ${
            isUnread ? "unread" : ""
        }`;


    const senderName =
        escapeHTML(
            message.name ||
            message.parentName ||
            "Unknown Sender"
        );


    const senderEmail =
        escapeHTML(
            message.email ||
            message.parentEmail ||
            "No email"
        );


    const senderPhone =
        escapeHTML(
            message.phone ||
            message.parentPhone ||
            "No phone number"
        );


    const subject =
        escapeHTML(
            message.subject ||
            "No subject"
        );


    const messageText =
        escapeHTML(
            message.message ||
            "No message content."
        );


    const statusBadge =
        isUnread

            ? `<span class="badge badge-unread">
                    UNREAD
               </span>`

            : `<span class="badge badge-read">
                    READ
               </span>`;


    const typeBadge =
        isAdmission

            ? `<span class="badge badge-admission">
                    ADMISSION APPLICATION
               </span>`

            : `<span class="badge badge-contact">
                    CONTACT MESSAGE
               </span>`;


    card.innerHTML = `

        <div class="message-top">

            <div class="sender-info">

                <h3>
                    ${senderName}
                </h3>

                <p>
                    📧 ${senderEmail}
                </p>

                <p>
                    📞 ${senderPhone}
                </p>

            </div>


            <div class="message-badges">

                ${statusBadge}

                ${typeBadge}

            </div>

        </div>


        <div class="message-subject">

            ${subject}

        </div>


        <div class="message-preview">

            ${messageText}

        </div>


        ${
            isAdmission
                ? createAdmissionDetails(message)
                : ""
        }


        <div class="message-date">

            ${formatDate(message)}

        </div>


        <div class="message-actions">

            <button
                class="action-btn view-btn"
                data-action="view"
                data-id="${message.id}"
            >
                👁 View
            </button>


            <button
                class="action-btn reply-btn"
                data-action="reply"
                data-id="${message.id}"
            >
                ✉ Reply
            </button>


            ${
                isUnread

                    ? `
                        <button
                            class="action-btn read-btn"
                            data-action="read"
                            data-id="${message.id}"
                        >
                            ✓ Mark as Read
                        </button>
                      `

                    : ""
            }


            <button
                class="action-btn delete-btn"
                data-action="delete"
                data-id="${message.id}"
            >
                🗑 Delete
            </button>

        </div>

    `;


    /*
       Button events.
    */

    card
        .querySelectorAll(
            "[data-action]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const action =
                        button.dataset.action;

                    const messageId =
                        button.dataset.id;


                    if (
                        action === "view"
                    ) {

                        viewMessage(
                            messageId
                        );

                    }


                    if (
                        action === "reply"
                    ) {

                        replyToMessage(
                            messageId
                        );

                    }


                    if (
                        action === "read"
                    ) {

                        markAsRead(
                            messageId
                        );

                    }


                    if (
                        action === "delete"
                    ) {

                        deleteMessage(
                            messageId
                        );

                    }

                }
            );

        });


    return card;

}


/* =========================================================
   ADMISSION DETAILS
========================================================= */

function createAdmissionDetails(message) {

    return `

        <div class="admission-details">

            <div class="details-title">
                Student & Parent Information
            </div>


            <div class="details-grid">

                <div class="detail-item">

                    <strong>Student:</strong>

                    ${escapeHTML(
                        message.studentFullName ||
                        `${message.studentFirstName || ""} ${message.studentLastName || ""}`
                    )}

                </div>


                <div class="detail-item">

                    <strong>Date of Birth:</strong>

                    ${escapeHTML(
                        message.studentDateOfBirth ||
                        "Not provided"
                    )}

                </div>


                <div class="detail-item">

                    <strong>Gender:</strong>

                    ${escapeHTML(
                        message.studentGender ||
                        "Not provided"
                    )}

                </div>


                <div class="detail-item">

                    <strong>Class:</strong>

                    ${escapeHTML(
                        message.classApplyingFor ||
                        "Not provided"
                    )}

                </div>


                <div class="detail-item">

                    <strong>Previous School:</strong>

                    ${escapeHTML(
                        message.previousSchool ||
                        "None provided"
                    )}

                </div>


                <div class="detail-item">

                    <strong>Parent/Guardian:</strong>

                    ${escapeHTML(
                        message.parentName ||
                        message.name ||
                        "Not provided"
                    )}

                </div>


                <div class="detail-item">

                    <strong>Relationship:</strong>

                    ${escapeHTML(
                        message.relationship ||
                        "Not provided"
                    )}

                </div>


                <div class="detail-item">

                    <strong>Parent Phone:</strong>

                    ${escapeHTML(
                        message.parentPhone ||
                        message.phone ||
                        "Not provided"
                    )}

                </div>


                <div class="detail-item">

                    <strong>Parent Email:</strong>

                    ${escapeHTML(
                        message.parentEmail ||
                        message.email ||
                        "Not provided"
                    )}

                </div>


                <div class="detail-item">

                    <strong>Address:</strong>

                    ${escapeHTML(
                        message.residentialAddress ||
                        "Not provided"
                    )}

                </div>

            </div>

        </div>

    `;

}


/* =========================================================
   VIEW MESSAGE
========================================================= */

async function viewMessage(messageId) {

    const message =
        allMessages.find(
            item =>
                item.id === messageId
        );


    if (!message) {

        return;

    }


    /*
       Mark unread message as read.
    */

    if (
        message.status !== "read"
    ) {

        try {

            await updateDoc(
                doc(
                    db,
                    "messages",
                    messageId
                ),
                {
                    status: "read",
                    updatedAt:
                        serverTimestamp()
                }
            );


            message.status =
                "read";

            updateStatistics();

        } catch (error) {

            console.error(
                "Could not mark message as read:",
                error
            );

        }

    }


    const admissionInfo =
        message.messageType === "admission"

            ? createAdmissionDetails(message)

            : "";


    await Swal.fire({

        title:
            escapeHTML(
                message.subject ||
                "Message"
            ),

        html: `

            <div
                style="
                    text-align:left;
                    line-height:1.7;
                "
            >

                <p>
                    <strong>Name:</strong>
                    ${escapeHTML(
                        message.name ||
                        message.parentName ||
                        "Unknown"
                    )}
                </p>


                <p>
                    <strong>Email:</strong>
                    ${escapeHTML(
                        message.email ||
                        message.parentEmail ||
                        "Not provided"
                    )}
                </p>


                <p>
                    <strong>Phone:</strong>
                    ${escapeHTML(
                        message.phone ||
                        message.parentPhone ||
                        "Not provided"
                    )}
                </p>


                ${
                    admissionInfo
                }


                <hr>


                <p>
                    <strong>Message:</strong>
                </p>


                <p style="white-space:pre-line;">
                    ${escapeHTML(
                        message.message ||
                        "No message"
                    )}
                </p>


                ${
                    message.reply

                        ? `
                            <hr>

                            <p>
                                <strong>
                                    Previous Reply:
                                </strong>
                            </p>

                            <p
                                style="
                                    white-space:pre-line;
                                "
                            >
                                ${escapeHTML(
                                    message.reply
                                )}
                            </p>
                          `

                        : ""
                }

            </div>

        `,

        width: "750px",

        confirmButtonText: "Close",

        confirmButtonColor: "#0b1f3a"

    });


    displayMessages();

}


/* =========================================================
   REPLY TO MESSAGE
========================================================= */

async function replyToMessage(messageId) {

    const message =
        allMessages.find(
            item =>
                item.id === messageId
        );


    if (!message) {

        return;

    }


    const recipientEmail =
        message.email ||
        message.parentEmail;


    const recipientName =
        message.name ||
        message.parentName ||
        "Parent/Guardian";


    if (!recipientEmail) {

        await Swal.fire({
            icon: "error",
            title: "No Email Address",
            text: "This message does not contain a valid email address."
        });

        return;

    }


    /*
       Check EmailJS configuration.
    */

    if (
        EMAILJS_PUBLIC_KEY ===
        "YOUR_EMAILJS_PUBLIC_KEY"
        ||
        EMAILJS_SERVICE_ID ===
        "YOUR_EMAILJS_SERVICE_ID"
        ||
        EMAILJS_TEMPLATE_ID ===
        "YOUR_EMAILJS_TEMPLATE_ID"
    ) {

        await Swal.fire({

            icon: "warning",

            title: "EmailJS Not Configured",

            html: `
                <p>
                    Please add your EmailJS
                    Public Key, Service ID
                    and Template ID to
                    <strong>messages.js</strong>.
                </p>
            `

        });

        return;

    }


    const result =
        await Swal.fire({

            title: `Reply to ${escapeHTML(recipientName)}`,

            html: `

                <div
                    style="
                        text-align:left;
                        margin-bottom:10px;
                    "
                >

                    <label
                        style="
                            font-weight:bold;
                            display:block;
                            margin-bottom:5px;
                        "
                    >
                        Recipient
                    </label>

                    <input
                        type="text"
                        value="${escapeHTML(recipientName)}"
                        readonly
                        style="
                            width:100%;
                            padding:10px;
                            border:1px solid #ddd;
                            border-radius:6px;
                            background:#f5f5f5;
                            margin-bottom:12px;
                        "
                    >


                    <label
                        style="
                            font-weight:bold;
                            display:block;
                            margin-bottom:5px;
                        "
                    >
                        Email
                    </label>

                    <input
                        type="email"
                        value="${escapeHTML(recipientEmail)}"
                        readonly
                        style="
                            width:100%;
                            padding:10px;
                            border:1px solid #ddd;
                            border-radius:6px;
                            background:#f5f5f5;
                            margin-bottom:12px;
                        "
                    >


                    <label
                        style="
                            font-weight:bold;
                            display:block;
                            margin-bottom:5px;
                        "
                    >
                        Reply
                    </label>

                    <textarea
                        id="replyText"
                        rows="8"
                        placeholder="Type your reply here..."
                        style="
                            width:100%;
                            padding:12px;
                            border:1px solid #ddd;
                            border-radius:6px;
                            resize:vertical;
                            font-family:Arial,sans-serif;
                            line-height:1.5;
                        "
                    ></textarea>

                </div>

            `,

            showCancelButton: true,

            confirmButtonText:
                "Send Reply",

            cancelButtonText:
                "Cancel",

            confirmButtonColor:
                "#0b1f3a",

            cancelButtonColor:
                "#777",

            width: "650px",

            preConfirm: () => {

                const replyElement =
                    document.getElementById(
                        "replyText"
                    );


                const reply =
                    replyElement?.value
                        .trim();


                if (!reply) {

                    Swal.showValidationMessage(
                        "Please type a reply before sending."
                    );

                    return false;

                }


                if (
                    reply.length < 2
                ) {

                    Swal.showValidationMessage(
                        "Your reply is too short."
                    );

                    return false;

                }


                return reply;

            }

        });


    if (!result.isConfirmed) {

        return;

    }


    const replyText =
        result.value;


    /*
       Show sending indicator.
    */

    Swal.fire({

        title: "Sending Reply...",

        text: "Please wait while the email is being sent.",

        allowOutsideClick: false,

        allowEscapeKey: false,

        didOpen: () => {

            Swal.showLoading();

        }

    });


    try {

        /*
           EmailJS template parameters.

           These names MUST match the
           variables in your EmailJS template.
        */

        const templateParams = {

            to_name:
                recipientName,

            to_email:
                recipientEmail,

            subject:
                `Re: ${
                    message.subject ||
                    "Message from Ebenezer Day Star Academy"
                }`,

            message:
                replyText,

            reply:
                replyText,

            from_name:
                "Ebenezer Day Star Academy",

            from_email:
                ADMIN_EMAIL,

            school_name:
                "Ebenezer Day Star Academy",

            original_subject:
                message.subject ||
                "School Message"

        };


        /*
           SEND EMAIL
        */

        const emailResponse =
            await emailjs.send(

                EMAILJS_SERVICE_ID,

                EMAILJS_TEMPLATE_ID,

                templateParams

            );


        console.log(
            "EmailJS response:",
            emailResponse
        );


        /*
           SAVE REPLY TO FIRESTORE
        */

        await updateDoc(

            doc(
                db,
                "messages",
                messageId
            ),

            {

                reply:
                    replyText,

                repliedAt:
                    serverTimestamp(),

                repliedBy:
                    ADMIN_EMAIL,

                status:
                    "read",

                updatedAt:
                    serverTimestamp()

            }

        );


        /*
           Update local message.
        */

        message.reply =
            replyText;

        message.status =
            "read";


        updateStatistics();

        displayMessages();


        /*
           Success.
        */

        await Swal.fire({

            icon: "success",

            title: "Reply Sent",

            text:
                `Your reply has been sent successfully to ${recipientEmail}.`,

            confirmButtonColor:
                "#0b1f3a"

        });


    } catch (error) {

        console.error(
            "Reply sending error:",
            error
        );


        let errorMessage =
            "The reply could not be sent.";


        if (
            error &&
            error.text
        ) {

            errorMessage =
                error.text;

        } else if (
            error &&
            error.message
        ) {

            errorMessage =
                error.message;

        }


        await Swal.fire({

            icon: "error",

            title: "Reply Failed",

            html: `

                <p>
                    ${escapeHTML(errorMessage)}
                </p>

                <p
                    style="
                        font-size:13px;
                        color:#777;
                        margin-top:10px;
                    "
                >
                    Check your EmailJS
                    Service ID, Template ID,
                    Public Key and template
                    variable names.
                </p>

            `

        });

    }

}


/* =========================================================
   MARK AS READ
========================================================= */

async function markAsRead(messageId) {

    try {

        await updateDoc(

            doc(
                db,
                "messages",
                messageId
            ),

            {

                status: "read",

                updatedAt:
                    serverTimestamp()

            }

        );


        const message =
            allMessages.find(
                item =>
                    item.id === messageId
            );


        if (message) {

            message.status =
                "read";

        }


        updateStatistics();

        displayMessages();


        Swal.fire({

            icon: "success",

            title: "Marked as Read",

            text: "The message has been marked as read.",

            timer: 1500,

            showConfirmButton: false

        });


    } catch (error) {

        console.error(
            "Mark as read error:",
            error
        );


        Swal.fire({

            icon: "error",

            title: "Update Failed",

            text:
                getFirestoreErrorMessage(
                    error
                )

        });

    }

}


/* =========================================================
   DELETE MESSAGE
========================================================= */

async function deleteMessage(messageId) {

    const message =
        allMessages.find(
            item =>
                item.id === messageId
        );


    if (!message) {

        return;

    }


    const result =
        await Swal.fire({

            icon: "warning",

            title: "Delete Message?",

            text:
                "This message will be permanently deleted from the dashboard.",

            showCancelButton: true,

            confirmButtonText:
                "Yes, Delete",

            cancelButtonText:
                "Cancel",

            confirmButtonColor:
                "#b91c1c",

            cancelButtonColor:
                "#777"

        });


    if (!result.isConfirmed) {

        return;

    }


    try {

        await deleteDoc(

            doc(
                db,
                "messages",
                messageId
            )

        );


        allMessages =
            allMessages.filter(
                item =>
                    item.id !== messageId
            );


        updateStatistics();

        displayMessages();


        await Swal.fire({

            icon: "success",

            title: "Deleted",

            text:
                "The message has been deleted.",

            timer: 1500,

            showConfirmButton: false

        });


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );


        await Swal.fire({

            icon: "error",

            title: "Delete Failed",

            text:
                getFirestoreErrorMessage(
                    error
                )

        });

    }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

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
   SEARCH
========================================================= */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        displayMessages
    );

}


/* =========================================================
   STATUS FILTER
========================================================= */

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        displayMessages
    );

}


/* =========================================================
   TYPE FILTER
========================================================= */

if (typeFilter) {

    typeFilter.addEventListener(
        "change",
        displayMessages
    );

}


/* =========================================================
   REFRESH
========================================================= */

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        async () => {

            refreshBtn.disabled =
                true;

            refreshBtn.textContent =
                "Refreshing...";


            await loadMessages();


            refreshBtn.disabled =
                false;

            refreshBtn.textContent =
                "↻ Refresh";

        }
    );

}


/* =========================================================
   DEBUG MESSAGE
========================================================= */

console.log(
    "messages.js loaded successfully."
);