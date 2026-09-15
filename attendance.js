import { adminReady, withTimeout } from "./admin-guard.js";
/* =========================================================
   Ebenezer Day Star Academy
   ATTENDANCE.JS
   FIRESTORE VERSION
========================================================= */

await adminReady;

import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import { db } from "./firebase-config.js";


/* =========================================================
   FIRESTORE COLLECTIONS
========================================================= */

const studentsCollection =
    collection(db, "students");

const classesCollection =
    collection(db, "classes");

const attendanceCollection =
    collection(db, "attendance");


/* =========================================================
   DATA
========================================================= */

let students = [];

let classes = [];

let attendanceRecords = [];


/* =========================================================
   ELEMENTS
========================================================= */

const attendanceSession =
    document.getElementById(
        "attendanceSession"
    );

const attendanceTerm =
    document.getElementById(
        "attendanceTerm"
    );

const attendanceClass =
    document.getElementById(
        "attendanceClass"
    );

const attendanceDate =
    document.getElementById(
        "attendanceDate"
    );

const loadAttendanceBtn =
    document.getElementById(
        "loadAttendanceBtn"
    );

const attendanceTableCard =
    document.getElementById(
        "attendanceTableCard"
    );

const attendanceTableBody =
    document.getElementById(
        "attendanceTableBody"
    );

const attendanceSummaryCard =
    document.getElementById(
        "attendanceSummaryCard"
    );

const attendanceDateTitle =
    document.getElementById(
        "attendanceDateTitle"
    );

const markAllPresentBtn =
    document.getElementById(
        "markAllPresentBtn"
    );

const saveAttendanceBtn =
    document.getElementById(
        "saveAttendanceBtn"
    );

const summaryStudents =
    document.getElementById(
        "summaryStudents"
    );

const summaryPresent =
    document.getElementById(
        "summaryPresent"
    );

const summaryAbsent =
    document.getElementById(
        "summaryAbsent"
    );

const summaryLate =
    document.getElementById(
        "summaryLate"
    );


/* =========================================================
   SET TODAY'S DATE
========================================================= */

function setToday() {

    if (!attendanceDate) {
        return;
    }


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    attendanceDate.value =
        today;

}


/* =========================================================
   GET CLASS NAME
   Supports:
   name
   className
   class
========================================================= */

function getClassName(classItem) {

    return String(

        classItem.name ||

        classItem.className ||

        classItem.class ||

        ""

    ).trim();

}


/* =========================================================
   GET STUDENT CLASS
========================================================= */

function getStudentClass(student) {

    return String(

        student.class ||

        student.studentClass ||

        student.className ||

        ""

    ).trim();

}


/* =========================================================
   GET STUDENT NAME
========================================================= */

function getStudentName(student) {

    const firstName =
        student.firstName ||
        student.firstname ||
        "";

    const lastName =
        student.lastName ||
        student.lastname ||
        "";

    const fullName =
        student.name ||
        student.studentName ||
        "";

    const combinedName =
        `${firstName} ${lastName}`.trim();


    return (

        combinedName ||

        fullName ||

        "Unnamed Student"

    );

}


/* =========================================================
   GET ADMISSION NUMBER
========================================================= */

function getAdmissionNumber(student) {

    return (

        student.admissionNumber ||

        student.admissionNo ||

        student.studentId ||

        student.id ||

        "N/A"

    );

}


/* =========================================================
   LOAD CLASSES
========================================================= */

async function loadClasses() {

    try {

        const snapshot =
            await withTimeout(getDocs(
                classesCollection
            ));


        classes = [];


        snapshot.forEach(
            documentSnapshot => {

                classes.push({

                    firestoreId:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                });

            }
        );


        console.log(
            "Classes loaded:",
            classes
        );


        populateClassSelect();

    }

    catch (error) {

        console.error(
            "Error loading classes:",
            error
        );


        alert(
            "Unable to load classes from Firebase."
        );

    }

}


/* =========================================================
   POPULATE ATTENDANCE CLASS DROPDOWN
========================================================= */

function populateClassSelect() {

    if (!attendanceClass) {
        return;
    }


    attendanceClass.innerHTML = `

        <option value="">
            Select Class
        </option>

    `;


    const classNames = [

        ...new Set(

            classes
                .map(
                    classItem =>
                        getClassName(
                            classItem
                        )
                )
                .filter(Boolean)

        )

    ];


    /*
     * Sort classes alphabetically
     */

    classNames.sort(
        (a, b) =>
            a.localeCompare(b)
    );


    classNames.forEach(
        className => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                className;


            option.textContent =
                className;


            attendanceClass.appendChild(
                option
            );

        }
    );


    console.log(
        "Attendance classes:",
        classNames
    );

}


/* =========================================================
   LOAD STUDENTS
========================================================= */

async function loadStudents() {

    try {

        const snapshot =
            await withTimeout(getDocs(
                studentsCollection
            ));


        students = [];


        snapshot.forEach(
            documentSnapshot => {

                students.push({

                    firestoreId:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                });

            }
        );


        console.log(
            "Students loaded:",
            students
        );


        console.log(
            "Total students:",
            students.length
        );

    }

    catch (error) {

        console.error(
            "Error loading students:",
            error
        );


        throw error;

    }

}


/* =========================================================
   LOAD ATTENDANCE RECORDS
========================================================= */

async function loadAttendanceRecords() {

    try {

        const snapshot =
            await withTimeout(getDocs(
                attendanceCollection
            ));


        attendanceRecords = [];


        snapshot.forEach(
            documentSnapshot => {

                attendanceRecords.push({

                    firestoreId:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                });

            }
        );


        console.log(
            "Attendance records loaded:",
            attendanceRecords
        );

    }

    catch (error) {

        console.error(
            "Error loading attendance records:",
            error
        );


        attendanceRecords = [];

    }

}


/* =========================================================
   LOAD STUDENTS BUTTON
========================================================= */

if (loadAttendanceBtn) {

    loadAttendanceBtn.addEventListener(
        "click",
        async function () {

            const session =
                attendanceSession.value;

            const term =
                attendanceTerm.value;

            const className =
                attendanceClass.value;

            const date =
                attendanceDate.value;


            /* -----------------------------------------
               VALIDATE
            ----------------------------------------- */

            if (
                !session ||
                !term ||
                !className ||
                !date
            ) {

                alert(
                    "Please select the academic session, term, class and date."
                );

                return;

            }


            /* -----------------------------------------
               LOADING
            ----------------------------------------- */

            loadAttendanceBtn.disabled =
                true;

            loadAttendanceBtn.textContent =
                "Loading...";


            try {

                /*
                 * Reload students so newly added
                 * students appear immediately.
                 */

                await loadStudents();


                /*
                 * Find students belonging
                 * to selected class.
                 */

                const classStudents =
                    students.filter(
                        student => {

                            const studentClass =
                                getStudentClass(
                                    student
                                );


                            return (

                                studentClass
                                    .toLowerCase() ===

                                className
                                    .trim()
                                    .toLowerCase()

                            );

                        }
                    );


                console.log(
                    "Selected class:",
                    className
                );


                console.log(
                    "Students found:",
                    classStudents
                );


                /* -----------------------------------------
                   NO STUDENTS
                ----------------------------------------- */

                if (
                    classStudents.length === 0
                ) {

                    alert(

                        `No students found in ${className}.\n\n` +

                        `Check that the student's class is "${className}".`

                    );


                    attendanceTableCard.style.display =
                        "none";


                    attendanceSummaryCard.style.display =
                        "none";


                    return;

                }


                /* -----------------------------------------
                   DATE TITLE
                ----------------------------------------- */

                if (
                    attendanceDateTitle
                ) {

                    const displayDate =
                        new Date(
                            `${date}T00:00:00`
                        );


                    attendanceDateTitle.textContent =

                        displayDate.toLocaleDateString(
                            "en-NG",
                            {
                                weekday:
                                    "long",

                                day:
                                    "numeric",

                                month:
                                    "long",

                                year:
                                    "numeric"
                            }
                        );

                }


                /* -----------------------------------------
                   RENDER
                ----------------------------------------- */

                renderAttendanceStudents(

                    classStudents,

                    session,

                    term,

                    date

                );


                attendanceTableCard.style.display =
                    "block";


                attendanceSummaryCard.style.display =
                    "block";


                updateSummary();

            }

            catch (error) {

                console.error(
                    "Attendance loading error:",
                    error
                );


                alert(
                    "Unable to load students. Check your Firebase configuration and Firestore permissions."
                );

            }

            finally {

                loadAttendanceBtn.disabled =
                    false;

                loadAttendanceBtn.textContent =
                    "Load Students";

            }

        }
    );

}


/* =========================================================
   RENDER STUDENTS
========================================================= */

function renderAttendanceStudents(

    classStudents,

    session,

    term,

    date

) {

    attendanceTableBody.innerHTML =
        "";


    classStudents.forEach(
        (student, index) => {

            const row =
                document.createElement(
                    "tr"
                );


            row.dataset.studentId =
                student.firestoreId;


            row.dataset.studentName =
                getStudentName(
                    student
                );


            row.dataset.admissionNumber =
                getAdmissionNumber(
                    student
                );


            /*
             * Check for an existing
             * attendance record.
             */

            const existing =
                attendanceRecords.find(
                    record => {

                        return (

                            record.studentId ===
                            student.firestoreId &&

                            record.session ===
                            session &&

                            record.term ===
                            term &&

                            record.date ===
                            date

                        );

                    }
                );


            const existingStatus =
                existing?.status || "";


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>


                <td>

                    <strong>

                        ${escapeHTML(
                            getStudentName(
                                student
                            )
                        )}

                    </strong>

                </td>


                <td>

                    ${escapeHTML(
                        getAdmissionNumber(
                            student
                        )
                    )}

                </td>


                <td>

                    <input
                        type="radio"

                        name="attendance_${escapeAttribute(
                            student.firestoreId
                        )}"

                        value="present"

                        class="attendance-radio"

                        ${
                            existingStatus ===
                            "present"
                                ? "checked"
                                : ""
                        }

                    >

                </td>


                <td>

                    <input
                        type="radio"

                        name="attendance_${escapeAttribute(
                            student.firestoreId
                        )}"

                        value="absent"

                        class="attendance-radio"

                        ${
                            existingStatus ===
                            "absent"
                                ? "checked"
                                : ""
                        }

                    >

                </td>


                <td>

                    <input
                        type="radio"

                        name="attendance_${escapeAttribute(
                            student.firestoreId
                        )}"

                        value="late"

                        class="attendance-radio"

                        ${
                            existingStatus ===
                            "late"
                                ? "checked"
                                : ""
                        }

                    >

                </td>


                <td class="attendance-status">

                    ${
                        existingStatus
                            ? formatStatus(
                                existingStatus
                              )
                            : "Not Marked"
                    }

                </td>

            `;


            attendanceTableBody.appendChild(
                row
            );


            const radios =
                row.querySelectorAll(
                    ".attendance-radio"
                );


            radios.forEach(
                radio => {

                    radio.addEventListener(
                        "change",
                        function () {

                            updateRowStatus(

                                row,

                                this.value

                            );


                            updateSummary();

                        }
                    );

                }
            );

        }
    );

}


/* =========================================================
   UPDATE ROW STATUS
========================================================= */

function updateRowStatus(
    row,
    status
) {

    const statusCell =
        row.querySelector(
            ".attendance-status"
        );


    if (!statusCell) {
        return;
    }


    statusCell.textContent =
        formatStatus(
            status
        );

}


/* =========================================================
   FORMAT STATUS
========================================================= */

function formatStatus(status) {

    if (
        status ===
        "present"
    ) {

        return "Present";

    }


    if (
        status ===
        "absent"
    ) {

        return "Absent";

    }


    if (
        status ===
        "late"
    ) {

        return "Late";

    }


    return "Not Marked";

}


/* =========================================================
   MARK ALL PRESENT
========================================================= */

if (markAllPresentBtn) {

    markAllPresentBtn.addEventListener(
        "click",
        function () {

            const rows =
                attendanceTableBody
                    .querySelectorAll("tr");


            rows.forEach(
                row => {

                    const presentRadio =
                        row.querySelector(
                            'input[value="present"]'
                        );


                    if (presentRadio) {

                        presentRadio.checked =
                            true;


                        updateRowStatus(

                            row,

                            "present"

                        );

                    }

                }
            );


            updateSummary();

        }
    );

}


/* =========================================================
   UPDATE SUMMARY
========================================================= */

function updateSummary() {

    const rows =
        attendanceTableBody
            .querySelectorAll("tr");


    let present = 0;

    let absent = 0;

    let late = 0;


    rows.forEach(
        row => {

            const selected =
                row.querySelector(
                    "input[type='radio']:checked"
                );


            if (!selected) {
                return;
            }


            if (
                selected.value ===
                "present"
            ) {

                present++;

            }

            else if (
                selected.value ===
                "absent"
            ) {

                absent++;

            }

            else if (
                selected.value ===
                "late"
            ) {

                late++;

            }

        }
    );


    if (summaryStudents) {

        summaryStudents.textContent =
            rows.length;

    }


    if (summaryPresent) {

        summaryPresent.textContent =
            present;

    }


    if (summaryAbsent) {

        summaryAbsent.textContent =
            absent;

    }


    if (summaryLate) {

        summaryLate.textContent =
            late;

    }

}


/* =========================================================
   SAVE ATTENDANCE
========================================================= */

if (saveAttendanceBtn) {

    saveAttendanceBtn.addEventListener(
        "click",
        async function () {

            const session =
                attendanceSession.value;

            const term =
                attendanceTerm.value;

            const className =
                attendanceClass.value;

            const date =
                attendanceDate.value;


            if (
                !session ||
                !term ||
                !className ||
                !date
            ) {

                alert(
                    "Please complete all attendance fields."
                );

                return;

            }


            const rows =
                [
                    ...attendanceTableBody
                        .querySelectorAll("tr")
                ];


            if (
                rows.length === 0
            ) {

                alert(
                    "Please load the students first."
                );

                return;

            }


            /*
             * Make sure every student
             * has been marked.
             */

            const unmarked =
                rows.filter(
                    row =>

                        !row.querySelector(
                            "input[type='radio']:checked"
                        )

                );


            if (
                unmarked.length > 0
            ) {

                alert(

                    `${unmarked.length} student(s) have not been marked.`

                );

                return;

            }


            saveAttendanceBtn.disabled =
                true;


            saveAttendanceBtn.textContent =
                "Saving...";


            try {

                await loadAttendanceRecords();


                for (
                    const row of rows
                ) {

                    const studentId =
                        row.dataset.studentId;


                    const studentName =
                        row.dataset.studentName;


                    const admissionNumber =
                        row.dataset.admissionNumber;


                    const selected =
                        row.querySelector(
                            "input[type='radio']:checked"
                        );


                    if (!selected) {
                        continue;
                    }


                    const status =
                        selected.value;


                    /*
                     * Look for existing record.
                     */

                    const existing =
                        attendanceRecords.find(
                            record => {

                                return (

                                    record.studentId ===
                                    studentId &&

                                    record.session ===
                                    session &&

                                    record.term ===
                                    term &&

                                    record.date ===
                                    date

                                );

                            }
                        );


                    const attendanceData = {

                        studentId,

                        studentName,

                        admissionNumber,

                        class:
                            className,

                        session,

                        term,

                        date,

                        status,

                        updatedAt:
                            new Date()
                                .toISOString()

                    };


                    if (existing) {

                        await withTimeout(updateDoc(

                            doc(
                                db,
                                "attendance",
                                existing.firestoreId
                            ),

                            attendanceData

                        ));

                    }

                    else {

                        await withTimeout(addDoc(

                            attendanceCollection,

                            {

                                ...attendanceData,

                                createdAt:
                                    new Date()
                                        .toISOString()

                            }

                        ));

                    }

                }


                alert(
                    "Attendance saved successfully."
                );


                await loadAttendanceRecords();


                updateSummary();

            }

            catch (error) {

                console.error(
                    "Error saving attendance:",
                    error
                );


                alert(
                    "Unable to save attendance. Check your Firestore rules."
                );

            }

            finally {

                saveAttendanceBtn.disabled =
                    false;

                saveAttendanceBtn.textContent =
                    "Save Attendance";

            }

        }
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
   ESCAPE ATTRIBUTE
========================================================= */

function escapeAttribute(value) {

    return String(
        value ?? ""
    )

        .replace(
            /\\/g,
            "\\\\"
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

async function initializeAttendance() {

    try {

        setToday();


        /*
         * Load all required Firebase data.
         */

        await Promise.all([

            loadClasses(),

            loadStudents(),

            loadAttendanceRecords()

        ]);


        console.log(
            "Attendance system initialized successfully."
        );

    }

    catch (error) {

        console.error(
            "Attendance initialization error:",
            error
        );

    }

}


/* =========================================================
   START
========================================================= */

initializeAttendance();