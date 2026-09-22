/* =========================================================
   NEWS / NOTIFICATIONS MANAGEMENT
   EBENEZER DAY STAR ACADEMY

   Supports:
   - Parents
   - Teachers
   - Students
   - Admin
   - All Users

   Firestore audience is stored as an ARRAY:
   parent   -> ["parent"]
   teacher  -> ["teacher"]
   student  -> ["student"]
   admin    -> ["admin"]
   all      -> ["admin","teacher","parent","student"]
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const notificationForm =
    document.getElementById("notificationForm");

const notificationTitle =
    document.getElementById("notificationTitle");

const notificationMessage =
    document.getElementById("notificationMessage");

const notificationAudience =
    document.getElementById("notificationAudience");

const notificationStatus =
    document.getElementById("notificationStatus");

const publishBtn =
    document.getElementById("publishBtn");

const cancelEditBtn =
    document.getElementById("cancelEditBtn");

const notificationsList =
    document.getElementById("notificationsList");

const formTitle =
    document.getElementById("formTitle");


/* =========================================================
   STATE
========================================================= */

let editingId = null;

let firebaseModules = null;


/* =========================================================
   BASIC ERROR DISPLAY
========================================================= */

function showError(title, message) {

    console.error(title, message);

    if (typeof Swal !== "undefined") {

        Swal.fire({
            icon: "error",
            title: title,
            text: message
        });

    } else {

        alert(
            title +
            "\n\n" +
            message
        );

    }
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(timestamp) {

    if (!timestamp) {
        return "No date";
    }

    try {

        let date;

        if (timestamp?.toDate) {

            date =
                timestamp.toDate();

        } else {

            date =
                new Date(timestamp);

        }


        if (Number.isNaN(date.getTime())) {

            return "No date";

        }


        return date.toLocaleString(
            "en-NG",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit"
            }
        );


    } catch (error) {

        return "No date";

    }
}


/* =========================================================
   CONVERT FORM AUDIENCE TO FIRESTORE AUDIENCE
========================================================= */

function getAudienceArray(value) {

    switch (value) {

        case "parents":

            return ["parent"];


        case "teachers":

            return ["teacher"];


        case "students":

            return ["student"];


        case "admin":

            return ["admin"];


        case "all":

            return [
                "admin",
                "teacher",
                "parent",
                "student"
            ];


        default:

            return ["parent"];

    }
}


/* =========================================================
   DISPLAY AUDIENCE
========================================================= */

function formatAudience(audience) {

    if (!audience) {

        return "Parents";

    }


    /* ---------------------------------------------
       New format: array
    --------------------------------------------- */

    if (Array.isArray(audience)) {

        const names = audience.map(role => {

            switch (String(role).toLowerCase()) {

                case "admin":
                    return "Admin";

                case "teacher":
                    return "Teachers";

                case "parent":
                    return "Parents";

                case "student":
                    return "Students";

                default:
                    return role;

            }

        });


        return names.join(", ");

    }


    /* ---------------------------------------------
       Old format: string
       Keeps old notifications readable.
    --------------------------------------------- */

    const value =
        String(audience).toLowerCase();


    switch (value) {

        case "parents":
        case "parent":
            return "Parents";

        case "teachers":
        case "teacher":
            return "Teachers";

        case "students":
        case "student":
            return "Students";

        case "admin":
            return "Admin";

        case "all":
            return "All Users";

        default:
            return String(audience);

    }
}


/* =========================================================
   CONVERT STORED AUDIENCE BACK TO FORM VALUE
========================================================= */

function getAudienceSelectValue(audience) {

    if (Array.isArray(audience)) {

        const roles =
            audience.map(role =>
                String(role).toLowerCase()
            );


        if (
            roles.includes("admin") &&
            roles.includes("teacher") &&
            roles.includes("parent") &&
            roles.includes("student")
        ) {

            return "all";

        }


        if (
            roles.length === 1 &&
            roles[0] === "teacher"
        ) {

            return "teachers";

        }


        if (
            roles.length === 1 &&
            roles[0] === "parent"
        ) {

            return "parents";

        }


        if (
            roles.length === 1 &&
            roles[0] === "student"
        ) {

            return "students";

        }


        if (
            roles.length === 1 &&
            roles[0] === "admin"
        ) {

            return "admin";

        }

    }


    /* ---------------------------------------------
       Old string format
    --------------------------------------------- */

    const value =
        String(audience || "parents")
            .toLowerCase();


    if (
        value === "teacher" ||
        value === "teachers"
    ) {

        return "teachers";

    }


    if (
        value === "parent" ||
        value === "parents"
    ) {

        return "parents";

    }


    if (
        value === "student" ||
        value === "students"
    ) {

        return "students";

    }


    if (value === "admin") {

        return "admin";

    }


    if (value === "all") {

        return "all";

    }


    return "parents";
}


/* =========================================================
   LOAD FIREBASE MODULES
========================================================= */

async function loadFirebaseModules() {

    if (firebaseModules) {

        return firebaseModules;

    }


    try {

        const firestore =
            await import(
                "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js"
            );


        const config =
            await import(
                "./firebase-config.js"
            );


        const guard =
            await import(
                "./admin-guard.js"
            );


        firebaseModules = {

            firestore,

            db:
                config.db,

            adminReady:
                guard.adminReady

        };


        return firebaseModules;


    } catch (error) {

        console.error(
            "Firebase module loading error:",
            error
        );


        throw new Error(
            "Firebase could not be loaded.\n\n" +
            error.message
        );

    }
}


/* =========================================================
   RESET FORM
========================================================= */

function resetForm() {

    editingId = null;


    if (notificationForm) {

        notificationForm.reset();

    }


    if (notificationAudience) {

        notificationAudience.value =
            "parents";

    }


    if (notificationStatus) {

        notificationStatus.value =
            "published";

    }


    if (formTitle) {

        formTitle.textContent =
            "Publish Notification";

    }


    if (publishBtn) {

        publishBtn.disabled =
            false;

        publishBtn.textContent =
            "Publish Notification";

    }


    if (cancelEditBtn) {

        cancelEditBtn.style.display =
            "none";

    }
}


/* =========================================================
   LOAD NOTIFICATIONS
========================================================= */

async function loadNotifications() {

    if (!notificationsList) {

        return;

    }


    notificationsList.innerHTML = `

        <div class="loading">

            Loading notifications...

        </div>

    `;


    try {

        const {
            firestore,
            db
        } =
            await loadFirebaseModules();


        const {
            collection,
            getDocs
        } =
            firestore;


        const snapshot =
            await getDocs(
                collection(
                    db,
                    "notifications"
                )
            );


        if (snapshot.empty) {

            notificationsList.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        📰
                    </div>

                    <h3>
                        No notifications yet
                    </h3>

                    <p>
                        Create your first school notification.
                    </p>

                </div>

            `;

            return;

        }


        const notifications =
            snapshot.docs

                .map(item => ({

                    id:
                        item.id,

                    ...item.data()

                }))

                .sort((a, b) => {

                    const aTime =
                        a.createdAt?.toMillis?.() ||
                        0;


                    const bTime =
                        b.createdAt?.toMillis?.() ||
                        0;


                    return bTime - aTime;

                });


        notificationsList.innerHTML =

            notifications

                .map(notification => {

                    const status =
                        String(
                            notification.status ||
                            "draft"
                        ).toLowerCase();


                    const audienceText =
                        formatAudience(
                            notification.audience
                        );


                    return `

                        <article
                            class="announcement"
                            data-id="${escapeHTML(
                                notification.id
                            )}"
                        >

                            <div
                                class="announcement-header"
                            >

                                <div>

                                    <h3
                                        class="announcement-title"
                                    >
                                        ${escapeHTML(
                                            notification.title ||
                                            "Untitled Notification"
                                        )}
                                    </h3>


                                    <div
                                        class="announcement-date"
                                    >
                                        ${formatDate(
                                            notification.createdAt
                                        )}
                                    </div>

                                </div>


                                <div
                                    class="announcement-actions"
                                >

                                    <button
                                        type="button"
                                        class="action-btn edit-btn"
                                        data-edit-id="${escapeHTML(
                                            notification.id
                                        )}"
                                        title="Edit"
                                    >
                                        ✏️
                                    </button>


                                    <button
                                        type="button"
                                        class="action-btn delete-btn"
                                        data-delete-id="${escapeHTML(
                                            notification.id
                                        )}"
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>

                                </div>

                            </div>


                            <p
                                class="announcement-message"
                            >
                                ${escapeHTML(
                                    notification.message ||
                                    ""
                                )}
                            </p>


                            <div
                                class="announcement-meta"
                            >

                                <span
                                    class="badge ${
                                        status === "published"
                                            ? "badge-published"
                                            : "badge-draft"
                                    }"
                                >
                                    ${escapeHTML(
                                        status
                                    )}
                                </span>


                                <span
                                    class="badge badge-audience"
                                >
                                    Audience:
                                    ${escapeHTML(
                                        audienceText
                                    )}
                                </span>

                            </div>

                        </article>

                    `;

                })

                .join("");


        attachNotificationActions();


    } catch (error) {

        console.error(
            "Error loading notifications:",
            error
        );


        notificationsList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to load notifications
                </h3>

                <p>
                    ${escapeHTML(
                        error.message ||
                        "Please try again."
                    )}
                </p>

            </div>

        `;

    }
}


/* =========================================================
   SAVE NOTIFICATION
========================================================= */

async function saveNotification(event) {

    if (event) {

        event.preventDefault();

    }


    console.log(
        "Publish Notification button clicked."
    );


    /* -----------------------------------------------------
       IMMEDIATE VISUAL RESPONSE
    ----------------------------------------------------- */

    if (publishBtn) {

        publishBtn.disabled =
            true;


        publishBtn.textContent =
            editingId
                ? "Updating..."
                : "Connecting...";

    }


    try {

        /* -------------------------------------------------
           GET FORM VALUES
        ------------------------------------------------- */

        const title =
            notificationTitle?.value.trim() ||
            "";


        const message =
            notificationMessage?.value.trim() ||
            "";


        const audienceSelection =
            notificationAudience?.value ||
            "parents";


        const status =
            notificationStatus?.value ||
            "published";


        /* -------------------------------------------------
           VALIDATION
        ------------------------------------------------- */

        if (!title) {

            showError(
                "Title required",
                "Please enter a notification title."
            );


            notificationTitle?.focus();

            return;

        }


        if (!message) {

            showError(
                "Message required",
                "Please enter the notification message."
            );


            notificationMessage?.focus();

            return;

        }


        /* -------------------------------------------------
           CONVERT AUDIENCE
        ------------------------------------------------- */

        const audience =
            getAudienceArray(
                audienceSelection
            );


        console.log(
            "Selected audience:",
            audienceSelection
        );


        console.log(
            "Firestore audience:",
            audience
        );


        /* -------------------------------------------------
           LOAD FIREBASE
        ------------------------------------------------- */

        const {
            firestore,
            db,
            adminReady
        } =
            await loadFirebaseModules();


        /* -------------------------------------------------
           VERIFY ADMIN
        ------------------------------------------------- */

        if (adminReady) {

            try {

                await adminReady;

            } catch (error) {

                throw new Error(
                    "Administrator authentication failed.\n\n" +
                    (
                        error.message ||
                        "Please log in again."
                    )
                );

            }

        }


        /* -------------------------------------------------
           FIRESTORE FUNCTIONS
        ------------------------------------------------- */

        const {
            collection,
            addDoc,
            doc,
            updateDoc,
            serverTimestamp
        } =
            firestore;


        /* -------------------------------------------------
           DATA
        ------------------------------------------------- */

        const notificationData = {

            title:

                title,


            message:

                message,


            /*
               IMPORTANT:
               This is now an ARRAY.
               Teacher notifications can therefore
               use array-contains "teacher".
            */

            audience:

                audience,


            status:

                status,


            published:

                status === "published",


            updatedAt:

                serverTimestamp()

        };


        /* =================================================
           UPDATE EXISTING NOTIFICATION
        ================================================= */

        if (editingId) {

            await updateDoc(

                doc(
                    db,
                    "notifications",
                    editingId
                ),

                notificationData

            );


            await Swal.fire({

                icon:
                    "success",

                title:
                    "Updated",

                text:
                    "Notification updated successfully.",

                timer:
                    1800,

                showConfirmButton:
                    false

            });

        }


        /* =================================================
           CREATE NEW NOTIFICATION
        ================================================= */

        else {

            await addDoc(

                collection(
                    db,
                    "notifications"
                ),

                {

                    ...notificationData,

                    createdAt:
                        serverTimestamp(),

                    createdBy:
                        "admin"

                }

            );


            await Swal.fire({

                icon:
                    "success",

                title:

                    status === "published"
                        ? "Published Successfully"
                        : "Saved as Draft",


                text:

                    status === "published"

                        ? (
                            audienceSelection ===
                            "teachers"

                                ? "The notification is now available to teachers."

                                : audienceSelection ===
                                  "all"

                                    ? "The notification is now available to all users."

                                    : "The notification has been published successfully."
                          )

                        : "The notification has been saved as a draft.",


                timer:
                    2000,

                showConfirmButton:
                    false

            });

        }


        /* -------------------------------------------------
           RESET
        ------------------------------------------------- */

        resetForm();


        await loadNotifications();


    } catch (error) {

        console.error(
            "SAVE NOTIFICATION ERROR:",
            error
        );


        showError(

            "Could not save notification",

            error.message ||
            "An unexpected error occurred."

        );


    } finally {

        if (publishBtn) {

            publishBtn.disabled =
                false;


            publishBtn.textContent =
                editingId
                    ? "Update Notification"
                    : "Publish Notification";

        }

    }
}


/* =========================================================
   EDIT NOTIFICATION
========================================================= */

async function editNotification(id) {

    try {

        const {
            firestore,
            db,
            adminReady
        } =
            await loadFirebaseModules();


        if (adminReady) {

            await adminReady;

        }


        const {
            getDoc,
            doc
        } =
            firestore;


        const notificationRef =
            doc(
                db,
                "notifications",
                id
            );


        const snapshot =
            await getDoc(
                notificationRef
            );


        if (!snapshot.exists()) {

            showError(
                "Notification not found",
                "This notification may have been deleted."
            );

            return;

        }


        const notification =
            snapshot.data();


        editingId =
            id;


        notificationTitle.value =
            notification.title ||
            "";


        notificationMessage.value =
            notification.message ||
            "";


        /*
           Converts both old string format
           and new array format.
        */

        notificationAudience.value =
            getAudienceSelectValue(
                notification.audience
            );


        notificationStatus.value =
            notification.status ||
            "draft";


        if (formTitle) {

            formTitle.textContent =
                "Edit Notification";

        }


        if (publishBtn) {

            publishBtn.textContent =
                "Update Notification";

        }


        if (cancelEditBtn) {

            cancelEditBtn.style.display =
                "block";

        }


        notificationForm?.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });


    } catch (error) {

        console.error(
            "EDIT NOTIFICATION ERROR:",
            error
        );


        showError(
            "Unable to edit notification",
            error.message ||
            "Please try again."
        );

    }
}


/* =========================================================
   DELETE NOTIFICATION
========================================================= */

async function deleteNotification(id) {

    const result =
        await Swal.fire({

            icon:
                "warning",

            title:
                "Delete notification?",

            text:
                "This notification will be permanently deleted.",

            showCancelButton:
                true,

            confirmButtonText:
                "Yes, delete it",

            cancelButtonText:
                "Cancel"

        });


    if (!result.isConfirmed) {

        return;

    }


    try {

        const {
            firestore,
            db,
            adminReady
        } =
            await loadFirebaseModules();


        if (adminReady) {

            await adminReady;

        }


        const {
            deleteDoc,
            doc
        } =
            firestore;


        await deleteDoc(

            doc(
                db,
                "notifications",
                id
            )

        );


        await Swal.fire({

            icon:
                "success",

            title:
                "Deleted",

            text:
                "Notification deleted successfully.",

            timer:
                1500,

            showConfirmButton:
                false

        });


        await loadNotifications();


    } catch (error) {

        console.error(
            "DELETE NOTIFICATION ERROR:",
            error
        );


        showError(
            "Delete failed",
            error.message ||
            "Unable to delete notification."
        );

    }
}


/* =========================================================
   ATTACH EDIT / DELETE BUTTONS
========================================================= */

function attachNotificationActions() {

    document
        .querySelectorAll("[data-edit-id]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    editNotification(
                        button.dataset.editId
                    );

                }
            );

        });


    document
        .querySelectorAll("[data-delete-id]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    deleteNotification(
                        button.dataset.deleteId
                    );

                }
            );

        });

}


/* =========================================================
   CANCEL EDIT
========================================================= */

if (cancelEditBtn) {

    cancelEditBtn.addEventListener(

        "click",

        () => {

            resetForm();

        }

    );

}


/* =========================================================
   FORM SUBMIT
========================================================= */

if (notificationForm) {

    notificationForm.addEventListener(

        "submit",

        saveNotification

    );

}


/* =========================================================
   DIRECT PUBLISH BUTTON CLICK
========================================================= */

if (publishBtn) {

    publishBtn.addEventListener(

        "click",

        async (event) => {

            event.preventDefault();

            await saveNotification(event);

        }

    );

} else {

    console.error(
        "ERROR: publishBtn was not found."
    );

}


/* =========================================================
   INITIAL FORM
========================================================= */

resetForm();


/* =========================================================
   INITIAL LOAD
========================================================= */

loadNotifications();


/* =========================================================
   DEBUG
========================================================= */

console.log(
    "✅ admin-news.js loaded successfully."
);


console.log(
    "✅ Publish button handler attached:",
    !!publishBtn
);