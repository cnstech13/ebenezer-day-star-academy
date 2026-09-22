/* =========================================================
   EBENEZER DAY STAR ACADEMY
   TEACHER MY CLASSES
   FIREBASE FIRESTORE VERSION

   TEACHERS CAN ONLY LOAD THEIR ASSIGNED CLASSES
========================================================= */

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase-config.js";


// =========================================================
// ELEMENTS
// =========================================================

const classGrid =
    document.getElementById("classGrid");

const teacherName =
    document.getElementById("teacherName");

const teacherSubject =
    document.getElementById("teacherSubject");

const topTeacherName =
    document.getElementById("topTeacherName");

const topAvatar =
    document.getElementById("topAvatar");

const logoutBtn =
    document.getElementById("logoutBtn");

const menuToggle =
    document.getElementById("menuToggle");

const sidebar =
    document.getElementById("sidebar");


// =========================================================
// HTML ESCAPE
// =========================================================

function escapeHTML(value) {

    return String(value ?? "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}


// =========================================================
// INITIALS
// =========================================================

function getInitials(name) {

    const words =
        String(name ?? "")
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (words.length === 0) {
        return "T";
    }


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0].charAt(0) +
        words[words.length - 1].charAt(0)
    ).toUpperCase();

}


// =========================================================
// MESSAGE
// =========================================================

function showMessage(
    title,
    message,
    icon = "info"
) {

    if (typeof Swal !== "undefined") {

        Swal.fire({
            icon,
            title,
            text: message,
            confirmButtonColor: "#d4af37"
        });

    }
    else {

        alert(
            `${title}\n\n${message}`
        );

    }

}


// =========================================================
// LOAD TEACHER PROFILE
// =========================================================

async function loadTeacherProfile(
    user
) {

    const userRef =
        doc(
            db,
            "users",
            user.uid
        );


    const snapshot =
        await getDoc(
            userRef
        );


    if (!snapshot.exists()) {

        throw new Error(
            "Your teacher profile could not be found."
        );

    }


    const teacher =
        snapshot.data();


    // =====================================================
    // NAME
    // =====================================================

    const name =
        teacher.name ||
        "Teacher";


    if (teacherName) {

        teacherName.textContent =
            name;

    }


    if (topTeacherName) {

        topTeacherName.textContent =
            name;

    }


    if (topAvatar) {

        topAvatar.textContent =
            getInitials(name);

    }


    if (teacherSubject) {

        teacherSubject.textContent =
            teacher.subject ||
            "Teacher";

    }


    return teacher;

}


// =========================================================
// LOAD ONE CLASS
// =========================================================

async function loadClass(
    classId
) {

    const normalizedId =
        String(
            classId ?? ""
        ).trim();


    if (!normalizedId) {

        return null;

    }


    console.log(
        "Loading class:",
        normalizedId
    );


    const classRef =
        doc(
            db,
            "classes",
            normalizedId
        );


    const snapshot =
        await getDoc(
            classRef
        );


    if (!snapshot.exists()) {

        console.warn(
            "Class document does not exist:",
            normalizedId
        );


        return null;

    }


    return {

        firestoreId:
            snapshot.id,

        ...snapshot.data()

    };

}


// =========================================================
// LOAD ASSIGNED CLASSES
// =========================================================

async function loadTeacherClasses(
    teacher
) {

    if (!classGrid) {
        return;
    }


    classGrid.innerHTML = `

        <div
            style="
                grid-column: 1 / -1;
                text-align: center;
                padding: 40px 20px;
            "
        >

            <div
                style="
                    font-size: 40px;
                    margin-bottom: 15px;
                "
            >
                ⏳
            </div>

            <h3>
                Loading Classes...
            </h3>

            <p>
                Please wait while your
                assigned classes are loaded.
            </p>

        </div>

    `;


    // =====================================================
    // GET ASSIGNED CLASS IDS
    // =====================================================

    const assignedClassIds =
        Array.isArray(
            teacher.assignedClassIds
        )
            ? teacher.assignedClassIds
            : [];


    console.log(
        "Teacher assignedClassIds:",
        assignedClassIds
    );


    // =====================================================
    // NO ASSIGNED CLASSES
    // =====================================================

    if (
        assignedClassIds.length === 0
    ) {

        renderEmptyClasses();

        return;

    }


    // =====================================================
    // LOAD EACH ASSIGNED CLASS
    // =====================================================

    const loadedClasses = [];


    for (
        const classId of assignedClassIds
    ) {

        try {

            const classData =
                await loadClass(
                    classId
                );


            if (classData) {

                loadedClasses.push(
                    classData
                );

            }

        }

        catch (error) {

            console.error(
                `Error loading class ${classId}:`,
                error
            );

            // Permission error for a specific class
            // is reported below.

            if (
                error.code ===
                "permission-denied"
            ) {

                throw new Error(
                    `You do not have permission to access class ${classId}.`
                );

            }

        }

    }


    console.log(
        "Loaded teacher classes:",
        loadedClasses
    );


    // =====================================================
    // NOTHING FOUND
    // =====================================================

    if (
        loadedClasses.length === 0
    ) {

        classGrid.innerHTML = `

            <div
                class="empty-state"
                style="
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 40px 20px;
                "
            >

                <div
                    style="
                        font-size: 50px;
                        margin-bottom: 15px;
                    "
                >
                    📚
                </div>


                <h3>
                    Classes Not Found
                </h3>


                <p>
                    Your teacher profile contains
                    class assignments, but those
                    class records could not be found.
                </p>

            </div>

        `;

        return;

    }


    // =====================================================
    // RENDER CLASSES
    // =====================================================

    renderClasses(
        loadedClasses,
        teacher.subject
    );

}


// =========================================================
// EMPTY CLASSES
// =========================================================

function renderEmptyClasses() {

    if (!classGrid) {
        return;
    }


    classGrid.innerHTML = `

        <div
            class="empty-state"
            style="
                grid-column: 1 / -1;
                text-align: center;
                padding: 40px 20px;
            "
        >

            <div
                style="
                    font-size: 50px;
                    margin-bottom: 15px;
                "
            >
                📚
            </div>


            <h3>
                No Classes Assigned
            </h3>


            <p>
                You have not been assigned
                any classes yet.
            </p>

        </div>

    `;

}


// =========================================================
// RENDER CLASSES
// =========================================================

function renderClasses(
    classes,
    subject
) {

    classGrid.innerHTML = "";


    classes.forEach(
        classData => {

            const className =
                classData.name ||
                "Unnamed Class";


            const section =
                classData.section ||
                "Not specified";


            const teacherNameValue =
                classData.teacherName ||
                "No Class Teacher";


            const academicSession =
                classData.academicSession ||
                "2026/2027";


            const maxStudents =
                Number(
                    classData.maxStudents
                ) || 40;


            const studentCount =
                Number(
                    classData.studentCount
                ) || 0;


            const status =
                classData.status ||
                "Active";


            const classId =
                classData.firestoreId ||
                classData.id ||
                "";


            const encodedClassId =
                encodeURIComponent(
                    classId
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "class-card";


            card.innerHTML = `

                <div class="class-card-header">

                    <div>

                        <h3>
                            ${escapeHTML(
                                className
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                section
                            )}
                        </p>

                    </div>


                    <span
                        class="status-badge ${
                            status === "Active"
                                ? "status-active"
                                : "status-inactive"
                        }"
                    >

                        ${escapeHTML(
                            status
                        )}

                    </span>

                </div>


                <div class="class-card-body">

                    <div class="class-info">

                        <span>
                            📚 Subject
                        </span>

                        <strong>
                            ${escapeHTML(
                                subject ||
                                "Not specified"
                            )}
                        </strong>

                    </div>


                    <div class="class-info">

                        <span>
                            👨‍🎓 Students
                        </span>

                        <strong>
                            ${escapeHTML(
                                studentCount
                            )}
                            /
                            ${escapeHTML(
                                maxStudents
                            )}
                        </strong>

                    </div>


                    <div class="class-info">

                        <span>
                            👨‍🏫 Class Teacher
                        </span>

                        <strong>
                            ${escapeHTML(
                                teacherNameValue
                            )}
                        </strong>

                    </div>


                    <div class="class-info">

                        <span>
                            📅 Session
                        </span>

                        <strong>
                            ${escapeHTML(
                                academicSession
                            )}
                        </strong>

                    </div>

                </div>


                <div class="class-card-actions">

                    <a
                        href="teacher-attendance.html?classId=${encodedClassId}"
                        class="class-action-btn"
                    >
                        📝 Attendance
                    </a>


                    <a
                        href="teacher-results.html?classId=${encodedClassId}"
                        class="class-action-btn"
                    >
                        📊 Results
                    </a>

                </div>

            `;


            classGrid.appendChild(
                card
            );

        }
    );

}


// =========================================================
// LOGOUT
// =========================================================

async function logoutTeacher() {

    try {

        if (logoutBtn) {

            logoutBtn.disabled =
                true;

            logoutBtn.textContent =
                "Logging out...";

        }


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

        localStorage.removeItem(
            "teacherId"
        );


        window.location.href =
            "teacher-login.html";

    }

    catch (error) {

        console.error(
            "Logout error:",
            error
        );


        if (logoutBtn) {

            logoutBtn.disabled =
                false;

            logoutBtn.textContent =
                "Logout";

        }


        showMessage(
            "Logout Failed",
            error.message ||
            "Unable to logout.",
            "error"
        );

    }

}


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        logoutTeacher
    );

}


// =========================================================
// MOBILE MENU
// =========================================================

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


if (sidebar) {

    sidebar
        .querySelectorAll("a")
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    () => {

                        sidebar.classList.remove(
                            "open"
                        );

                    }
                );

            }
        );

}


// =========================================================
// AUTHENTICATION
// =========================================================

onAuthStateChanged(
    auth,
    async user => {

        if (!user) {

            window.location.href =
                "teacher-login.html";

            return;

        }


        try {

            await user.reload();


            // =================================================
            // EMAIL VERIFICATION
            // =================================================

            if (!user.emailVerified) {

                showMessage(
                    "Email Not Verified",
                    "Please verify your email address before accessing the Teacher Portal.",
                    "warning"
                );


                await signOut(
                    auth
                );


                setTimeout(
                    () => {

                        window.location.href =
                            "teacher-login.html";

                    },
                    1500
                );


                return;

            }


            // =================================================
            // LOAD TEACHER USER PROFILE
            // =================================================

            const teacher =
                await loadTeacherProfile(
                    user
                );


            // =================================================
            // CHECK ROLE
            // =================================================

            if (
                teacher.role !==
                "teacher"
            ) {

                throw new Error(
                    "This account is not registered as a teacher."
                );

            }


            // =================================================
            // LOAD ASSIGNED CLASSES
            // =================================================

            await loadTeacherClasses(
                teacher
            );

        }

        catch (error) {

            console.error(
                "Teacher classes error:",
                error
            );


            if (classGrid) {

                classGrid.innerHTML = `

                    <div
                        style="
                            grid-column: 1 / -1;
                            text-align: center;
                            padding: 40px 20px;
                        "
                    >

                        <div
                            style="
                                font-size: 50px;
                                margin-bottom: 15px;
                            "
                        >
                            ⚠️
                        </div>


                        <h3>
                            Unable to Load Classes
                        </h3>


                        <p>
                            ${escapeHTML(
                                error.message ||
                                "Missing or insufficient permissions."
                            )}
                        </p>

                    </div>

                `;

            }

        }

    }
);