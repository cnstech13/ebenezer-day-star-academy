/* =========================================================
   TEACHER ATTENDANCE
   EBENEZER DAY STAR ACADEMY
========================================================= */

import {
    collection,
    query,
    where,
    getDocs,
    getDoc,
    setDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
    auth,
    db
} from "./firebase-config.js";


/* =========================================================
   ELEMENTS
========================================================= */

const classSelect =
    document.getElementById("classSelect");

const attendanceDate =
    document.getElementById("attendanceDate");

const studentArea =
    document.getElementById("studentArea");

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


/* =========================================================
   DATA
========================================================= */

let currentTeacher = null;
let assignedClasses = [];
let currentStudents = [];
let attendanceRecords = {};


/* =========================================================
   AUTHENTICATION
========================================================= */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "teacher-login.html";

            return;

        }


        try {

            await user.reload();


            if (!user.emailVerified) {

                await signOut(auth);

                await Swal.fire({
                    icon: "warning",
                    title: "Email Not Verified",
                    text:
                        "Please verify your teacher email before accessing the Teacher Portal."
                });

                window.location.href =
                    "teacher-login.html";

                return;

            }


            await loadTeacher(user.uid);

            await loadAssignedClasses();

            setToday();

            setupEvents();


        } catch (error) {

            console.error(
                "Attendance initialization error:",
                error
            );


            Swal.fire({
                icon: "error",
                title: "Attendance Error",
                text:
                    error.message ||
                    "Unable to load Teacher Attendance."
            });

        }

    }
);


/* =========================================================
   LOAD TEACHER
========================================================= */

async function loadTeacher(uid) {

    const teacherRef =
        doc(
            db,
            "users",
            uid
        );


    const teacherSnap =
        await getDoc(
            teacherRef
        );


    if (!teacherSnap.exists()) {

        await signOut(auth);

        window.location.href =
            "teacher-login.html";

        return;

    }


    currentTeacher =
        teacherSnap.data();


    if (
        currentTeacher.role !==
        "teacher"
    ) {

        await signOut(auth);

        window.location.href =
            "teacher-login.html";

        return;

    }


    const name =
        currentTeacher.name ||
        "Teacher";


    if (topTeacherName) {

        topTeacherName.textContent =
            name;

    }


    if (topAvatar) {

        topAvatar.textContent =
            name
                .charAt(0)
                .toUpperCase();

    }

}


/* =========================================================
   LOAD ASSIGNED CLASSES
========================================================= */

async function loadAssignedClasses() {

    assignedClasses = [];


    const assignedClassIds =
        Array.isArray(
            currentTeacher.assignedClassIds
        )
            ? currentTeacher.assignedClassIds
            : [];


    if (
        assignedClassIds.length === 0
    ) {

        classSelect.innerHTML = `
            <option value="">
                No classes assigned
            </option>
        `;

        return;

    }


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


            if (
                classSnap.exists()
            ) {

                assignedClasses.push({

                    firestoreId:
                        classSnap.id,

                    ...classSnap.data()

                });

            }

        } catch (error) {

            console.error(
                "Unable to load class:",
                classId,
                error
            );

        }

    }


    assignedClasses.sort(
        (a, b) =>
            String(a.name || "")
                .localeCompare(
                    String(b.name || ""),
                    undefined,
                    {
                        numeric: true,
                        sensitivity: "base"
                    }
                )
    );


    populateClassSelect();

}


/* =========================================================
   POPULATE CLASS SELECT
========================================================= */

function populateClassSelect() {

    classSelect.innerHTML = `
        <option value="">
            Select a class
        </option>
    `;


    assignedClasses.forEach(
        (classItem) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                classItem.firestoreId;


            option.textContent =
                classItem.name ||
                classItem.firestoreId;


            classSelect.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   SET TODAY
========================================================= */

function setToday() {

    if (!attendanceDate) {
        return;
    }


    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );


    attendanceDate.value =
        `${year}-${month}-${day}`;

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

    classSelect.addEventListener(
        "change",
        async () => {

            if (!classSelect.value) {

                showEmptyState(
                    "Select a class",
                    "Choose one of your assigned classes to load students."
                );

                return;

            }


            await loadStudents();

        }
    );


    attendanceDate.addEventListener(
        "change",
        async () => {

            if (
                classSelect.value
            ) {

                await loadExistingAttendance();

                renderStudents();

            }

        }
    );


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            logout
        );

    }


    if (
        menuToggle &&
        sidebar
    ) {

        menuToggle.addEventListener(
            "click",
            () => {

                sidebar.classList.toggle(
                    "open"
                );

            }
        );

    }

}


/* =========================================================
   LOAD STUDENTS
========================================================= */

async function loadStudents() {

    const classId =
        classSelect.value;


    const selectedClass =
        assignedClasses.find(
            (item) =>
                item.firestoreId ===
                classId
        );


    if (!selectedClass) {

        showError(
            "The selected class could not be found."
        );

        return;

    }


    studentArea.innerHTML = `

        <div class="loading-state">

            <i class="fas fa-spinner fa-spin"></i>

            <h3>Loading Students...</h3>

            <p>
                Loading students for
                <strong>
                    ${escapeHTML(
                        selectedClass.name
                    )}
                </strong>
            </p>

        </div>

    `;


    try {

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


        const snapshot =
            await getDocs(
                studentsQuery
            );


        currentStudents = [];


        snapshot.forEach(
            (studentSnap) => {

                currentStudents.push({

                    firestoreId:
                        studentSnap.id,

                    ...studentSnap.data()

                });

            }
        );


        currentStudents.sort(
            (a, b) => {

                const nameA =
                    `${a.firstName || ""} ${a.lastName || ""}`;

                const nameB =
                    `${b.firstName || ""} ${b.lastName || ""}`;

                return nameA.localeCompare(
                    nameB
                );

            }
        );


        await loadExistingAttendance();

        renderStudents();


    } catch (error) {

        console.error(
            "Student loading error:",
            error
        );


        showError(
            "Unable to load students. Check your Firestore students permission."
        );


        Swal.fire({
            icon: "error",
            title: "Unable to Load Students",
            text:
                error.message ||
                "Firestore denied access."
        });

    }

}


/* =========================================================
   LOAD EXISTING ATTENDANCE
========================================================= */

async function loadExistingAttendance() {

    const classId =
        classSelect.value;

    const date =
        attendanceDate.value;


    if (
        !classId ||
        !date
    ) {

        attendanceRecords = {};

        return;

    }


    try {

        const attendanceId =
            `${classId}_${date}`;


        const attendanceRef =
            doc(
                db,
                "attendance",
                attendanceId
            );


        const attendanceSnap =
            await getDoc(
                attendanceRef
            );


        if (
            attendanceSnap.exists()
        ) {

            const data =
                attendanceSnap.data();


            attendanceRecords =
                data.records || {};

        } else {

            attendanceRecords = {};

        }

    } catch (error) {

        /*
         * If there is no attendance record yet,
         * we simply start with Present.
         */
        console.log(
            "No previous attendance record:",
            error.message
        );

        attendanceRecords = {};

    }

}


/* =========================================================
   RENDER STUDENTS
========================================================= */

function renderStudents() {

    const selectedClass =
        assignedClasses.find(
            (item) =>
                item.firestoreId ===
                classSelect.value
        );


    if (
        currentStudents.length === 0
    ) {

        showEmptyState(
            "No Students Found",
            `There are currently no students saved under ${
                selectedClass?.name || "this class"
            }.`
        );

        return;

    }


    studentArea.innerHTML = `

        <div class="class-info">

            <div>

                <h3>
                    ${escapeHTML(
                        selectedClass?.name ||
                        "Selected Class"
                    )}
                </h3>

                <p>
                    Mark attendance for the selected date.
                </p>

            </div>

            <div class="student-count">

                ${currentStudents.length}
                Student${currentStudents.length === 1 ? "" : "s"}

            </div>

        </div>


        <div class="student-table-wrapper">

            <table>

                <thead>

                    <tr>

                        <th>#</th>

                        <th>Student Name</th>

                        <th>Gender</th>

                        <th>Class</th>

                        <th>Attendance</th>

                    </tr>

                </thead>

                <tbody id="attendanceTableBody"></tbody>

            </table>

        </div>


        <button
            type="button"
            class="save-btn"
            id="saveAttendanceBtn"
        >
            <i class="fas fa-save"></i>
            Save Attendance
        </button>

    `;


    const tableBody =
        document.getElementById(
            "attendanceTableBody"
        );


    currentStudents.forEach(
        (student, index) => {

            const currentStatus =
                attendanceRecords[
                    student.firestoreId
                ] ||
                "Present";


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    <strong>
                        ${escapeHTML(
                            student.firstName || ""
                        )}
                        ${escapeHTML(
                            student.lastName || ""
                        )}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(
                        student.gender || "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        student.studentClass || "-"
                    )}
                </td>

                <td>

                    <select
                        class="status-select attendance-status"
                        data-student-id="${
                            student.firestoreId
                        }"
                    >

                        <option
                            value="Present"
                            ${
                                currentStatus ===
                                "Present"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Present
                        </option>

                        <option
                            value="Absent"
                            ${
                                currentStatus ===
                                "Absent"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Absent
                        </option>

                        <option
                            value="Late"
                            ${
                                currentStatus ===
                                "Late"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Late
                        </option>

                        <option
                            value="Excused"
                            ${
                                currentStatus ===
                                "Excused"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Excused
                        </option>

                    </select>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );


    const saveButton =
        document.getElementById(
            "saveAttendanceBtn"
        );


    saveButton.addEventListener(
        "click",
        saveAttendance
    );

}


/* =========================================================
   SAVE ATTENDANCE
========================================================= */

async function saveAttendance() {

    const classId =
        classSelect.value;

    const date =
        attendanceDate.value;


    if (
        !classId ||
        !date
    ) {

        Swal.fire({
            icon: "warning",
            title: "Missing Information",
            text:
                "Please select a class and attendance date."
        });

        return;

    }


    if (
        currentStudents.length === 0
    ) {

        Swal.fire({
            icon: "warning",
            title: "No Students",
            text:
                "There are no students to mark."
        });

        return;

    }


    const selectedClass =
        assignedClasses.find(
            (item) =>
                item.firestoreId ===
                classId
        );


    if (!selectedClass) {

        Swal.fire({
            icon: "error",
            title: "Access Denied",
            text:
                "You are not assigned to this class."
        });

        return;

    }


    const records = {};


    document
        .querySelectorAll(
            ".attendance-status"
        )
        .forEach(
            (select) => {

                records[
                    select.dataset.studentId
                ] = select.value;

            }
        );


    const saveButton =
        document.getElementById(
            "saveAttendanceBtn"
        );


    try {

        saveButton.disabled =
            true;


        saveButton.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            Saving Attendance...
        `;


        const attendanceId =
            `${classId}_${date}`;


        const attendanceRef =
            doc(
                db,
                "attendance",
                attendanceId
            );


        /*
         * IMPORTANT
         *
         * teacherUid is the Firebase Authentication UID.
         *
         * This is what Firestore security rules use
         * to identify the logged-in teacher.
         */

        await setDoc(
            attendanceRef,
            {

                classId:

                    classId,

                className:

                    selectedClass.name || "",

                date:

                    date,

                records:

                    records,

                totalStudents:

                    currentStudents.length,

                teacherUid:

                    auth.currentUser.uid,

                teacherId:

                    currentTeacher.teacherId || "",

                teacherName:

                    currentTeacher.name || "",

                updatedBy:

                    auth.currentUser.uid,

                updatedAt:

                    serverTimestamp()

            },
            {
                merge: true
            }
        );


        attendanceRecords =
            records;


        Swal.fire({
            icon: "success",
            title: "Attendance Saved",
            text:
                "Student attendance has been saved successfully.",
            timer: 1800,
            showConfirmButton: false
        });


    } catch (error) {

        console.error(
            "SAVE ATTENDANCE ERROR:",
            error
        );


        Swal.fire({
            icon: "error",
            title: "Permission Denied",
            text:
                error.message ||
                "Firestore denied permission to save attendance."
        });


    } finally {

        saveButton.disabled =
            false;


        saveButton.innerHTML = `
            <i class="fas fa-save"></i>
            Save Attendance
        `;

    }

}


/* =========================================================
   EMPTY STATE
========================================================= */

function showEmptyState(
    title,
    message
) {

    studentArea.innerHTML = `

        <div class="empty-state">

            <i class="fas fa-user-check"></i>

            <h3>
                ${escapeHTML(title)}
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;

}


/* =========================================================
   ERROR STATE
========================================================= */

function showError(message) {

    studentArea.innerHTML = `

        <div class="error-state">

            <i class="fas fa-exclamation-triangle"></i>

            <h3>
                Unable to Load Students
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;

}


/* =========================================================
   LOGOUT
========================================================= */

async function logout(event) {

    if (event) {
        event.preventDefault();
    }


    const result =
        await Swal.fire({

            icon: "question",

            title: "Logout?",

            text:
                "Are you sure you want to logout?",

            showCancelButton: true,

            confirmButtonText:
                "Yes, Logout",

            cancelButtonText:
                "Cancel"

        });


    if (!result.isConfirmed) {
        return;
    }


    try {

        await signOut(auth);

        window.location.href =
            "teacher-login.html";

    } catch (error) {

        console.error(
            "Logout error:",
            error
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