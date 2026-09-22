/* =========================================================
   TEACHER DASHBOARD
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
    doc,
    getDoc,
    getDocs
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

const welcomeName =
    document.getElementById("welcomeName");

const classCount =
    document.getElementById("classCount");

const subjectCount =
    document.getElementById("subjectCount");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const profilePhone =
    document.getElementById("profilePhone");

const profileSubject =
    document.getElementById("profileSubject");

const classList =
    document.getElementById("classList");

const resultsSection =
    document.getElementById("results");

const attendanceSection =
    document.getElementById("attendance");


/* =========================================================
   CURRENT TEACHER
========================================================= */

let currentTeacher = null;


/* =========================================================
   SHOW MESSAGE
========================================================= */

function showMessage(
    title,
    text,
    icon = "info"
) {

    if (typeof Swal !== "undefined") {

        Swal.fire({
            title: title,
            text: text,
            icon: icon,
            confirmButtonColor: "#0b1f3a"
        });

    } else {

        alert(
            `${title}\n\n${text}`
        );

    }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
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
   COUNT REAL STUDENTS IN A CLASS
=========================================================

   Students are linked to classes using:

   students.classId

   Example:

   classId: "CLS-002"

========================================================= */

async function getRealStudentCount(
    classId
) {

    try {

        if (!classId) {

            return 0;

        }


        const studentsRef =
            collection(
                db,
                "students"
            );


        const studentsQuery =
            query(
                studentsRef,
                where(
                    "classId",
                    "==",
                    classId
                )
            );


        const studentsSnap =
            await getDocs(
                studentsQuery
            );


        return studentsSnap.size;

    }

    catch (error) {

        console.error(
            "Error counting students:",
            error
        );

        return 0;

    }

}


/* =========================================================
   LOAD TEACHER PROFILE
========================================================= */

async function loadTeacherProfile(
    user
) {

    try {

        const teacherUserRef =
            doc(
                db,
                "users",
                user.uid
            );


        const teacherUserSnap =
            await getDoc(
                teacherUserRef
            );


        if (!teacherUserSnap.exists()) {

            showMessage(
                "Teacher Profile Not Found",
                "Your teacher account information could not be found.",
                "error"
            );

            return;

        }


        currentTeacher =
            teacherUserSnap.data();


        const teacherName =
            currentTeacher.name ||
            "Teacher";


        const teacherEmail =
            currentTeacher.email ||
            user.email ||
            "No email";


        const teacherPhone =
            currentTeacher.phone ||
            "Not provided";


        const teacherSubject =
            currentTeacher.subject ||
            "Not assigned";


        const assignedClassIds =
            Array.isArray(
                currentTeacher.assignedClassIds
            )
                ? currentTeacher.assignedClassIds
                : [];


        /* =====================================================
           PROFILE
        ===================================================== */

        if (profileName) {

            profileName.textContent =
                teacherName;

        }


        if (profileEmail) {

            profileEmail.textContent =
                teacherEmail;

        }


        if (profilePhone) {

            profilePhone.textContent =
                teacherPhone;

        }


        if (profileSubject) {

            profileSubject.textContent =
                teacherSubject;

        }


        /* =====================================================
           TOP BAR
        ===================================================== */

        if (topTeacherName) {

            topTeacherName.textContent =
                teacherName;

        }


        if (welcomeName) {

            welcomeName.textContent =
                `Welcome, ${teacherName}!`;

        }


        if (topAvatar) {

            const firstLetter =
                teacherName
                    .trim()
                    .charAt(0)
                    .toUpperCase();


            topAvatar.textContent =
                firstLetter || "T";

        }


        /* =====================================================
           STATISTICS
        ===================================================== */

        if (classCount) {

            classCount.textContent =
                assignedClassIds.length;

        }


        if (subjectCount) {

            subjectCount.textContent =
                teacherSubject &&
                teacherSubject !== "Not assigned"
                    ? "1"
                    : "0";

        }


        /* =====================================================
           LOAD ASSIGNED CLASSES
        ===================================================== */

        await loadAssignedClasses(
            assignedClassIds,
            teacherSubject
        );


        /* =====================================================
           RESULTS MANAGEMENT
        ===================================================== */

        buildResultsManagement(
            assignedClassIds,
            teacherSubject
        );


        /* =====================================================
           ATTENDANCE MANAGEMENT
        ===================================================== */

        buildAttendanceManagement(
            assignedClassIds
        );

    }

    catch (error) {

        console.error(
            "Teacher profile error:",
            error
        );


        showMessage(
            "Error",
            "Unable to load your teacher profile.",
            "error"
        );

    }

}


/* =========================================================
   LOAD ASSIGNED CLASSES
========================================================= */

async function loadAssignedClasses(
    assignedClassIds,
    teacherSubject
) {

    if (!classList) {

        return;

    }


    if (
        !Array.isArray(
            assignedClassIds
        ) ||
        assignedClassIds.length === 0
    ) {

        classList.innerHTML = `

            <div class="no-data">

                You have no classes assigned yet.

            </div>

        `;

        return;

    }


    classList.innerHTML = `

        <div class="no-data">

            Loading assigned classes...

        </div>

    `;


    const classes = [];


    /* =====================================================
       LOAD EACH ASSIGNED CLASS
    ===================================================== */

    for (
        const classId of assignedClassIds
    ) {

        try {

            const classRef =
                doc(
                    db,
                    "classes",
                    classId
                );


            const classSnap =
                await getDoc(
                    classRef
                );


            if (!classSnap.exists()) {

                continue;

            }


            const classData =
                classSnap.data();


            /* =================================================
               COUNT ACTUAL STUDENTS
            ================================================= */

            const realStudentCount =
                await getRealStudentCount(
                    classId
                );


            classes.push({

                id:
                    classId,

                name:
                    classData.name ||
                    "Unnamed Class",

                section:
                    classData.section ||
                    "",

                status:
                    classData.status ||
                    "Active",

                studentCount:
                    realStudentCount,

                maxStudents:
                    Number(
                        classData.maxStudents ||
                        0
                    )

            });

        }

        catch (error) {

            console.error(
                `Error loading class ${classId}:`,
                error
            );

        }

    }


    /* =====================================================
       NO CLASS DATA
    ===================================================== */

    if (
        classes.length === 0
    ) {

        classList.innerHTML = `

            <div class="no-data">

                No assigned class information found.

            </div>

        `;

        return;

    }


    /* =====================================================
       SORT
    ===================================================== */

    classes.sort(
        (a, b) =>
            a.name.localeCompare(
                b.name
            )
    );


    /* =====================================================
       DISPLAY
    ===================================================== */

    classList.innerHTML =
        classes.map(
            classItem => {

                const classId =
                    encodeURIComponent(
                        classItem.id
                    );


                return `

                    <div class="class-item">

                        <div class="class-name">

                            ${escapeHTML(
                                classItem.name
                            )}

                        </div>


                        <div class="class-subject">

                            Subject:
                            ${escapeHTML(
                                teacherSubject ||
                                "Not assigned"
                            )}

                        </div>


                        <div class="class-subject">

                            👨‍🎓
                            ${classItem.studentCount}
                            student(s)

                        </div>


                        <div class="class-subject">

                            Status:
                            ${escapeHTML(
                                classItem.status
                            )}

                        </div>


                        <div class="dashboard-class-actions">

                            <a
                                href="teacher-results.html?classId=${classId}"
                                class="dashboard-action results-action"
                            >

                                📊 Enter Results

                            </a>


                            <a
                                href="teacher-attendance.html?classId=${classId}"
                                class="dashboard-action attendance-action"
                            >

                                📝 Take Attendance

                            </a>

                        </div>

                    </div>

                `;

            }
        ).join("");

}


/* =========================================================
   BUILD RESULTS MANAGEMENT
========================================================= */

function buildResultsManagement(
    assignedClassIds,
    teacherSubject
) {

    if (!resultsSection) {

        return;

    }


    const header =
        resultsSection.querySelector(
            ".card-header"
        );


    if (header) {

        header.innerHTML = `

            <h3>

                📊 Results Management

            </h3>


            <span>

                ${escapeHTML(
                    teacherSubject ||
                    "Academic Results"
                )}

            </span>

        `;

    }


    let container =
        document.getElementById(
            "dashboardResultsArea"
        );


    if (!container) {

        container =
            document.createElement(
                "div"
            );


        container.id =
            "dashboardResultsArea";


        resultsSection.appendChild(
            container
        );

    }


    if (
        !Array.isArray(
            assignedClassIds
        ) ||
        assignedClassIds.length === 0
    ) {

        container.innerHTML = `

            <div class="no-data">

                No class has been assigned
                to you for result entry.

            </div>

        `;

        return;

    }


    container.innerHTML = `

        <div class="dashboard-management-intro">

            <strong>

                Enter or update student results

            </strong>


            <p>

                Select one of your assigned classes
                below to enter results.

            </p>

        </div>


        <div
            id="dashboardResultsClasses"
            class="dashboard-management-list"
        >

            <div class="no-data">

                Loading classes...

            </div>

        </div>

    `;


    loadManagementClassCards(
        assignedClassIds,
        "dashboardResultsClasses",
        "results"
    );

}


/* =========================================================
   BUILD ATTENDANCE MANAGEMENT
========================================================= */

function buildAttendanceManagement(
    assignedClassIds
) {

    if (!attendanceSection) {

        return;

    }


    const header =
        attendanceSection.querySelector(
            ".card-header"
        );


    if (header) {

        header.innerHTML = `

            <h3>

                📝 Attendance Management

            </h3>


            <span>

                Student Attendance

            </span>

        `;

    }


    let container =
        document.getElementById(
            "dashboardAttendanceArea"
        );


    if (!container) {

        container =
            document.createElement(
                "div"
            );


        container.id =
            "dashboardAttendanceArea";


        attendanceSection.appendChild(
            container
        );

    }


    if (
        !Array.isArray(
            assignedClassIds
        ) ||
        assignedClassIds.length === 0
    ) {

        container.innerHTML = `

            <div class="no-data">

                No class has been assigned
                to you for attendance.

            </div>

        `;

        return;

    }


    container.innerHTML = `

        <div class="dashboard-management-intro">

            <strong>

                Manage student attendance

            </strong>


            <p>

                Select one of your assigned classes
                below to take attendance.

            </p>

        </div>


        <div
            id="dashboardAttendanceClasses"
            class="dashboard-management-list"
        >

            <div class="no-data">

                Loading classes...

            </div>

        </div>

    `;


    loadManagementClassCards(
        assignedClassIds,
        "dashboardAttendanceClasses",
        "attendance"
    );

}


/* =========================================================
   LOAD MANAGEMENT CLASS CARDS
========================================================= */

async function loadManagementClassCards(
    assignedClassIds,
    containerId,
    type
) {

    const container =
        document.getElementById(
            containerId
        );


    if (!container) {

        return;

    }


    const classes = [];


    for (
        const classId of assignedClassIds
    ) {

        try {

            const classRef =
                doc(
                    db,
                    "classes",
                    classId
                );


            const classSnap =
                await getDoc(
                    classRef
                );


            if (!classSnap.exists()) {

                continue;

            }


            const classData =
                classSnap.data();


            /* =================================================
               COUNT REAL STUDENTS
            ================================================= */

            const realStudentCount =
                await getRealStudentCount(
                    classId
                );


            classes.push({

                id:
                    classId,

                name:
                    classData.name ||
                    "Unnamed Class",

                studentCount:
                    realStudentCount

            });

        }

        catch (error) {

            console.error(
                `Management class error for ${classId}:`,
                error
            );

        }

    }


    /* =====================================================
       NO DATA
    ===================================================== */

    if (
        classes.length === 0
    ) {

        container.innerHTML = `

            <div class="no-data">

                No assigned classes found.

            </div>

        `;

        return;

    }


    /* =====================================================
       SORT
    ===================================================== */

    classes.sort(
        (a, b) =>
            a.name.localeCompare(
                b.name
            )
    );


    /* =====================================================
       DISPLAY
    ===================================================== */

    container.innerHTML =
        classes.map(
            classItem => {

                const classId =
                    encodeURIComponent(
                        classItem.id
                    );


                /* =============================================
                   RESULTS
                ============================================= */

                if (
                    type === "results"
                ) {

                    return `

                        <div class="management-class-card">

                            <div>

                                <div class="management-class-name">

                                    ${escapeHTML(
                                        classItem.name
                                    )}

                                </div>


                                <div class="management-class-info">

                                    👨‍🎓
                                    ${classItem.studentCount}
                                    student(s)

                                </div>

                            </div>


                            <a
                                href="teacher-results.html?classId=${classId}"
                                class="dashboard-management-btn results-management-btn"
                            >

                                📊 Enter Results

                            </a>

                        </div>

                    `;

                }


                /* =============================================
                   ATTENDANCE
                ============================================= */

                return `

                    <div class="management-class-card">

                        <div>

                            <div class="management-class-name">

                                ${escapeHTML(
                                    classItem.name
                                )}

                            </div>


                            <div class="management-class-info">

                                👨‍🎓
                                ${classItem.studentCount}
                                student(s)

                            </div>

                        </div>


                        <a
                            href="teacher-attendance.html?classId=${classId}"
                            class="dashboard-management-btn attendance-management-btn"
                        >

                            📝 Take Attendance

                        </a>

                    </div>

                `;

            }
        ).join("");

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


        showMessage(
            "Logout Error",
            "Unable to log out. Please try again.",
            "error"
        );

    }

}


/* =========================================================
   MOBILE MENU
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
   CLOSE MOBILE MENU
========================================================= */

document
    .querySelectorAll(
        ".sidebar-menu a"
    )
    .forEach(
        link => {

            link.addEventListener(
                "click",
                () => {

                    if (
                        window.innerWidth <= 700
                    ) {

                        if (sidebar) {

                            sidebar.classList.remove(
                                "open"
                            );

                        }

                    }

                }
            );

        }
    );


/* =========================================================
   LOGOUT BUTTON
========================================================= */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            if (
                typeof Swal !== "undefined"
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
                            "#0b1f3a",

                        cancelButtonColor:
                            "#777"

                    });


                if (
                    result.isConfirmed
                ) {

                    await logoutTeacher();

                }

            } else {

                await logoutTeacher();

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

        /* =================================================
           NOT LOGGED IN
        ================================================= */

        if (!user) {

            window.location.href =
                "teacher-login.html";

            return;

        }


        /* =================================================
           REFRESH USER
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


        /* =================================================
           VERIFY EMAIL
        ================================================= */

        if (!user.emailVerified) {

            showMessage(
                "Email Not Verified",
                "Please verify your email before accessing the Teacher Portal.",
                "warning"
            );


            await signOut(
                auth
            );


            window.location.href =
                "teacher-login.html";

            return;

        }


        /* =================================================
           LOAD PROFILE
        ================================================= */

        await loadTeacherProfile(
            user
        );

    }
);