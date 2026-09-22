/* =========================================================
   USER MANAGEMENT
   EBENEZER DAY STAR ACADEMY

   IMPORTANT:
   - This page is ADMIN ONLY.
   - The administrator remains logged in as administrator.
   - It does NOT use role-guard.js.
   - It does NOT redirect to teacher-login.html.
   - It does NOT redirect to parent-login.html.
   - It does NOT redirect to student-login.html.
   - It reads all users from Firestore.
========================================================= */

import {
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import {
    signOut
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
    auth,
    db
} from "./firebase-config.js";

import {
    adminReady
} from "./admin-guard.js";


/* =========================================================
   ELEMENTS
========================================================= */

const rows =
    document.getElementById("rows");

const userCount =
    document.getElementById("userCount");

const msg =
    document.getElementById("msg");

const searchUser =
    document.getElementById("searchUser");

const roleFilter =
    document.getElementById("roleFilter");

const statusFilter =
    document.getElementById("statusFilter");

const logoutButton =
    document.getElementById("logout");


/* =========================================================
   USERS DATA
========================================================= */

let allUsers = [];


/* =========================================================
   ADMIN AUTHENTICATION
=========================================================

   IMPORTANT:
   We use ONLY adminReady.

   There is no:
       requireRole()
       role-guard.js
       teacher login
       parent login
       student login
========================================================= */

try {

    await adminReady;

    console.log(
        "Admin authenticated successfully."
    );

} catch (error) {

    console.error(
        "Admin authentication failed:",
        error
    );

    /*
     * admin-guard.js handles the admin-login redirect.
     *
     * We do NOT perform any redirect here.
     */

    throw error;

}


/* =========================================================
   LOGOUT
========================================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();

            try {

                await signOut(auth);

                sessionStorage.clear();

                /*
                 * Logout always returns to ADMIN LOGIN.
                 */

                window.location.replace(
                    "admin-login.html"
                );

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

                showMessage(
                    "Unable to log out. Please try again.",
                    "error"
                );

            }

        }
    );

}


/* =========================================================
   LOAD ALL USERS
========================================================= */

async function loadUsers() {

    try {

        showMessage(
            "Loading users...",
            "info"
        );


        if (rows) {

            rows.innerHTML = `
                <tr>
                    <td
                        colspan="7"
                        style="text-align:center;padding:30px;"
                    >
                        Loading users...
                    </td>
                </tr>
            `;

        }


        const usersRef =
            collection(
                db,
                "users"
            );


        let snapshot;


        /* -------------------------------------------------
           First try ordered query
        ------------------------------------------------- */

        try {

            const usersQuery =
                query(
                    usersRef,
                    orderBy(
                        "createdAt",
                        "desc"
                    )
                );


            snapshot =
                await getDocs(
                    usersQuery
                );


        } catch (orderError) {

            /*
             * Some older users may not have createdAt.
             *
             * Therefore, load the collection without
             * orderBy if the ordered query fails.
             */

            console.warn(
                "Ordered users query failed. " +
                "Loading users without ordering.",
                orderError
            );


            snapshot =
                await getDocs(
                    usersRef
                );

        }


        /* -------------------------------------------------
           Convert Firestore documents into array
        ------------------------------------------------- */

        allUsers =
            snapshot.docs.map(
                documentSnapshot => {

                    return {

                        firestoreId:
                            documentSnapshot.id,

                        ...documentSnapshot.data()

                    };

                }
            );


        /* -------------------------------------------------
           Sort locally
        ------------------------------------------------- */

        allUsers.sort(
            (a, b) => {

                return (
                    getTime(
                        b.createdAt
                    ) -
                    getTime(
                        a.createdAt
                    )
                );

            }
        );


        clearMessage();

        renderUsers();


    } catch (error) {

        console.error(
            "Error loading users:",
            error
        );


        allUsers = [];

        renderUsers();


        showMessage(
            getFirebaseErrorMessage(error),
            "error"
        );

    }

}


/* =========================================================
   RENDER USERS
========================================================= */

function renderUsers() {

    const search =
        (
            searchUser?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const selectedRole =
        (
            roleFilter?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const selectedStatus =
        (
            statusFilter?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const filteredUsers =
        allUsers.filter(
            user => {

                const name =
                    getUserName(
                        user
                    )
                    .toLowerCase();


                const email =
                    String(
                        user.email || ""
                    )
                    .toLowerCase();


                const role =
                    String(
                        user.role || ""
                    )
                    .toLowerCase();


                const active =
                    user.active !== false;


                const status =
                    active
                        ? "active"
                        : "inactive";


                const matchesSearch =
                    !search ||
                    name.includes(search) ||
                    email.includes(search);


                const matchesRole =
                    !selectedRole ||
                    role === selectedRole;


                const matchesStatus =
                    !selectedStatus ||
                    status === selectedStatus;


                return (
                    matchesSearch &&
                    matchesRole &&
                    matchesStatus
                );

            }
        );


    /* -------------------------------------------------
       Update user count
    ------------------------------------------------- */

    if (userCount) {

        userCount.textContent =
            `${filteredUsers.length} user${
                filteredUsers.length === 1
                    ? ""
                    : "s"
            } found`;

    }


    /* -------------------------------------------------
       No users
    ------------------------------------------------- */

    if (!filteredUsers.length) {

        if (rows) {

            rows.innerHTML = `
                <tr>
                    <td
                        colspan="7"
                        style="
                            text-align:center;
                            padding:30px;
                        "
                    >
                        No users found.
                    </td>
                </tr>
            `;

        }

        return;

    }


    /* -------------------------------------------------
       Render rows
    ------------------------------------------------- */

    if (rows) {

        rows.innerHTML =
            filteredUsers
                .map(
                    (user, index) =>
                        createUserRow(
                            user,
                            index
                        )
                )
                .join("");

    }

}


/* =========================================================
   CREATE USER TABLE ROW
========================================================= */

function createUserRow(
    user,
    index
) {

    const name =
        escapeHTML(
            getUserName(user)
        );


    const email =
        escapeHTML(
            user.email ||
            "—"
        );


    const role =
        String(
            user.role ||
            "unknown"
        )
        .trim()
        .toLowerCase();


    const roleLabel =
        formatRole(
            role
        );


    const assignedClass =
        escapeHTML(
            getAssignedClasses(
                user
            )
        );


    const active =
        user.active !== false;


    const statusText =
        active
            ? "Active"
            : "Inactive";


    const statusClass =
        active
            ? "active"
            : "inactive";


    const createdDate =
        formatDate(
            user.createdAt
        );


    return `
        <tr>

            <td>
                ${index + 1}
            </td>

            <td>
                <strong>
                    ${name}
                </strong>
            </td>

            <td>
                ${email}
            </td>

            <td>
                <span
                    class="role-badge ${escapeHTML(role)}"
                >
                    ${roleLabel}
                </span>
            </td>

            <td>
                ${assignedClass || "—"}
            </td>

            <td>
                <span
                    class="status-badge ${statusClass}"
                >
                    ${statusText}
                </span>
            </td>

            <td>
                ${createdDate}
            </td>

        </tr>
    `;

}


/* =========================================================
   GET USER NAME
========================================================= */

function getUserName(user) {

    return (
        user.name ||
        user.fullName ||
        user.displayName ||
        user.username ||
        user.email ||
        "Unnamed User"
    );

}


/* =========================================================
   GET ASSIGNED CLASS
========================================================= */

function getAssignedClasses(user) {

    /* Teacher */

    if (
        Array.isArray(
            user.assignedClassIds
        ) &&
        user.assignedClassIds.length
    ) {

        return user.assignedClassIds.join(
            ", "
        );

    }


    /* Alternative teacher field */

    if (
        Array.isArray(
            user.assignedClasses
        ) &&
        user.assignedClasses.length
    ) {

        return user.assignedClasses.join(
            ", "
        );

    }


    /* Student */

    if (user.studentClass) {

        return String(
            user.studentClass
        );

    }


    /* Generic classId */

    if (user.classId) {

        return String(
            user.classId
        );

    }


    /* Parent children classes */

    if (
        Array.isArray(
            user.childrenClasses
        ) &&
        user.childrenClasses.length
    ) {

        return user.childrenClasses.join(
            ", "
        );

    }


    if (user.childClass) {

        return String(
            user.childClass
        );

    }


    return "";

}


/* =========================================================
   FORMAT ROLE
========================================================= */

function formatRole(role) {

    switch (role) {

        case "admin":
            return "Admin";

        case "teacher":
            return "Teacher";

        case "student":
            return "Student";

        case "parent":
            return "Parent";

        default:

            if (!role) {
                return "Unknown";
            }

            return (
                role.charAt(0).toUpperCase() +
                role.slice(1)
            );

    }

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(timestamp) {

    if (!timestamp) {

        return "—";

    }


    try {

        let date = null;


        /* Firestore Timestamp */

        if (
            typeof timestamp.toDate ===
            "function"
        ) {

            date =
                timestamp.toDate();

        }


        /* JavaScript Date */

        else if (
            timestamp instanceof Date
        ) {

            date =
                timestamp;

        }


        /* Milliseconds */

        else if (
            typeof timestamp ===
            "number"
        ) {

            date =
                new Date(
                    timestamp
                );

        }


        /* String */

        else if (
            typeof timestamp ===
            "string"
        ) {

            date =
                new Date(
                    timestamp
                );

        }


        if (
            !date ||
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "—";

        }


        return date.toLocaleDateString(
            "en-NG",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );


    } catch (error) {

        return "—";

    }

}


/* =========================================================
   GET TIME
========================================================= */

function getTime(timestamp) {

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
            timestamp instanceof Date
        ) {

            return timestamp.getTime();

        }


        if (
            typeof timestamp ===
            "number"
        ) {

            return timestamp;

        }


        if (
            typeof timestamp ===
            "string"
        ) {

            const value =
                new Date(
                    timestamp
                ).getTime();


            return Number.isNaN(
                value
            )
                ? 0
                : value;

        }

    } catch (error) {

        return 0;

    }


    return 0;

}


/* =========================================================
   SEARCH
========================================================= */

if (searchUser) {

    searchUser.addEventListener(
        "input",
        renderUsers
    );

}


/* =========================================================
   ROLE FILTER
========================================================= */

if (roleFilter) {

    roleFilter.addEventListener(
        "change",
        renderUsers
    );

}


/* =========================================================
   STATUS FILTER
========================================================= */

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        renderUsers
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
    .replaceAll(
        "&",
        "&amp;"
    )
    .replaceAll(
        "<",
        "&lt;"
    )
    .replaceAll(
        ">",
        "&gt;"
    )
    .replaceAll(
        '"',
        "&quot;"
    )
    .replaceAll(
        "'",
        "&#039;"
    );

}


/* =========================================================
   SHOW MESSAGE
========================================================= */

function showMessage(
    text,
    type = "info"
) {

    if (!msg) {
        return;
    }


    msg.textContent =
        text || "";


    msg.className =
        `message ${type}`;

}


/* =========================================================
   CLEAR MESSAGE
========================================================= */

function clearMessage() {

    if (!msg) {
        return;
    }


    msg.textContent = "";

    msg.className =
        "message";

}


/* =========================================================
   FIREBASE ERROR MESSAGE
========================================================= */

function getFirebaseErrorMessage(
    error
) {

    const code =
        error?.code ||
        "";


    switch (code) {

        case "permission-denied":

            return (
                "Permission denied. " +
                "Your Firestore rules must allow " +
                "the administrator to read the users collection."
            );


        case "unauthenticated":

            return (
                "The administrator session has expired. " +
                "Please log in again."
            );


        case "unavailable":

            return (
                "Firebase is temporarily unavailable. " +
                "Check your internet connection."
            );


        case "failed-precondition":

            return (
                "Firestore requires an index or " +
                "configuration change."
            );


        default:

            return (
                error?.message ||
                "Unable to load users."
            );

    }

}


/* =========================================================
   START PAGE
========================================================= */

await loadUsers();