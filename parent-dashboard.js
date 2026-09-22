// ============================================================
// PARENT DASHBOARD
// EBENEZER DAY STAR ACADEMY
//
// IMPORTANT:
// Parent email verification is NOT required.
// ============================================================


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
    getDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";


import {
    auth,
    db
} from "./firebase-config.js";



// ============================================================
// SCRIPT CHECK
// ============================================================

console.log(
    "========================================"
);

console.log(
    "PARENT DASHBOARD JAVASCRIPT STARTED"
);

console.log(
    "========================================"
);



// ============================================================
// ELEMENTS
// ============================================================

const welcomeText =
    document.getElementById("welcomeText");


const parentEmail =
    document.getElementById("parentEmail");


const errorMessage =
    document.getElementById("errorMessage");


const childrenCount =
    document.getElementById("childrenCount");


const overviewChildrenCount =
    document.getElementById("overviewChildrenCount");


const childrenContainer =
    document.getElementById("childrenContainer");


const portalNotifications =
    document.getElementById("portalNotifications");


const logoutBtn =
    document.getElementById("logoutBtn");



// ============================================================
// CHECK IMPORTANT ELEMENTS
// ============================================================

console.log(
    "Parent email element:",
    parentEmail
);

console.log(
    "Children container:",
    childrenContainer
);

console.log(
    "Children count:",
    childrenCount
);

console.log(
    "Overview children count:",
    overviewChildrenCount
);

console.log(
    "Error element:",
    errorMessage
);



// ============================================================
// VARIABLES
// ============================================================

let notificationsUnsubscribe =
    null;


let dashboardStarted =
    false;



// ============================================================
// SHOW ERROR
// ============================================================

function showError(message) {

    console.error(
        "PARENT DASHBOARD ERROR:",
        message
    );


    if (!errorMessage) {
        return;
    }


    errorMessage.textContent =
        message;


    errorMessage.style.display =
        "block";
}



// ============================================================
// HIDE ERROR
// ============================================================

function hideError() {

    if (!errorMessage) {
        return;
    }


    errorMessage.textContent =
        "";


    errorMessage.style.display =
        "none";
}



// ============================================================
// ESCAPE HTML
// ============================================================

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



// ============================================================
// FIREBASE ERROR MESSAGE
// ============================================================

function getErrorMessage(error) {

    console.error(
        "Firebase error:",
        error
    );


    if (
        error &&
        error.code ===
            "permission-denied"
    ) {

        return (
            "You do not have permission to access this information. " +
            "Please contact the school administrator."
        );
    }


    if (
        error &&
        error.code ===
            "failed-precondition"
    ) {

        return (
            "Firebase requires an additional database index for this request."
        );
    }


    if (
        error &&
        error.code ===
            "unavailable"
    ) {

        return (
            "Firebase is temporarily unavailable. " +
            "Please check your internet connection."
        );
    }


    if (
        error &&
        error.code ===
            "unauthenticated"
    ) {

        return (
            "Your login session has expired. " +
            "Please log in again."
        );
    }


    return (
        error?.message ||
        "Unable to load this information."
    );
}



// ============================================================
// UPDATE CHILD COUNT
// ============================================================

function updateChildrenCount(count) {

    const value =
        String(count);


    if (childrenCount) {

        childrenCount.textContent =
            value;
    }


    if (overviewChildrenCount) {

        overviewChildrenCount.textContent =
            value;
    }

}



// ============================================================
// LOAD PARENT PROFILE
// ============================================================

async function loadParentProfile(user) {

    console.log(
        "Loading parent profile..."
    );


    console.log(
        "Parent UID:",
        user.uid
    );


    // --------------------------------------------------------
    // SHOW AUTH EMAIL IMMEDIATELY
    // --------------------------------------------------------

    if (parentEmail) {

        parentEmail.textContent =
            user.email ||
            "Email unavailable";
    }


    // --------------------------------------------------------
    // FIRESTORE USER PROFILE
    // --------------------------------------------------------

    const userRef =
        doc(
            db,
            "users",
            user.uid
        );


    console.log(
        "Reading users document..."
    );


    const userSnapshot =
        await getDoc(
            userRef
        );


    console.log(
        "Users document request completed."
    );


    if (
        !userSnapshot.exists()
    ) {

        throw new Error(
            "Your parent profile was not found in the users collection. Please contact the school administrator."
        );
    }


    const parent =
        userSnapshot.data();


    console.log(
        "Parent profile:",
        parent
    );


    // --------------------------------------------------------
    // CHECK ROLE
    // --------------------------------------------------------

    const role =
        String(
            parent.role || ""
        )
        .trim()
        .toLowerCase();


    if (
        role !== "parent"
    ) {

        throw new Error(
            "This account is not registered as a parent account."
        );
    }


    // --------------------------------------------------------
    // CHECK ACTIVE STATUS
    // --------------------------------------------------------

    if (
        parent.active === false
    ) {

        throw new Error(
            "Your parent account has been deactivated. Please contact the school."
        );
    }


    // --------------------------------------------------------
    // DISPLAY NAME
    // --------------------------------------------------------

    const name =
        parent.name ||
        parent.fullName ||
        user.displayName ||
        "Parent";


    if (welcomeText) {

        welcomeText.textContent =
            `Welcome, ${name}`;
    }


    // --------------------------------------------------------
    // DISPLAY EMAIL
    // --------------------------------------------------------

    if (parentEmail) {

        parentEmail.textContent =
            user.email ||
            parent.email ||
            "Email unavailable";
    }


    // --------------------------------------------------------
    // LOAD CHILDREN
    // --------------------------------------------------------

    await loadChildren(
        user.uid
    );


    // --------------------------------------------------------
    // LOAD NOTIFICATIONS
    // --------------------------------------------------------

    loadNotifications();


    console.log(
        "Parent profile loaded successfully."
    );
}



// ============================================================
// LOAD CHILDREN
// ============================================================

async function loadChildren(parentUid) {

    console.log(
        "========================================"
    );


    console.log(
        "STARTING CHILDREN LOAD"
    );


    console.log(
        "Parent UID:",
        parentUid
    );


    console.log(
        "========================================"
    );


    if (!childrenContainer) {

        console.error(
            "childrenContainer was not found."
        );

        return;
    }


    // --------------------------------------------------------
    // LOADING DISPLAY
    // --------------------------------------------------------

    childrenContainer.innerHTML = `

        <div class="portal-loading">

            <div class="loading-spinner"></div>

            <p>
                Loading children's records...
            </p>

        </div>

    `;


    try {

        // ----------------------------------------------------
        // SEARCH STUDENTS
        // ----------------------------------------------------

        console.log(
            "Creating students query..."
        );


        const studentsQuery =
            query(
                collection(
                    db,
                    "students"
                ),

                where(
                    "parentUid",
                    "==",
                    parentUid
                )
            );


        console.log(
            "Students query created."
        );


        console.log(
            "Requesting students from Firestore..."
        );


        const snapshot =
            await getDocs(
                studentsQuery
            );


        console.log(
            "Students request completed."
        );


        console.log(
            "Number of students found:",
            snapshot.size
        );


        // ----------------------------------------------------
        // UPDATE COUNT
        // ----------------------------------------------------

        updateChildrenCount(
            snapshot.size
        );


        // ----------------------------------------------------
        // NO CHILDREN
        // ----------------------------------------------------

        if (
            snapshot.empty
        ) {

            childrenContainer.innerHTML = `

                <div class="empty-state">

                    <h3>
                        No children linked
                    </h3>

                    <p>
                        No student is currently
                        linked to this parent account.
                    </p>

                    <p>
                        The student's record must contain
                        the parent's Firebase UID.
                    </p>

                </div>

            `;


            console.log(
                "No students are linked to this parent."
            );


            return;
        }


        // ----------------------------------------------------
        // DISPLAY CHILDREN
        // ----------------------------------------------------

        const childrenHTML =
            snapshot.docs

                .map(
                    studentDocument => {

                        const student =
                            studentDocument.data();


                        // ------------------------------------
                        // NAME
                        // ------------------------------------

                        const fullName =
                            `${student.firstName || ""} ${student.lastName || ""}`
                                .trim()
                            ||
                            student.name
                            ||
                            "Student";


                        // ------------------------------------
                        // STUDENT ID
                        // ------------------------------------

                        const studentId =
                            student.studentId ||
                            student.id ||
                            studentDocument.id;


                        // ------------------------------------
                        // CLASS
                        // ------------------------------------

                        const studentClass =
                            student.studentClass ||
                            student.className ||
                            student.class ||
                            "Not assigned";


                        // ------------------------------------
                        // GENDER
                        // ------------------------------------

                        const gender =
                            student.gender ||
                            "Not specified";


                        // ------------------------------------
                        // STATUS
                        // ------------------------------------

                        const status =
                            student.status ||
                            "Active";


                        // ------------------------------------
                        // RETURN CARD
                        // ------------------------------------

                        return `

                            <div
                                class="child-card"
                                data-student-id="${escapeHTML(
                                    studentDocument.id
                                )}"
                            >

                                <div
                                    class="child-card-header"
                                >

                                    <div
                                        class="child-avatar"
                                    >

                                        ${escapeHTML(
                                            fullName
                                                .charAt(0)
                                                .toUpperCase()
                                        )}

                                    </div>


                                    <div>

                                        <h3>
                                            ${escapeHTML(
                                                fullName
                                            )}
                                        </h3>


                                        <p>
                                            Student ID:
                                            ${escapeHTML(
                                                studentId
                                            )}
                                        </p>

                                    </div>

                                </div>


                                <div
                                    class="child-details"
                                >

                                    <div
                                        class="child-detail"
                                    >

                                        <span>
                                            Class
                                        </span>


                                        <strong>
                                            ${escapeHTML(
                                                studentClass
                                            )}
                                        </strong>

                                    </div>


                                    <div
                                        class="child-detail"
                                    >

                                        <span>
                                            Gender
                                        </span>


                                        <strong>
                                            ${escapeHTML(
                                                gender
                                            )}
                                        </strong>

                                    </div>


                                    <div
                                        class="child-detail"
                                    >

                                        <span>
                                            Status
                                        </span>


                                        <strong>
                                            ${escapeHTML(
                                                status
                                            )}
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        `;

                    }
                )

                .join("");


        childrenContainer.innerHTML =
            childrenHTML;


        console.log(
            "Children displayed successfully."
        );

    }

    catch (error) {

        console.error(
            "Children loading failed:",
            error
        );


        updateChildrenCount(
            0
        );


        childrenContainer.innerHTML = `

            <div class="empty-state">

                <h3>
                    Unable to load children
                </h3>

                <p>
                    ${escapeHTML(
                        getErrorMessage(error)
                    )}
                </p>

            </div>

        `;
    }
}



// ============================================================
// LOAD NOTIFICATIONS
// ============================================================

function loadNotifications() {

    if (!portalNotifications) {

        console.log(
            "Notifications container not found."
        );

        return;
    }


    // --------------------------------------------------------
    // STOP OLD LISTENER
    // --------------------------------------------------------

    if (
        notificationsUnsubscribe
    ) {

        notificationsUnsubscribe();


        notificationsUnsubscribe =
            null;
    }


    // --------------------------------------------------------
    // LOADING DISPLAY
    // --------------------------------------------------------

    portalNotifications.innerHTML = `

        <div class="portal-loading">

            <div class="loading-spinner"></div>

            <span>
                Loading notifications...
            </span>

        </div>

    `;


    try {

        console.log(
            "Starting parent notification listener..."
        );


        const notificationsQuery =
            query(
                collection(
                    db,
                    "notifications"
                ),

                where(
                    "audience",
                    "array-contains",
                    "parent"
                )
            );


        notificationsUnsubscribe =
            onSnapshot(

                notificationsQuery,


                snapshot => {

                    console.log(
                        "Notifications received:",
                        snapshot.size
                    );


                    const notifications =
                        [];


                    snapshot.forEach(
                        notificationDocument => {

                            const data =
                                notificationDocument.data();


                            // --------------------------------
                            // PUBLISHED ONLY
                            // --------------------------------

                            if (
                                data.status &&
                                data.status !==
                                    "published"
                            ) {

                                return;
                            }


                            // --------------------------------
                            // ACTIVE ONLY
                            // --------------------------------

                            if (
                                data.active === false
                            ) {

                                return;
                            }


                            notifications.push({

                                id:
                                    notificationDocument.id,

                                ...data

                            });

                        }
                    );


                    // ------------------------------------------------
                    // SORT NEWEST FIRST
                    // ------------------------------------------------

                    notifications.sort(
                        (a, b) => {

                            const aTime =
                                a.createdAt?.toMillis?.() ||
                                0;


                            const bTime =
                                b.createdAt?.toMillis?.() ||
                                0;


                            return (
                                bTime -
                                aTime
                            );

                        }
                    );


                    // ------------------------------------------------
                    // NO NOTIFICATIONS
                    // ------------------------------------------------

                    if (
                        notifications.length ===
                            0
                    ) {

                        portalNotifications.innerHTML = `

                            <div
                                class="notification-empty"
                            >

                                <strong>
                                    No notifications yet
                                </strong>


                                <p>
                                    School notifications
                                    will appear here.
                                </p>

                            </div>

                        `;


                        return;
                    }


                    // ------------------------------------------------
                    // DISPLAY NOTIFICATIONS
                    // ------------------------------------------------

                    portalNotifications.innerHTML =
                        notifications

                            .map(
                                notification => {

                                    let date =
                                        "Recently";


                                    if (
                                        notification.createdAt &&

                                        typeof
                                            notification
                                                .createdAt
                                                .toDate ===
                                            "function"
                                    ) {

                                        date =
                                            notification
                                                .createdAt
                                                .toDate()
                                                .toLocaleDateString(
                                                    "en-NG",
                                                    {
                                                        day:
                                                            "numeric",

                                                        month:
                                                            "short",

                                                        year:
                                                            "numeric"
                                                    }
                                                );
                                    }


                                    return `

                                        <div
                                            class="notification-item"
                                        >

                                            <div
                                                class="notification-item-header"
                                            >

                                                <div
                                                    class="notification-item-icon"
                                                >
                                                    🔔
                                                </div>


                                                <div>

                                                    <h3>
                                                        ${escapeHTML(
                                                            notification.title ||
                                                            "School Notification"
                                                        )}
                                                    </h3>


                                                    <span>
                                                        ${escapeHTML(
                                                            date
                                                        )}
                                                    </span>

                                                </div>

                                            </div>


                                            <p>
                                                ${escapeHTML(
                                                    notification.message ||
                                                    notification.body ||
                                                    ""
                                                )}
                                            </p>

                                        </div>

                                    `;

                                }
                            )

                            .join("");

                },


                error => {

                    console.error(
                        "Notification listener failed:",
                        error
                    );


                    portalNotifications.innerHTML = `

                        <div
                            class="notification-error"
                        >

                            <strong>
                                Unable to load notifications
                            </strong>


                            <p>
                                ${escapeHTML(
                                    getErrorMessage(error)
                                )}
                            </p>

                        </div>

                    `;

                }

            );

    }

    catch (error) {

        console.error(
            "Notification setup failed:",
            error
        );


        portalNotifications.innerHTML = `

            <div
                class="notification-error"
            >

                <strong>
                    Unable to load notifications
                </strong>


                <p>
                    ${escapeHTML(
                        getErrorMessage(error)
                    )}
                </p>

            </div>

        `;
    }
}



// ============================================================
// LOGOUT
// ============================================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",

        async () => {

            try {

                // ---------------------------------------------
                // STOP NOTIFICATION LISTENER
                // ---------------------------------------------

                if (
                    notificationsUnsubscribe
                ) {

                    notificationsUnsubscribe();


                    notificationsUnsubscribe =
                        null;
                }


                // ---------------------------------------------
                // SIGN OUT
                // ---------------------------------------------

                await signOut(
                    auth
                );


                // ---------------------------------------------
                // RETURN TO LOGIN
                // ---------------------------------------------

                window.location.href =
                    "parent-login.html";

            }

            catch (error) {

                console.error(
                    "Logout error:",
                    error
                );


                showError(
                    "Unable to log out. Please try again."
                );
            }
        }
    );
}



// ============================================================
// SERVICE NAVIGATION
// ============================================================

function openService(service) {

    if (
        service ===
        "results"
    ) {

        window.location.href =
            "parent-results.html";

        return;
    }


    if (
        service ===
        "attendance"
    ) {

        window.location.href =
            "parent-attendance.html";

        return;
    }


    if (
        service ===
        "fees"
    ) {

        window.location.href =
            "parent-fees.html";

        return;
    }


    if (
        service ===
        "reportCards"
    ) {

        window.location.href =
            "parent-report-cards.html";

        return;
    }
}



// ============================================================
// DATA-SERVICE BUTTONS
// ============================================================

document
    .querySelectorAll(
        "[data-service]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",

                () => {

                    openService(
                        button.dataset.service
                    );

                }
            );

        }
    );



// ============================================================
// OPTIONAL OLD BUTTON IDs
// ============================================================

const resultsBtn =
    document.getElementById(
        "resultsBtn"
    );


const attendanceBtn =
    document.getElementById(
        "attendanceBtn"
    );


const feesBtn =
    document.getElementById(
        "feesBtn"
    );


const reportCardsBtn =
    document.getElementById(
        "reportCardsBtn"
    );



if (resultsBtn) {

    resultsBtn.addEventListener(
        "click",

        () => {

            openService(
                "results"
            );

        }
    );
}



if (attendanceBtn) {

    attendanceBtn.addEventListener(
        "click",

        () => {

            openService(
                "attendance"
            );

        }
    );
}



if (feesBtn) {

    feesBtn.addEventListener(
        "click",

        () => {

            openService(
                "fees"
            );

        }
    );
}



if (reportCardsBtn) {

    reportCardsBtn.addEventListener(
        "click",

        () => {

            openService(
                "reportCards"
            );

        }
    );
}



// ============================================================
// AUTHENTICATION
// ============================================================

console.log(
    "Starting Firebase authentication listener..."
);


onAuthStateChanged(

    auth,

    async user => {

        console.log(
            "========================================"
        );


        console.log(
            "AUTH STATE CHANGED"
        );


        console.log(
            "User:",
            user
        );


        console.log(
            "========================================"
        );


        // ----------------------------------------------------
        // NO USER
        // ----------------------------------------------------

        if (!user) {

            console.log(
                "No authenticated Firebase user."
            );


            if (parentEmail) {

                parentEmail.textContent =
                    "Not signed in";
            }


            if (childrenContainer) {

                childrenContainer.innerHTML = `

                    <div class="empty-state">

                        <h3>
                            Not signed in
                        </h3>

                        <p>
                            Please log in to access
                            the parent dashboard.
                        </p>

                    </div>

                `;
            }


            return;
        }


        // ----------------------------------------------------
        // PREVENT DUPLICATE START
        // ----------------------------------------------------

        if (dashboardStarted) {

            console.log(
                "Dashboard already started."
            );


            return;
        }


        dashboardStarted =
            true;


        hideError();


        // ----------------------------------------------------
        // DISPLAY EMAIL IMMEDIATELY
        // ----------------------------------------------------

        if (parentEmail) {

            parentEmail.textContent =
                user.email ||
                "Email unavailable";
        }


        try {

            console.log(
                "Authenticated user UID:",
                user.uid
            );


            console.log(
                "Authenticated email:",
                user.email
            );


            // ------------------------------------------------
            // REFRESH USER
            // ------------------------------------------------

            await user.reload();


            const currentUser =
                auth.currentUser;


            if (!currentUser) {

                throw new Error(
                    "Your Firebase login session could not be restored."
                );
            }


            // ------------------------------------------------
            // DISPLAY EMAIL AFTER REFRESH
            // ------------------------------------------------

            if (parentEmail) {

                parentEmail.textContent =
                    currentUser.email ||
                    "Email unavailable";
            }


            // =================================================
            // IMPORTANT
            //
            // NO EMAIL VERIFICATION CHECK HERE.
            //
            // Parents are allowed into the dashboard even
            // when Firebase reports:
            //
            // currentUser.emailVerified === false
            //
            // =================================================


            // ------------------------------------------------
            // LOAD PARENT PROFILE
            // ------------------------------------------------

            await loadParentProfile(
                currentUser
            );


            console.log(
                "========================================"
            );


            console.log(
                "PARENT DASHBOARD LOADED SUCCESSFULLY"
            );


            console.log(
                "========================================"
            );

        }

        catch (error) {

            console.error(
                "Dashboard loading failed:",
                error
            );


            dashboardStarted =
                false;


            if (parentEmail) {

                parentEmail.textContent =
                    user.email ||
                    "Unable to load email";
            }


            if (childrenContainer) {

                childrenContainer.innerHTML = `

                    <div class="empty-state">

                        <h3>
                            Unable to load dashboard
                        </h3>


                        <p>
                            ${escapeHTML(
                                getErrorMessage(error)
                            )}
                        </p>

                    </div>

                `;
            }


            showError(
                getErrorMessage(error)
            );
        }

    }
);



// ============================================================
// CLEANUP
// ============================================================

window.addEventListener(
    "beforeunload",

    () => {

        if (
            notificationsUnsubscribe
        ) {

            notificationsUnsubscribe();


            notificationsUnsubscribe =
                null;
        }

    }
);