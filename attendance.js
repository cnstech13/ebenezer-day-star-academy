import { adminReady, withTimeout } from "./admin-guard.js";

/* =========================================================
   EBENEZER DAY STAR ACADEMY
   ATTENDANCE.JS
   FIRESTORE VERSION

   FEATURES:
   - Loads classes from Firestore
   - Displays all available classes in dropdown
   - Prevents duplicate class options
   - Loads students by selected class
   - Marks Present / Absent / Late
   - Saves attendance
   - Updates existing attendance records
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
    document.getElementById("attendanceSession");

const attendanceTerm =
    document.getElementById("attendanceTerm");

const attendanceClass =
    document.getElementById("attendanceClass");

const attendanceDate =
    document.getElementById("attendanceDate");

const loadAttendanceBtn =
    document.getElementById("loadAttendanceBtn");

const attendanceTableCard =
    document.getElementById("attendanceTableCard");

const attendanceTableBody =
    document.getElementById("attendanceTableBody");

const attendanceSummaryCard =
    document.getElementById("attendanceSummaryCard");

const attendanceDateTitle =
    document.getElementById("attendanceDateTitle");

const markAllPresentBtn =
    document.getElementById("markAllPresentBtn");

const saveAttendanceBtn =
    document.getElementById("saveAttendanceBtn");

const summaryStudents =
    document.getElementById("summaryStudents");

const summaryPresent =
    document.getElementById("summaryPresent");

const summaryAbsent =
    document.getElementById("summaryAbsent");

const summaryLate =
    document.getElementById("summaryLate");


/* =========================================================
   SET TODAY'S DATE
========================================================= */

function setToday() {

    if (!attendanceDate) {
        return;
    }

    const today =
        new Date().toISOString().split("T")[0];

    attendanceDate.value = today;
}


/* =========================================================
   GET CLASS NAME
========================================================= */

function getClassName(classItem) {

    if (!classItem) {
        return "";
    }

    /*
     * Your Classes page saves:
     *
     * name
     * section
     *
     * So name is the primary class value.
     */

    const name =
        String(
            classItem.name ||
            classItem.className ||
            classItem.class ||
            classItem.title ||
            ""
        ).trim();

    /*
     * If name exists, use it.
     */

    if (name) {
        return name;
    }

    /*
     * Some older class records may only
     * contain a section.
     */

    const section =
        String(
            classItem.section ||
            ""
        ).trim();

    return section;
}


/* =========================================================
   GET CLASS SECTION
========================================================= */

function getClassSection(classItem) {

    return String(
        classItem?.section ||
        ""
    ).trim();

}


/* =========================================================
   GET STUDENT CLASS
========================================================= */

function getStudentClass(student) {

    if (!student) {
        return "";
    }

    return String(

        student.class ||

        student.studentClass ||

        student.className ||

        student.section ||

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

    if (!attendanceClass) {
        console.error(
            "attendanceClass element was not found."
        );

        return;
    }

    try {

        console.log(
            "Loading classes from Firestore..."
        );


        const snapshot =
            await withTimeout(
                getDocs(
                    classesCollection
                )
            );


        classes = [];


        snapshot.forEach(
            documentSnapshot => {

                const data =
                    documentSnapshot.data();


                classes.push({

                    firestoreId:
                        documentSnapshot.id,

                    ...data

                });

            }
        );


        console.log(
            "Raw classes from Firestore:",
            classes
        );


        /*
         * Populate dropdown.
         */

        populateClassSelect();


    }

    catch (error) {

        console.error(
            "Error loading classes:",
            error
        );


        /*
         * Keep the dropdown usable.
         */

        attendanceClass.innerHTML = `

            <option value="">
                Unable to Load Classes
            </option>

        `;


        if (
            typeof Swal !== "undefined"
        ) {

            Swal.fire({
                icon: "error",
                title: "Unable to Load Classes",
                text:
                    getFirebaseErrorMessage(error)
            });

        }

        else {

            alert(
                "Unable to load classes from Firebase."
            );

        }

    }

}


/* =========================================================
   POPULATE CLASS DROPDOWN
========================================================= */

function populateClassSelect() {

    if (!attendanceClass) {
        return;
    }


    /*
     * Completely clear existing options.
     */

    attendanceClass.innerHTML = "";


    /*
     * Default option.
     */

    const defaultOption =
        document.createElement("option");


    defaultOption.value = "";

    defaultOption.textContent =
        "Select Class";


    attendanceClass.appendChild(
        defaultOption
    );


    /*
     * Use a Map to guarantee that
     * each class appears only once.
     */

    const uniqueClasses =
        new Map();


    classes.forEach(
        classItem => {

            const className =
                getClassName(classItem);


            if (!className) {
                return;
            }


            /*
             * Normalize the class name
             * for duplicate checking.
             */

            const normalizedName =
                className
                    .trim()
                    .toLowerCase();


            /*
             * Only add it once.
             */

            if (
                !uniqueClasses.has(
                    normalizedName
                )
            ) {

                uniqueClasses.set(
                    normalizedName,
                    {

                        name:
                            className,

                        firestoreId:
                            classItem.firestoreId,

                        section:
                            getClassSection(
                                classItem
                            )

                    }
                );

            }

        }
    );


    /*
     * Convert Map to array.
     */

    const uniqueClassList =
        Array.from(
            uniqueClasses.values()
        );


    /*
     * Sort classes.
     */

    uniqueClassList.sort(
        (a, b) =>
            a.name.localeCompare(
                b.name,
                undefined,
                {
                    numeric: true,
                    sensitivity: "base"
                }
            )
    );


    /*
     * Add classes to dropdown.
     */

    uniqueClassList.forEach(
        classItem => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                classItem.name;


            option.textContent =
                classItem.name;


            /*
             * Keep Firestore ID available
             * if needed later.
             */

            option.dataset.firestoreId =
                classItem.firestoreId || "";


            option.dataset.section =
                classItem.section || "";


            attendanceClass.appendChild(
                option
            );

        }
    );


    /*
     * If no classes were found.
     */

    if (
        uniqueClassList.length === 0
    ) {

        const noClassOption =
            document.createElement(
                "option"
            );


        noClassOption.value = "";

        noClassOption.textContent =
            "No Classes Available";


        noClassOption.disabled = true;


        attendanceClass.appendChild(
            noClassOption
        );


        console.warn(
            "No classes were found in the classes collection."
        );

    }


    console.log(
        "Classes displayed in Attendance:",
        uniqueClassList
    );

}


/* =========================================================
   LOAD STUDENTS
========================================================= */

async function loadStudents() {

    try {

        const snapshot =
            await withTimeout(
                getDocs(
                    studentsCollection
                )
            );


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
            await withTimeout(
                getDocs(
                    attendanceCollection
                )
            );


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
                attendanceSession?.value || "";

            const term =
                attendanceTerm?.value || "";

            const className =
                attendanceClass?.value || "";

            const date =
                attendanceDate?.value || "";


            /*
             * VALIDATION
             */

            if (
                !session ||
                !term ||
                !className ||
                !date
            ) {

                showWarningMessage(
                    "Please select the academic session, term, class and date."
                );

                return;

            }


            loadAttendanceBtn.disabled =
                true;

            loadAttendanceBtn.textContent =
                "Loading...";


            try {

                /*
                 * Reload students.
                 */

                await loadStudents();


                /*
                 * Find students in selected class.
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
                                    .trim()
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


                /*
                 * No students.
                 */

                if (
                    classStudents.length === 0
                ) {

                    showWarningMessage(

                        `No students found in ${className}. Check that students have been assigned to this class.`

                    );


                    if (
                        attendanceTableCard
                    ) {

                        attendanceTableCard.style.display =
                            "none";

                    }


                    if (
                        attendanceSummaryCard
                    ) {

                        attendanceSummaryCard.style.display =
                            "none";

                    }


                    return;

                }


                /*
                 * Date title.
                 */

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


                /*
                 * Render students.
                 */

                renderAttendanceStudents(

                    classStudents,

                    session,

                    term,

                    date

                );


                if (
                    attendanceTableCard
                ) {

                    attendanceTableCard.style.display =
                        "block";

                }


                if (
                    attendanceSummaryCard
                ) {

                    attendanceSummaryCard.style.display =
                        "block";

                }


                updateSummary();

            }

            catch (error) {

                console.error(
                    "Attendance loading error:",
                    error
                );


                showErrorMessage(
                    getFirebaseErrorMessage(error)
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

    if (!attendanceTableBody) {
        return;
    }


    attendanceTableBody.innerHTML =
        "";


    classStudents.forEach(
        (student, index) => {

            const row =
                document.createElement("tr");


            row.dataset.studentId =
                student.firestoreId;


            row.dataset.studentName =
                getStudentName(student);


            row.dataset.admissionNumber =
                getAdmissionNumber(student);


            /*
             * Existing attendance record.
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
                            getStudentName(student)
                        )}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(
                        getAdmissionNumber(student)
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


            /*
             * Radio events.
             */

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
        formatStatus(status);

}


/* =========================================================
   FORMAT STATUS
========================================================= */

function formatStatus(status) {

    if (
        status === "present"
    ) {

        return "Present";

    }


    if (
        status === "absent"
    ) {

        return "Absent";

    }


    if (
        status === "late"
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

            if (!attendanceTableBody) {
                return;
            }


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

    if (!attendanceTableBody) {
        return;
    }


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
                attendanceSession?.value || "";

            const term =
                attendanceTerm?.value || "";

            const className =
                attendanceClass?.value || "";

            const date =
                attendanceDate?.value || "";


            if (
                !session ||
                !term ||
                !className ||
                !date
            ) {

                showWarningMessage(
                    "Please complete all attendance fields."
                );

                return;

            }


            if (!attendanceTableBody) {
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

                showWarningMessage(
                    "Please load the students first."
                );

                return;

            }


            /*
             * Check unmarked students.
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

                showWarningMessage(

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
                     * Find existing attendance.
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


                    /*
                     * UPDATE EXISTING RECORD
                     */

                    if (existing) {

                        await withTimeout(
                            updateDoc(

                                doc(
                                    db,
                                    "attendance",
                                    existing.firestoreId
                                ),

                                attendanceData

                            )
                        );

                    }

                    /*
                     * CREATE NEW RECORD
                     */

                    else {

                        await withTimeout(
                            addDoc(

                                attendanceCollection,

                                {

                                    ...attendanceData,

                                    createdAt:
                                        new Date()
                                            .toISOString()

                                }

                            )
                        );

                    }

                }


                showSuccessMessage(
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


                showErrorMessage(
                    getFirebaseErrorMessage(error)
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
   SWEETALERT WARNING
========================================================= */

function showWarningMessage(message) {

    if (
        typeof Swal !== "undefined"
    ) {

        Swal.fire({

            icon: "warning",

            title: "Attention",

            text: message,

            confirmButtonText:
                "OK"

        });

    }

    else {

        alert(message);

    }

}


/* =========================================================
   SWEETALERT SUCCESS
========================================================= */

function showSuccessMessage(message) {

    if (
        typeof Swal !== "undefined"
    ) {

        Swal.fire({

            icon: "success",

            title: "Success",

            text: message,

            confirmButtonText:
                "OK"

        });

    }

    else {

        alert(message);

    }

}


/* =========================================================
   SWEETALERT ERROR
========================================================= */

function showErrorMessage(message) {

    if (
        typeof Swal !== "undefined"
    ) {

        Swal.fire({

            icon: "error",

            title: "Error",

            text: message,

            confirmButtonText:
                "OK"

        });

    }

    else {

        alert(message);

    }

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
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        );

}


/* =========================================================
   FIREBASE ERROR MESSAGE
========================================================= */

function getFirebaseErrorMessage(error) {

    if (!error) {

        return "An unknown error occurred.";

    }


    switch (
        error.code
    ) {

        case "permission-denied":

            return (
                "You do not have permission to access this data. " +
                "Please check your Firestore security rules."
            );


        case "unavailable":

            return (
                "Firebase is temporarily unavailable. " +
                "Please check your internet connection."
            );


        case "network-request-failed":

            return (
                "Network error. Please check your internet connection."
            );


        case "failed-precondition":

            return (
                "The Firestore operation could not be completed."
            );


        default:

            return (
                error.message ||
                "An unexpected Firebase error occurred."
            );

    }

}


/* =========================================================
   INITIALIZE ATTENDANCE
========================================================= */

async function initializeAttendance() {

    try {

        setToday();


        /*
         * Load all data.
         */

        await Promise.all([

            loadClasses(),

            loadStudents(),

            loadAttendanceRecords()

        ]);


        console.log(
            "Attendance system initialized successfully."
        );


        /*
         * Show the classes that were loaded.
         */

        console.log(
            "Available classes:",
            classes.map(
                item =>
                    getClassName(item)
            )
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