/* =========================================================
   TEACHER NOTIFICATIONS
   EBENEZER DAY STAR ACADEMY
========================================================= */


import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";


import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";


import {
    auth,
    db
} from "./firebase-config.js";



/* =========================================================
   DOM ELEMENTS
========================================================= */

const sidebar =
    document.getElementById("sidebar");


const menuToggle =
    document.getElementById("menuToggle");


const logoutBtn =
    document.getElementById("logoutBtn");


const topAvatar =
    document.getElementById("topAvatar");


const topTeacherName =
    document.getElementById("topTeacherName");


const notificationsContainer =
    document.getElementById(
        "notificationsContainer"
    );



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
   GET TIMESTAMP VALUE
========================================================= */

function getTimestampValue(timestamp) {

    if (!timestamp) {

        return 0;

    }


    try {

        if (
            typeof timestamp.toMillis ===
            "function"
        ) {

            return timestamp.toMillis();

        }


        if (
            typeof timestamp.toDate ===
            "function"
        ) {

            return timestamp
                .toDate()
                .getTime();

        }


        if (
            timestamp.seconds !== undefined
        ) {

            return (
                Number(timestamp.seconds) *
                1000
            );

        }


        const date =
            new Date(timestamp);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return 0;

        }


        return date.getTime();

    }

    catch (error) {

        console.error(
            "Timestamp error:",
            error
        );

        return 0;

    }

}



/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(timestamp) {

    const value =
        getTimestampValue(timestamp);


    if (!value) {

        return "";

    }


    try {

        return new Date(value)
            .toLocaleDateString(
                "en-NG",
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                }
            );

    }

    catch (error) {

        return "";

    }

}



/* =========================================================
   SHOW LOADING
========================================================= */

function showLoading() {

    notificationsContainer.innerHTML = `

        <div class="loading">

            Loading notifications...

        </div>

    `;

}



/* =========================================================
   SHOW EMPTY STATE
========================================================= */

function showEmptyState() {

    notificationsContainer.innerHTML = `

        <div class="empty-state">

            <div class="empty-icon">
                🔔
            </div>

            <h3>
                No Notifications
            </h3>

            <p>
                There are no new school
                announcements for teachers.
            </p>

        </div>

    `;

}



/* =========================================================
   SHOW ERROR
========================================================= */

function showError(error) {

    console.error(
        "Notification loading error:",
        error
    );


    const errorCode =
        error?.code || "";


    let message =
        "Unable to access school notifications.";


    if (
        errorCode ===
        "permission-denied"
    ) {

        message =
            "Permission denied. Please make sure the Firestore Rules have been published correctly.";

    }

    else if (
        errorCode ===
        "failed-precondition"
    ) {

        message =
            "Firestore requires an index for this notification query.";

    }

    else if (
        errorCode ===
        "unavailable"
    ) {

        message =
            "Firestore is temporarily unavailable. Please check your internet connection.";

    }

    else if (
        error?.message
    ) {

        message =
            error.message;

    }


    notificationsContainer.innerHTML = `

        <div class="empty-state">

            <div class="empty-icon">
                ⚠️
            </div>

            <h3>
                Unable to Load Notifications
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;

}



/* =========================================================
   LOAD TEACHER PROFILE
========================================================= */

async function loadTeacherProfile(user) {

    try {

        /*
         * First try the users document directly.
         *
         * The teacher login system creates:
         *
         * users/{uid}
         */

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        const userSnapshot =
            await getDoc(
                userRef
            );


        if (
            userSnapshot.exists()
        ) {

            const teacher =
                userSnapshot.data();


            const name =
                teacher.name ||
                user.displayName ||
                "Teacher";


            if (topTeacherName) {

                topTeacherName.textContent =
                    name;

            }


            if (topAvatar) {

                topAvatar.textContent =
                    name
                        .trim()
                        .charAt(0)
                        .toUpperCase() ||
                    "T";

            }


            return teacher;

        }


        /*
         * Fallback:
         * Search users by UID.
         */

        const usersRef =
            collection(
                db,
                "users"
            );


        const usersQuery =
            query(
                usersRef,
                where(
                    "uid",
                    "==",
                    user.uid
                )
            );


        const usersSnapshot =
            await getDocs(
                usersQuery
            );


        if (
            !usersSnapshot.empty
        ) {

            const teacher =
                usersSnapshot
                    .docs[0]
                    .data();


            const name =
                teacher.name ||
                "Teacher";


            if (topTeacherName) {

                topTeacherName.textContent =
                    name;

            }


            if (topAvatar) {

                topAvatar.textContent =
                    name
                        .trim()
                        .charAt(0)
                        .toUpperCase() ||
                    "T";

            }


            return teacher;

        }


        if (topTeacherName) {

            topTeacherName.textContent =
                "Teacher";

        }


        if (topAvatar) {

            topAvatar.textContent =
                "T";

        }


        return null;

    }

    catch (error) {

        console.error(
            "Teacher profile error:",
            error
        );


        if (topTeacherName) {

            topTeacherName.textContent =
                "Teacher";

        }


        if (topAvatar) {

            topAvatar.textContent =
                "T";

        }


        return null;

    }

}



/* =========================================================
   LOAD TEACHER NOTIFICATIONS
========================================================= */

async function loadNotifications() {

    try {

        showLoading();


        /* =================================================
           NOTIFICATIONS COLLECTION
        ================================================= */

        const notificationsRef =
            collection(
                db,
                "notifications"
            );


        /*
         * IMPORTANT:
         *
         * Admin notifications are saved as:
         *
         * audience: ["teacher"]
         *
         * Therefore we use:
         *
         * array-contains
         */

        const notificationsQuery =
            query(
                notificationsRef,

                where(
                    "audience",
                    "array-contains",
                    "teacher"
                )
            );


        const snapshot =
            await getDocs(
                notificationsQuery
            );


        const notifications = [];


        snapshot.forEach(
            notificationDoc => {

                const data =
                    notificationDoc.data();


                /*
                 * Ignore disabled notifications.
                 */

                if (
                    data.active === false
                ) {

                    return;

                }


                /*
                 * Ignore drafts.
                 *
                 * Older documents without a status
                 * are still allowed.
                 */

                if (
                    data.status &&
                    data.status !== "published"
                ) {

                    return;

                }


                notifications.push({

                    id:
                        notificationDoc.id,

                    ...data

                });

            }
        );


        /* =================================================
           SORT NEWEST FIRST
        ================================================= */

        notifications.sort(
            (a, b) => {

                const dateA =
                    getTimestampValue(
                        a.createdAt
                    );


                const dateB =
                    getTimestampValue(
                        b.createdAt
                    );


                return dateB - dateA;

            }
        );


        /* =================================================
           NO NOTIFICATIONS
        ================================================= */

        if (
            notifications.length === 0
        ) {

            showEmptyState();

            return;

        }


        /* =================================================
           DISPLAY NOTIFICATIONS
        ================================================= */

        notificationsContainer.innerHTML =
            notifications
                .map(
                    notification => {

                        const title =
                            notification.title ||
                            "School Announcement";


                        const message =
                            notification.message ||
                            notification.body ||
                            "No message provided.";


                        const date =
                            formatDate(
                                notification.createdAt
                            );


                        return `

                            <article
                                class="notification-card"
                            >

                                <div
                                    class="notification-header"
                                >

                                    <h3
                                        class="notification-title"
                                    >

                                        🔔
                                        ${escapeHTML(
                                            title
                                        )}

                                    </h3>


                                    ${
                                        date
                                            ? `
                                                <div
                                                    class="notification-date"
                                                >

                                                    ${escapeHTML(
                                                        date
                                                    )}

                                                </div>
                                              `
                                            : ""
                                    }

                                </div>


                                <div
                                    class="notification-message"
                                >

                                    ${escapeHTML(
                                        message
                                    )}

                                </div>


                                <span
                                    class="notification-badge"
                                >

                                    TEACHER NOTICE

                                </span>

                            </article>

                        `;

                    }
                )
                .join("");

    }

    catch (error) {

        showError(error);

    }

}



/* =========================================================
   LOGOUT
========================================================= */

async function logoutTeacher() {

    try {

        await signOut(
            auth
        );


        localStorage.removeItem(
            "teacherLoggedIn"
        );


        localStorage.removeItem(
            "teacherUid"
        );


        localStorage.removeItem(
            "teacherEmail"
        );


        localStorage.removeItem(
            "teacherName"
        );


        window.location.href =
            "teacher-login.html";

    }

    catch (error) {

        console.error(
            "Logout error:",
            error
        );


        if (
            typeof Swal !==
            "undefined"
        ) {

            Swal.fire({
                icon: "error",
                title: "Logout Failed",
                text: "Unable to logout. Please try again."
            });

        }

        else {

            alert(
                "Unable to logout. Please try again."
            );

        }

    }

}



/* =========================================================
   MOBILE SIDEBAR
========================================================= */

if (menuToggle) {

    menuToggle.addEventListener(
        "click",
        () => {

            if (sidebar) {

                sidebar.classList.toggle(
                    "open"
                );

            }

        }
    );

}



/* =========================================================
   LOGOUT BUTTON
========================================================= */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            if (
                typeof Swal !==
                "undefined"
            ) {

                const result =
                    await Swal.fire({

                        title:
                            "Logout?",

                        text:
                            "Are you sure you want to logout?",

                        icon:
                            "question",

                        showCancelButton:
                            true,

                        confirmButtonText:
                            "Yes, Logout",

                        cancelButtonText:
                            "Cancel",

                        confirmButtonColor:
                            "#0b1f3a"

                    });


                if (
                    result.isConfirmed
                ) {

                    await logoutTeacher();

                }

            }

            else {

                const confirmed =
                    confirm(
                        "Are you sure you want to logout?"
                    );


                if (confirmed) {

                    await logoutTeacher();

                }

            }

        }
    );

}



/* =========================================================
   AUTHENTICATION
========================================================= */

onAuthStateChanged(
    auth,
    async user => {

        /*
         * No logged-in user
         */

        if (!user) {

            window.location.href =
                "teacher-login.html";

            return;

        }


        /* =================================================
           REFRESH AUTH USER
        ================================================= */

        try {

            await user.reload();

        }

        catch (error) {

            console.error(
                "User reload error:",
                error
            );

        }


        /*
         * Firebase may return the old user
         * object after reload, so get the
         * current user again.
         */

        const currentUser =
            auth.currentUser;


        if (!currentUser) {

            window.location.href =
                "teacher-login.html";

            return;

        }


        /* =================================================
           EMAIL VERIFICATION
        ================================================= */

        if (
            !currentUser.emailVerified
        ) {

            await signOut(
                auth
            );


            window.location.href =
                "teacher-login.html";

            return;

        }


        /* =================================================
           LOAD TEACHER PROFILE
        ================================================= */

        await loadTeacherProfile(
            currentUser
        );


        /* =================================================
           LOAD NOTIFICATIONS
        ================================================= */

        await loadNotifications();

    }
);