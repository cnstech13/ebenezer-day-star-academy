/* =========================================================
   TEACHER RESULTS
   EBENEZER DAY STAR ACADEMY

   GRADING SYSTEM:
   CA1          = 10
   CA2          = 10
   Class Work 1 = 5
   Class Work 2 = 5
   Assignment 1 = 5
   Assignment 2 = 5
   ----------------
   CA TOTAL     = 40

   Examination  = 60
   ----------------
   FINAL TOTAL  = 100
========================================================= */

import {
    collection,
    query,
    where,
    getDocs,
    getDoc,
    doc,
    setDoc,
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

const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");
const logoutBtn = document.getElementById("logoutBtn");

const topAvatar = document.getElementById("topAvatar");
const topTeacherName = document.getElementById("topTeacherName");

const classSelect = document.getElementById("classSelect");
const subjectSelect = document.getElementById("subjectSelect");
const termSelect = document.getElementById("termSelect");
const sessionInput = document.getElementById("sessionInput");

const resultsArea = document.getElementById("resultsArea");
const resultsTitle = document.getElementById("resultsTitle");
const resultsSubtitle = document.getElementById("resultsSubtitle");


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let currentTeacher = null;
let assignedClasses = [];
let currentStudents = [];

let currentClass = null;
let currentSubject = "";


/* =========================================================
   SCORE LIMITS
========================================================= */

const SCORE_LIMITS = {

    ca1: 10,

    ca2: 10,

    classWork1: 5,

    classWork2: 5,

    assignment1: 5,

    assignment2: 5,

    exam: 60

};


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

if (menuToggle) {

    menuToggle.addEventListener("click", () => {

        sidebar.classList.toggle("open");

    });

}


/* =========================================================
   LOGOUT
========================================================= */

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        try {

            await signOut(auth);

            window.location.href =
                "teacher-login.html";

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

            if (typeof Swal !== "undefined") {

                Swal.fire(
                    "Error",
                    "Unable to logout.",
                    "error"
                );

            }

        }

    });

}


/* =========================================================
   AUTHENTICATION
========================================================= */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href =
            "teacher-login.html";

        return;

    }


    try {

        await user.reload();

        const refreshedUser =
            auth.currentUser;


        if (!refreshedUser) {

            window.location.href =
                "teacher-login.html";

            return;

        }


        if (!refreshedUser.emailVerified) {

            if (typeof Swal !== "undefined") {

                await Swal.fire(
                    "Email Not Verified",
                    "Please verify your teacher email before accessing the portal.",
                    "warning"
                );

            }


            await signOut(auth);

            window.location.href =
                "teacher-login.html";

            return;

        }


        await loadTeacher(
            refreshedUser
        );


    } catch (error) {

        console.error(
            "Teacher authentication error:",
            error
        );


        if (typeof Swal !== "undefined") {

            Swal.fire(
                "Error",
                "Unable to load teacher account.",
                "error"
            );

        }

    }

});


/* =========================================================
   LOAD TEACHER
========================================================= */

async function loadTeacher(user) {

    try {

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        const userSnap =
            await getDoc(userRef);


        if (!userSnap.exists()) {

            throw new Error(
                "Teacher user profile was not found."
            );

        }


        const userData =
            userSnap.data();


        if (userData.role !== "teacher") {

            throw new Error(
                "This account is not registered as a teacher."
            );

        }


        currentTeacher = {

            uid: user.uid,

            ...userData

        };


        /* -------------------------------------------------
           HEADER
        ------------------------------------------------- */

        const teacherName =
            userData.name ||
            user.displayName ||
            "Teacher";


        if (topTeacherName) {

            topTeacherName.textContent =
                teacherName;

        }


        if (topAvatar) {

            topAvatar.textContent =
                teacherName
                    .charAt(0)
                    .toUpperCase();

        }


        /* -------------------------------------------------
           LOAD CLASSES
        ------------------------------------------------- */

        await loadAssignedClasses();


        /* -------------------------------------------------
           LOAD SUBJECT
        ------------------------------------------------- */

        await loadTeacherSubject();


        /* -------------------------------------------------
           SET EVENTS
        ------------------------------------------------- */

        setupResultEvents();


    } catch (error) {

        console.error(
            "Load teacher error:",
            error
        );


        if (typeof Swal !== "undefined") {

            Swal.fire(
                "Error",
                error.message ||
                "Unable to load teacher information.",
                "error"
            );

        }

    }

}


/* =========================================================
   LOAD ASSIGNED CLASSES
   SAME WORKING METHOD AS ATTENDANCE
========================================================= */

async function loadAssignedClasses() {

    if (!classSelect) {

        console.error(
            "classSelect element was not found."
        );

        return;

    }


    classSelect.innerHTML = `
        <option value="">
            Loading classes...
        </option>
    `;


    classSelect.disabled = true;

    assignedClasses = [];


    try {

        const classIds =
            Array.isArray(
                currentTeacher.assignedClassIds
            )
                ? currentTeacher.assignedClassIds
                : [];


        console.log(
            "Teacher assignedClassIds:",
            classIds
        );


        if (classIds.length === 0) {

            classSelect.innerHTML = `
                <option value="">
                    No assigned classes
                </option>
            `;


            showEmptyMessage(
                "No Classes Assigned",
                "You have not been assigned to any class yet."
            );


            return;

        }


        /* -------------------------------------------------
           LOAD EACH CLASS
        ------------------------------------------------- */

        for (const classId of classIds) {

            try {

                const classRef =
                    doc(
                        db,
                        "classes",
                        classId
                    );


                const classSnap =
                    await getDoc(classRef);


                if (!classSnap.exists()) {

                    console.warn(
                        "Class document not found:",
                        classId
                    );

                    continue;

                }


                const classData =
                    classSnap.data();


                assignedClasses.push({

                    id:
                        classSnap.id,

                    ...classData

                });


            } catch (classError) {

                console.error(
                    "Error loading class:",
                    classId,
                    classError
                );

            }

        }


        /* -------------------------------------------------
           SORT CLASSES
        ------------------------------------------------- */

        assignedClasses.sort(
            (a, b) => {

                const nameA =
                    String(
                        a.name || ""
                    ).toLowerCase();


                const nameB =
                    String(
                        b.name || ""
                    ).toLowerCase();


                return nameA.localeCompare(
                    nameB
                );

            }
        );


        console.log(
            "Loaded assigned classes:",
            assignedClasses
        );


        /* -------------------------------------------------
           POPULATE DROPDOWN
        ------------------------------------------------- */

        classSelect.innerHTML = `
            <option value="">
                Select a class
            </option>
        `;


        assignedClasses.forEach(
            classItem => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    classItem.id;


                option.textContent =
                    classItem.name ||
                    classItem.className ||
                    classItem.id;


                classSelect.appendChild(
                    option
                );

            }
        );


        classSelect.disabled =
            assignedClasses.length === 0;


        if (
            assignedClasses.length === 0
        ) {

            classSelect.innerHTML = `
                <option value="">
                    No classes found
                </option>
            `;


            showEmptyMessage(
                "No Classes Found",
                "Your assigned classes could not be found in Firestore."
            );

        }

    } catch (error) {

        console.error(
            "loadAssignedClasses error:",
            error
        );


        classSelect.innerHTML = `
            <option value="">
                Unable to load classes
            </option>
        `;


        if (typeof Swal !== "undefined") {

            Swal.fire(
                "Class Loading Error",
                error.message ||
                "Unable to load your assigned classes.",
                "error"
            );

        }

    }

}


/* =========================================================
   LOAD TEACHER SUBJECT
========================================================= */

async function loadTeacherSubject() {

    if (!subjectSelect) {

        return;

    }


    subjectSelect.innerHTML = `
        <option value="">
            Loading subject...
        </option>
    `;


    subjectSelect.disabled = true;


    const teacherSubject =
        currentTeacher.subject ||
        currentTeacher.subjectName ||
        "";


    console.log(
        "Teacher subject:",
        teacherSubject
    );


    if (teacherSubject) {

        currentSubject =
            teacherSubject;


        subjectSelect.innerHTML = "";


        const option =
            document.createElement(
                "option"
            );


        option.value =
            teacherSubject;


        option.textContent =
            teacherSubject;


        subjectSelect.appendChild(
            option
        );


        subjectSelect.value =
            teacherSubject;


        subjectSelect.disabled =
            false;


        return;

    }


    /* -------------------------------------------------
       FALLBACK TO TEACHERS COLLECTION
    ------------------------------------------------- */

    try {

        const teacherQuery =
            query(
                collection(
                    db,
                    "teachers"
                ),
                where(
                    "email",
                    "==",
                    currentTeacher.email
                )
            );


        const teacherSnapshot =
            await getDocs(
                teacherQuery
            );


        if (
            !teacherSnapshot.empty
        ) {

            const teacherData =
                teacherSnapshot
                    .docs[0]
                    .data();


            const subject =
                teacherData.subject ||
                teacherData.subjectName ||
                "";


            if (subject) {

                currentTeacher.subject =
                    subject;


                currentSubject =
                    subject;


                subjectSelect.innerHTML =
                    "";


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    subject;


                option.textContent =
                    subject;


                subjectSelect.appendChild(
                    option
                );


                subjectSelect.value =
                    subject;


                subjectSelect.disabled =
                    false;


                return;

            }

        }

    } catch (error) {

        console.error(
            "Teacher subject lookup error:",
            error
        );

    }


    subjectSelect.innerHTML = `
        <option value="">
            No subject assigned
        </option>
    `;


    subjectSelect.disabled =
        true;

}


/* =========================================================
   EVENTS
========================================================= */

function setupResultEvents() {

    if (classSelect) {

        classSelect.addEventListener(
            "change",
            async () => {

                const selectedClassId =
                    classSelect.value;


                if (!selectedClassId) {

                    currentClass =
                        null;


                    showEmptyMessage(
                        "Select a Class",
                        "Select a class to load students."
                    );


                    return;

                }


                currentClass =
                    assignedClasses.find(
                        item =>
                            item.id ===
                            selectedClassId
                    );


                await loadStudents();

            }
        );

    }


    if (subjectSelect) {

        subjectSelect.addEventListener(
            "change",
            async () => {

                currentSubject =
                    subjectSelect.value;


                if (classSelect.value) {

                    await loadStudents();

                }

            }
        );

    }


    if (termSelect) {

        termSelect.addEventListener(
            "change",
            async () => {

                if (classSelect.value) {

                    await loadStudents();

                }

            }
        );

    }


    if (sessionInput) {

        sessionInput.addEventListener(
            "change",
            async () => {

                if (classSelect.value) {

                    await loadStudents();

                }

            }
        );

    }

}


/* =========================================================
   LOAD STUDENTS
========================================================= */

async function loadStudents() {

    if (!currentClass) {

        return;

    }


    const classId =
        currentClass.id;


    const className =
        currentClass.name ||
        currentClass.className ||
        classId;


    resultsArea.innerHTML = `
        <div class="empty-state">

            <h3>
                Loading Students...
            </h3>

            <p>
                Please wait while students are loaded.
            </p>

        </div>
    `;


    try {

        const studentsQuery =
            query(
                collection(
                    db,
                    "students"
                ),
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
            studentDoc => {

                currentStudents.push({

                    firestoreId:
                        studentDoc.id,

                    ...studentDoc.data()

                });

            }
        );


        /* -------------------------------------------------
           SORT STUDENTS
        ------------------------------------------------- */

        currentStudents.sort(
            (a, b) => {

                const nameA =
                    `${a.firstName || ""} ${a.lastName || ""}`
                        .toLowerCase();


                const nameB =
                    `${b.firstName || ""} ${b.lastName || ""}`
                        .toLowerCase();


                return nameA.localeCompare(
                    nameB
                );

            }
        );


        console.log(
            "Students loaded:",
            currentStudents
        );


        if (
            currentStudents.length === 0
        ) {

            showEmptyMessage(
                "No Students Found",
                `No students are currently assigned to ${className}.`
            );


            return;

        }


        await renderResultsTable();

    } catch (error) {

        console.error(
            "Load students error:",
            error
        );


        resultsArea.innerHTML = `

            <div class="empty-state">

                <h3>
                    Unable to Load Students
                </h3>

                <p>
                    ${escapeHtml(
                        error.message ||
                        "An error occurred."
                    )}
                </p>

            </div>

        `;

    }

}


/* =========================================================
   RESULT DOCUMENT ID
========================================================= */

function cleanIdPart(value) {

    return String(value || "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(
            /[^a-zA-Z0-9\-]/g,
            ""
        );

}


function createResultDocumentId(
    classId,
    subject,
    term,
    session
) {

    return [

        classId,

        cleanIdPart(subject),

        cleanIdPart(term),

        cleanIdPart(session)

    ].join("_");

}


/* =========================================================
   RENDER RESULTS TABLE
========================================================= */

async function renderResultsTable() {

    const classId =
        currentClass.id;


    const className =
        currentClass.name ||
        currentClass.className ||
        classId;


    const subject =
        subjectSelect
            ? subjectSelect.value
            : currentSubject;


    const term =
        termSelect.value;


    const session =
        sessionInput.value.trim();


    if (!subject) {

        showEmptyMessage(
            "Subject Required",
            "No subject has been assigned to your teacher account."
        );


        return;

    }


    const resultDocId =
        createResultDocumentId(
            classId,
            subject,
            term,
            session
        );


    let existingRecords = {};


    try {

        const resultRef =
            doc(
                db,
                "results",
                resultDocId
            );


        const resultSnap =
            await getDoc(
                resultRef
            );


        if (resultSnap.exists()) {

            const data =
                resultSnap.data();


            existingRecords =
                data.records || {};

        }

    } catch (error) {

        console.error(
            "Error loading existing results:",
            error
        );

    }


    /* -------------------------------------------------
       TABLE
    ------------------------------------------------- */

    let html = `

        <div class="table-wrapper">

            <table class="results-table">

                <thead>

                    <tr>

                        <th>
                            Student
                        </th>

                        <th>
                            CA1<br>
                            <small>/10</small>
                        </th>

                        <th>
                            CA2<br>
                            <small>/10</small>
                        </th>

                        <th>
                            Class Work 1<br>
                            <small>/5</small>
                        </th>

                        <th>
                            Class Work 2<br>
                            <small>/5</small>
                        </th>

                        <th>
                            Assignment 1<br>
                            <small>/5</small>
                        </th>

                        <th>
                            Assignment 2<br>
                            <small>/5</small>
                        </th>

                        <th>
                            CA Total<br>
                            <small>/40</small>
                        </th>

                        <th>
                            Exam<br>
                            <small>/60</small>
                        </th>

                        <th>
                            Final Total<br>
                            <small>/100</small>
                        </th>

                        <th>
                            Grade
                        </th>

                        <th>
                            Remark
                        </th>

                    </tr>

                </thead>

                <tbody>
    `;


    currentStudents.forEach(
        student => {

            const studentId =
                student.firestoreId;


            const firstName =
                student.firstName || "";


            const lastName =
                student.lastName || "";


            const fullName =
                `${firstName} ${lastName}`
                    .trim();


            const record =
                existingRecords[
                    studentId
                ] || {};


            html += `

                <tr
                    data-student-id="${escapeAttribute(
                        studentId
                    )}"
                >

                    <td>

                        <strong>
                            ${escapeHtml(
                                fullName ||
                                "Unnamed Student"
                            )}
                        </strong>

                    </td>


                    ${createScoreInput(
                        "ca1",
                        record.ca1,
                        10
                    )}


                    ${createScoreInput(
                        "ca2",
                        record.ca2,
                        10
                    )}


                    ${createScoreInput(
                        "classWork1",
                        record.classWork1,
                        5
                    )}


                    ${createScoreInput(
                        "classWork2",
                        record.classWork2,
                        5
                    )}


                    ${createScoreInput(
                        "assignment1",
                        record.assignment1,
                        5
                    )}


                    ${createScoreInput(
                        "assignment2",
                        record.assignment2,
                        5
                    )}


                    <td
                        class="ca-total-cell"
                        data-ca-total-for="${escapeAttribute(
                            studentId
                        )}"
                    >
                        ${calculateCATotal(
                            record
                        )}
                    </td>


                    ${createScoreInput(
                        "exam",
                        record.exam,
                        60
                    )}


                    <td
                        class="total-cell"
                        data-total-for="${escapeAttribute(
                            studentId
                        )}"
                    >
                        ${calculateFinalTotal(
                            record
                        )}
                    </td>


                    <td
                        class="grade-cell"
                        data-grade-for="${escapeAttribute(
                            studentId
                        )}"
                    >
                        ${getGrade(
                            calculateFinalTotal(
                                record
                            )
                        )}
                    </td>


                    <td
                        class="remark-cell"
                        data-remark-for="${escapeAttribute(
                            studentId
                        )}"
                    >
                        ${getRemark(
                            calculateFinalTotal(
                                record
                            )
                        )}
                    </td>

                </tr>

            `;

        }
    );


    html += `

                </tbody>

            </table>

        </div>


        <div class="save-area">

            <button
                type="button"
                class="save-btn"
                id="saveResultsBtn"
            >
                Save Results
            </button>

        </div>

    `;


    resultsArea.innerHTML =
        html;


    resultsTitle.textContent =
        `${className} - ${subject}`;


    resultsSubtitle.textContent =
        `${term} | ${session} | Total: 100 Marks`;


    attachScoreEvents();


    const saveButton =
        document.getElementById(
            "saveResultsBtn"
        );


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveResults
        );

    }

}


/* =========================================================
   CREATE SCORE INPUT
========================================================= */

function createScoreInput(
    field,
    value,
    max
) {

    const safeValue =
        value === undefined ||
        value === null
            ? ""
            : value;


    return `

        <td>

            <input

                type="number"

                class="score-input"

                data-field="${field}"

                min="0"

                max="${max}"

                step="1"

                value="${escapeAttribute(
                    safeValue
                )}"

                placeholder="0"

            >

        </td>

    `;

}


/* =========================================================
   SCORE EVENTS
========================================================= */

function attachScoreEvents() {

    const inputs =
        document.querySelectorAll(
            ".score-input"
        );


    inputs.forEach(
        input => {

            input.addEventListener(
                "input",
                () => {

                    validateInputValue(
                        input
                    );


                    updateRowCalculations(
                        input.closest("tr")
                    );

                }
            );


            input.addEventListener(
                "blur",
                () => {

                    validateInputValue(
                        input
                    );


                    updateRowCalculations(
                        input.closest("tr")
                    );

                }
            );

        }
    );

}


/* =========================================================
   VALIDATE INDIVIDUAL INPUT
========================================================= */

function validateInputValue(input) {

    if (!input) {

        return true;

    }


    const field =
        input.dataset.field;


    const max =
        SCORE_LIMITS[field];


    if (!max) {

        return true;

    }


    let value =
        input.value;


    if (value === "") {

        return true;

    }


    value =
        Number(value);


    if (Number.isNaN(value)) {

        input.value = "";

        return false;

    }


    if (value < 0) {

        input.value = 0;

        return false;

    }


    if (value > max) {

        input.value = max;


        if (
            typeof Swal !== "undefined"
        ) {

            Swal.fire({

                icon: "warning",

                title: "Score Limit",

                text:
                    `${getFieldLabel(field)} cannot be more than ${max} marks.`,

                timer: 2200,

                showConfirmButton: false

            });

        }


        return false;

    }


    return true;

}


/* =========================================================
   UPDATE ROW CALCULATIONS
========================================================= */

function updateRowCalculations(row) {

    if (!row) {

        return;

    }


    const values =
        getRowScores(row);


    const caTotal =
        calculateCATotal(
            values
        );


    const finalTotal =
        caTotal +
        values.exam;


    const grade =
        getGrade(
            finalTotal
        );


    const remark =
        getRemark(
            finalTotal
        );


    const caCell =
        row.querySelector(
            ".ca-total-cell"
        );


    const totalCell =
        row.querySelector(
            ".total-cell"
        );


    const gradeCell =
        row.querySelector(
            ".grade-cell"
        );


    const remarkCell =
        row.querySelector(
            ".remark-cell"
        );


    if (caCell) {

        caCell.textContent =
            `${caTotal}/40`;

    }


    if (totalCell) {

        totalCell.textContent =
            `${finalTotal}/100`;

    }


    if (gradeCell) {

        gradeCell.textContent =
            grade;

    }


    if (remarkCell) {

        remarkCell.textContent =
            remark;

    }

}


/* =========================================================
   GET ROW SCORES
========================================================= */

function getRowScores(row) {

    return {

        ca1:
            getInputScore(
                row,
                "ca1"
            ),

        ca2:
            getInputScore(
                row,
                "ca2"
            ),

        classWork1:
            getInputScore(
                row,
                "classWork1"
            ),

        classWork2:
            getInputScore(
                row,
                "classWork2"
            ),

        assignment1:
            getInputScore(
                row,
                "assignment1"
            ),

        assignment2:
            getInputScore(
                row,
                "assignment2"
            ),

        exam:
            getInputScore(
                row,
                "exam"
            )

    };

}


/* =========================================================
   GET INPUT SCORE
========================================================= */

function getInputScore(
    row,
    field
) {

    const input =
        row.querySelector(
            `[data-field="${field}"]`
        );


    if (
        !input ||
        input.value === ""
    ) {

        return 0;

    }


    let value =
        Number(input.value);


    if (Number.isNaN(value)) {

        return 0;

    }


    const max =
        SCORE_LIMITS[field];


    if (value < 0) {

        value = 0;

    }


    if (value > max) {

        value = max;

    }


    return value;

}


/* =========================================================
   CALCULATE CA TOTAL
========================================================= */

function calculateCATotal(record) {

    return (

        Number(record.ca1 || 0) +

        Number(record.ca2 || 0) +

        Number(record.classWork1 || 0) +

        Number(record.classWork2 || 0) +

        Number(record.assignment1 || 0) +

        Number(record.assignment2 || 0)

    );

}


/* =========================================================
   CALCULATE FINAL TOTAL
========================================================= */

function calculateFinalTotal(record) {

    const caTotal =
        calculateCATotal(
            record
        );


    const exam =
        Number(
            record.exam || 0
        );


    return caTotal + exam;

}


/* =========================================================
   GRADE
========================================================= */

function getGrade(score) {

    score =
        Number(score || 0);


    if (score >= 75) {

        return "A";

    }


    if (score >= 65) {

        return "B";

    }


    if (score >= 55) {

        return "C";

    }


    if (score >= 45) {

        return "D";

    }


    if (score >= 40) {

        return "E";

    }


    return "F";

}


/* =========================================================
   REMARK
========================================================= */

function getRemark(score) {

    score =
        Number(score || 0);


    if (score >= 75) {

        return "Excellent";

    }


    if (score >= 65) {

        return "Very Good";

    }


    if (score >= 55) {

        return "Good";

    }


    if (score >= 45) {

        return "Fair";

    }


    if (score >= 40) {

        return "Pass";

    }


    return "Fail";

}


/* =========================================================
   FIELD LABEL
========================================================= */

function getFieldLabel(field) {

    const labels = {

        ca1: "CA1",

        ca2: "CA2",

        classWork1: "Class Work 1",

        classWork2: "Class Work 2",

        assignment1: "Assignment 1",

        assignment2: "Assignment 2",

        exam: "Examination"

    };


    return labels[field] ||
        "This score";

}


/* =========================================================
   SAVE RESULTS
========================================================= */

async function saveResults() {

    if (!currentClass) {

        Swal.fire(
            "Select Class",
            "Please select a class first.",
            "warning"
        );

        return;

    }


    const subject =
        subjectSelect
            ? subjectSelect.value
            : currentSubject;


    const term =
        termSelect.value;


    const session =
        sessionInput.value.trim();


    if (!subject) {

        Swal.fire(
            "Subject Required",
            "Please select a subject.",
            "warning"
        );

        return;

    }


    if (!session) {

        Swal.fire(
            "Session Required",
            "Please enter the academic session.",
            "warning"
        );

        return;

    }


    const saveButton =
        document.getElementById(
            "saveResultsBtn"
        );


    if (saveButton) {

        saveButton.disabled =
            true;

        saveButton.textContent =
            "Saving...";

    }


    try {

        const records = {};


        const rows =
            document.querySelectorAll(
                ".results-table tbody tr"
            );


        /* -------------------------------------------------
           VALIDATE ALL STUDENTS FIRST
        ------------------------------------------------- */

        for (
            const row of rows
        ) {

            const studentId =
                row.dataset.studentId;


            if (!studentId) {

                continue;

            }


            const inputs =
                row.querySelectorAll(
                    ".score-input"
                );


            for (
                const input of inputs
            ) {

                const field =
                    input.dataset.field;


                const max =
                    SCORE_LIMITS[field];


                if (
                    input.value !== ""
                    &&
                    (
                        Number(input.value) < 0 ||
                        Number(input.value) > max
                    )
                ) {

                    throw new Error(

                        `${getFieldLabel(field)} cannot be more than ${max} marks.`
                    );

                }

            }


            const scores =
                getRowScores(row);


            const caTotal =
                calculateCATotal(
                    scores
                );


            const total =
                caTotal +
                scores.exam;


            const grade =
                getGrade(total);


            const remark =
                getRemark(total);


            records[studentId] = {

                ca1:
                    scores.ca1,

                ca2:
                    scores.ca2,

                classWork1:
                    scores.classWork1,

                classWork2:
                    scores.classWork2,

                assignment1:
                    scores.assignment1,

                assignment2:
                    scores.assignment2,

                caTotal,

                exam:
                    scores.exam,

                total,

                grade,

                remark

            };

        }


        /* -------------------------------------------------
           RESULT DOCUMENT ID
        ------------------------------------------------- */

        const resultDocId =
            createResultDocumentId(
                currentClass.id,
                subject,
                term,
                session
            );


        const resultRef =
            doc(
                db,
                "results",
                resultDocId
            );


        /* -------------------------------------------------
           RESULT DATA
        ------------------------------------------------- */

        const resultData = {

            classId:
                currentClass.id,

            className:
                currentClass.name ||
                currentClass.className ||
                currentClass.id,

            subject,

            term,

            session,

            teacherUid:
                auth.currentUser.uid,

            teacherId:
                currentTeacher.teacherId ||
                "",

            teacherName:
                currentTeacher.name ||
                "Teacher",

            updatedBy:
                auth.currentUser.uid,

            records,

            totalStudents:
                currentStudents.length,

            gradingSystem: {

                caMaximum: 40,

                examMaximum: 60,

                totalMaximum: 100

            },

            updatedAt:
                serverTimestamp()

        };


        /* -------------------------------------------------
           SAVE TO FIRESTORE
        ------------------------------------------------- */

        await setDoc(
            resultRef,
            resultData,
            {
                merge: true
            }
        );


        Swal.fire({

            icon: "success",

            title: "Results Saved",

            text:
                "Student results have been saved successfully.",

            timer: 2200,

            showConfirmButton: false

        });


    } catch (error) {

        console.error(
            "Save results error:",
            error
        );


        Swal.fire(
            "Save Failed",
            error.message ||
            "Unable to save results.",
            "error"
        );


    } finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.textContent =
                "Save Results";

        }

    }

}


/* =========================================================
   EMPTY MESSAGE
========================================================= */

function showEmptyMessage(
    title,
    message
) {

    if (!resultsArea) {

        return;

    }


    resultsArea.innerHTML = `

        <div class="empty-state">

            <h3>
                ${escapeHtml(title)}
            </h3>

            <p>
                ${escapeHtml(message)}
            </p>

        </div>

    `;

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value) {

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


function escapeAttribute(value) {

    return escapeHtml(value);

}