import {
    collection,
    getDocs,
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
    auth,
    db
} from "./firebase-config.js";


// ============================================================
// DOM ELEMENTS
// ============================================================

const reportSession =
    document.getElementById("reportSession");

const reportTerm =
    document.getElementById("reportTerm");

const reportClass =
    document.getElementById("reportClass");

const reportStudent =
    document.getElementById("reportStudent");

const generateReportBtn =
    document.getElementById("generateReportBtn");

const reportCard =
    document.getElementById("reportCard");

const reportStudentName =
    document.getElementById("reportStudentName");

const reportAdmissionNo =
    document.getElementById("reportAdmissionNo");

const reportClassName =
    document.getElementById("reportClassName");

const reportSessionName =
    document.getElementById("reportSessionName");

const reportTermTitle =
    document.getElementById("reportTermTitle");

const reportResultsBody =
    document.getElementById("reportResultsBody");

const subjectsOffered =
    document.getElementById("subjectsOffered");

const totalScore =
    document.getElementById("totalScore");

const averageScore =
    document.getElementById("averageScore");

const studentPosition =
    document.getElementById("studentPosition");

const schoolDays =
    document.getElementById("schoolDays");

const daysPresent =
    document.getElementById("daysPresent");

const daysAbsent =
    document.getElementById("daysAbsent");

const conductBody =
    document.getElementById("conductBody");

const teacherComment =
    document.getElementById("teacherComment");

const principalComment =
    document.getElementById("principalComment");

const promotionStatus =
    document.getElementById("promotionStatus");

const saveReportCardBtn =
    document.getElementById("saveReportCardBtn");

const printReportBtn =
    document.getElementById("printReportBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const menuToggle =
    document.getElementById("menuToggle");

const sidebar =
    document.getElementById("sidebar");

const currentAdminName =
    document.getElementById("currentAdminName");

const adminAvatar =
    document.getElementById("adminAvatar");


// ============================================================
// DATA
// ============================================================

let allClasses = [];

let allStudents = [];

let allSubjects = [];

let allResults = [];

let allAttendance = [];

let currentStudent = null;

let currentClass = null;

let currentReport = null;


// ============================================================
// HELPERS
// ============================================================

function text(value, fallback = "") {

    if (
        value === undefined ||
        value === null
    ) {
        return fallback;
    }

    return String(value);

}


function num(value) {

    const result =
        Number(value);

    return Number.isFinite(result)
        ? result
        : 0;

}


function normalize(value) {

    return text(value)
        .trim()
        .toLowerCase();

}


function studentName(student) {

    if (!student) {
        return "";
    }


    if (student.name) {

        return text(student.name)
            .trim();

    }


    return (
        `${text(student.firstName)} ${text(student.lastName)}`
            .trim()
    );

}


function getStudentClassName(student) {

    return text(
        student?.studentClass ||
        student?.className
    ).trim();

}


// ============================================================
// GRADING SYSTEM
// ============================================================

function getGrade(score) {

    const value =
        num(score);


    if (value >= 75) {
        return "A";
    }


    if (value >= 65) {
        return "B";
    }


    if (value >= 55) {
        return "C";
    }


    if (value >= 45) {
        return "D";
    }


    if (value >= 40) {
        return "E";
    }


    return "F";

}


function getRemark(score) {

    const value =
        num(score);


    if (value >= 75) {
        return "Excellent";
    }


    if (value >= 65) {
        return "Very Good";
    }


    if (value >= 55) {
        return "Good";
    }


    if (value >= 45) {
        return "Fair";
    }


    if (value >= 40) {
        return "Pass";
    }


    return "Fail";

}


// ============================================================
// ADMIN NAME
// ============================================================

function loadAdminDisplay() {

    const email =
        localStorage.getItem(
            "adminEmail"
        );


    const username =
        localStorage.getItem(
            "adminUsername"
        );


    const displayName =
        username ||
        email ||
        "Administrator";


    if (currentAdminName) {

        currentAdminName.textContent =
            displayName;

    }


    if (adminAvatar) {

        adminAvatar.textContent =
            displayName
                .charAt(0)
                .toUpperCase();

    }

}


// ============================================================
// LOAD CLASSES
// ============================================================

async function loadClasses() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "classes"
            )
        );


    allClasses = [];


    const seen =
        new Set();


    snapshot.forEach(docSnap => {

        const data =
            docSnap.data();


        const name =
            text(data.name)
                .trim();


        if (!name) {
            return;
        }


        const key =
            normalize(name);


        if (seen.has(key)) {
            return;
        }


        seen.add(key);


        allClasses.push({

            firestoreId:
                docSnap.id,

            ...data

        });

    });


    allClasses.sort(
        (a, b) =>
            text(a.name)
                .localeCompare(
                    text(b.name)
                )
    );


    reportClass.innerHTML =
        `
        <option value="">
            Select Class
        </option>
        `;


    allClasses.forEach(cls => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            cls.firestoreId;


        option.textContent =
            cls.name;


        reportClass.appendChild(
            option
        );

    });


    console.log(
        "Classes loaded:",
        allClasses
    );

}


// ============================================================
// LOAD STUDENTS
// ============================================================

async function loadStudents() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "students"
            )
        );


    allStudents = [];


    snapshot.forEach(docSnap => {

        allStudents.push({

            firestoreId:
                docSnap.id,

            ...docSnap.data()

        });

    });


    reportStudent.innerHTML =
        `
        <option value="">
            Select Student
        </option>
        `;


    console.log(
        "Students loaded:",
        allStudents.length
    );

}


// ============================================================
// POPULATE STUDENTS
// ============================================================

function populateStudentsForClass(
    classId
) {

    reportStudent.innerHTML =
        `
        <option value="">
            Select Student
        </option>
        `;


    if (!classId) {
        return;
    }


    const selectedClass =
        allClasses.find(
            cls =>
                cls.firestoreId ===
                classId
        );


    if (!selectedClass) {
        return;
    }


    const className =
        normalize(
            selectedClass.name
        );


    const students =
        allStudents.filter(
            student => {

                /*
                 * New student records use classId.
                 */

                if (
                    student.classId &&
                    student.classId ===
                    classId
                ) {

                    return true;

                }


                /*
                 * Older student records
                 * may only have studentClass.
                 */

                return (
                    normalize(
                        getStudentClassName(
                            student
                        )
                    ) === className
                );

            }
        );


    students.sort(
        (a, b) =>
            studentName(a)
                .localeCompare(
                    studentName(b)
                )
    );


    students.forEach(student => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            student.firestoreId;


        option.textContent =
            studentName(student);


        reportStudent.appendChild(
            option
        );

    });


    console.log(
        "Students for selected class:",
        students
    );

}


// ============================================================
// LOAD SUBJECTS
// ============================================================

async function loadSubjects() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "subjects"
            )
        );


    allSubjects = [];


    snapshot.forEach(docSnap => {

        allSubjects.push({

            firestoreId:
                docSnap.id,

            ...docSnap.data()

        });

    });


    console.log(
        "Subjects loaded:",
        allSubjects
    );

}


// ============================================================
// RESOLVE SUBJECT NAME
// ============================================================

function resolveSubjectName(
    result
) {

    /*
     * First check the normal field used
     * by teacher-results.js.
     */

    const directSubject =
        text(
            result.subject ||
            result.subjectName ||
            result.subjectTitle
        ).trim();


    if (
        directSubject &&
        normalize(directSubject) !==
            "subject"
    ) {

        return directSubject;

    }


    /*
     * Some records may store subjectId.
     */

    const subjectId =
        text(
            result.subjectId ||
            result.subjectID
        ).trim();


    if (subjectId) {

        const found =
            allSubjects.find(
                subject => {

                    return (
                        subject.firestoreId ===
                        subjectId
                    )
                    ||
                    text(subject.id) ===
                        subjectId;

                }
            );


        if (found) {

            return text(
                found.name ||
                found.subjectName ||
                found.title,
                "Unknown Subject"
            );

        }

    }


    /*
     * Try matching the result's subject
     * against subject collection.
     */

    if (directSubject) {

        const found =
            allSubjects.find(
                subject =>
                    normalize(
                        subject.name ||
                        subject.subjectName
                    ) ===
                    normalize(
                        directSubject
                    )
            );


        if (found) {

            return text(
                found.name ||
                found.subjectName
            );

        }

    }


    return "Unknown Subject";

}


// ============================================================
// LOAD RESULTS
// ============================================================

async function loadResults() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "results"
            )
        );


    allResults = [];


    snapshot.forEach(docSnap => {

        allResults.push({

            firestoreId:
                docSnap.id,

            ...docSnap.data()

        });

    });


    console.log(
        "Results loaded:",
        allResults.length
    );


    console.log(
        "Result documents:",
        allResults
    );

}


// ============================================================
// LOAD ATTENDANCE
// ============================================================

async function loadAttendance() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "attendance"
            )
        );


    allAttendance = [];


    snapshot.forEach(docSnap => {

        allAttendance.push({

            firestoreId:
                docSnap.id,

            ...docSnap.data()

        });

    });


    console.log(
        "Attendance loaded:",
        allAttendance.length
    );

}


// ============================================================
// CHECK RESULT DOCUMENT
// ============================================================

function resultDocumentMatches(
    result,
    classId,
    className,
    term,
    session
) {

    const resultClassId =
        text(result.classId);


    const resultClassName =
        normalize(
            result.className
        );


    const wantedClassName =
        normalize(
            className
        );


    const classMatches =
        (
            resultClassId &&
            resultClassId === classId
        )
        ||
        (
            resultClassName &&
            resultClassName ===
                wantedClassName
        );


    const resultTerm =
        normalize(
            result.term
        );


    const wantedTerm =
        normalize(term);


    const resultSession =
        normalize(
            result.session
        );


    const wantedSession =
        normalize(session);


    const termMatches =
        resultTerm ===
        wantedTerm;


    const sessionMatches =
        resultSession ===
        wantedSession;


    return (
        classMatches &&
        termMatches &&
        sessionMatches
    );

}


// ============================================================
// GET MATCHING RESULT DOCUMENTS
// ============================================================

function getMatchingResultDocuments(
    classId,
    className,
    term,
    session
) {

    return allResults.filter(
        result =>
            resultDocumentMatches(
                result,
                classId,
                className,
                term,
                session
            )
    );

}


// ============================================================
// FIND STUDENT RECORD INSIDE RESULT
// ============================================================

function findStudentRecord(
    result,
    student
) {

    if (!result || !student) {
        return null;
    }


    const records =
        result.records || {};


    const firestoreId =
        text(
            student.firestoreId
        );


    const customId =
        text(
            student.id
        );


    const admissionNo =
        text(
            student.admissionNo ||
            student.admissionNumber
        );


    /*
     * 1. Firestore document ID
     */

    if (
        firestoreId &&
        records[firestoreId]
    ) {

        return records[firestoreId];

    }


    /*
     * 2. Custom student ID
     */

    if (
        customId &&
        records[customId]
    ) {

        return records[customId];

    }


    /*
     * 3. Admission number
     */

    if (
        admissionNo &&
        records[admissionNo]
    ) {

        return records[admissionNo];

    }


    /*
     * 4. Search inside record data.
     */

    for (
        const [
            recordKey,
            record
        ]
        of Object.entries(records)
    ) {

        if (!record) {
            continue;
        }


        if (
            text(record.studentId) ===
            firestoreId
        ) {

            return record;

        }


        if (
            text(record.firestoreId) ===
            firestoreId
        ) {

            return record;

        }


        if (
            text(record.studentId) ===
            customId
        ) {

            return record;

        }


        if (
            normalize(
                record.studentName
            ) ===
            normalize(
                studentName(student)
            )
        ) {

            return record;

        }


        if (
            text(record.admissionNo) ===
            admissionNo
        ) {

            return record;

        }


        if (
            recordKey ===
            firestoreId
        ) {

            return record;

        }

    }


    return null;

}


// ============================================================
// GET STUDENT TOTAL
// ============================================================

function getStudentAggregateTotal(
    student,
    matchingResults
) {

    let total = 0;


    matchingResults.forEach(
        result => {

            const record =
                findStudentRecord(
                    result,
                    student
                );


            if (!record) {
                return;
            }


            /*
             * Prefer saved final total.
             */

            let savedTotal =
                Number(record.total);


            /*
             * If total wasn't saved,
             * calculate it.
             */

            if (
                !Number.isFinite(
                    savedTotal
                )
            ) {

                const caTotal =
                    num(record.ca1) +
                    num(record.ca2) +
                    num(record.classWork1) +
                    num(record.classWork2) +
                    num(record.assignment1) +
                    num(record.assignment2);


                savedTotal =
                    caTotal +
                    num(record.exam);

            }


            total +=
                savedTotal;

        }
    );


    return total;

}


// ============================================================
// FIND STUDENT RESULT
// ============================================================

function findStudentResult(
    student,
    matchingResults
) {

    for (
        const result
        of matchingResults
    ) {

        const record =
            findStudentRecord(
                result,
                student
            );


        if (record) {

            return {

                resultDocument:
                    result,

                record

            };

        }

    }


    return null;

}


// ============================================================
// CALCULATE POSITION
// ============================================================

function calculatePosition(
    selectedStudent,
    classId,
    className,
    term,
    session
) {

    const matchingResults =
        getMatchingResultDocuments(
            classId,
            className,
            term,
            session
        );


    const classStudents =
        allStudents.filter(
            student => {

                if (
                    student.classId &&
                    student.classId ===
                    classId
                ) {

                    return true;

                }


                return (
                    normalize(
                        getStudentClassName(
                            student
                        )
                    ) ===
                    normalize(
                        className
                    )
                );

            }
        );


    const totals =
        classStudents.map(
            student => ({

                student,

                total:
                    getStudentAggregateTotal(
                        student,
                        matchingResults
                    )

            })
        );


    /*
     * Sort highest score first.
     */

    totals.sort(
        (a, b) =>
            b.total - a.total
    );


    /*
     * Students with no result should
     * not receive a meaningful position.
     */

    const studentsWithResults =
        totals.filter(
            item =>
                item.total > 0
        );


    const selectedTotal =
        getStudentAggregateTotal(
            selectedStudent,
            matchingResults
        );


    if (
        selectedTotal <= 0
    ) {

        return "—";

    }


    /*
     * Competition ranking:
     *
     * 1st
     * 2nd
     * 2nd
     * 4th
     */

    const position =
        studentsWithResults.findIndex(
            item =>
                item.student.firestoreId ===
                selectedStudent.firestoreId
        );


    if (position === -1) {

        return "—";

    }


    const rank =
        position + 1;


    return (
        `${rank}${getOrdinal(rank)}`
    );

}


function getOrdinal(value) {

    const mod100 =
        value % 100;


    if (
        mod100 >= 11 &&
        mod100 <= 13
    ) {

        return "th";

    }


    switch (
        value % 10
    ) {

        case 1:
            return "st";

        case 2:
            return "nd";

        case 3:
            return "rd";

        default:
            return "th";

    }

}


// ============================================================
// LOAD ATTENDANCE FOR STUDENT
// ============================================================

function getStudentAttendance(
    student,
    classId
) {

    let present = 0;

    let absent = 0;


    allAttendance.forEach(
        attendance => {

            if (
                text(
                    attendance.classId
                ) !==
                text(classId)
            ) {

                return;

            }


            const records =
                attendance.records || {};


            const status =
                records[
                    student.firestoreId
                ];


            if (
                normalize(status) ===
                "present"
            ) {

                present++;

            }


            if (
                normalize(status) ===
                "absent"
            ) {

                absent++;

            }

        }
    );


    return {

        schoolDays:
            present + absent,

        present,

        absent

    };

}


// ============================================================
// CONDUCT
// ============================================================

function renderConduct(
    existingConduct = {}
) {

    if (!conductBody) {
        return;
    }


    const traits = [

        "Punctuality",

        "Neatness",

        "Class Participation",

        "Leadership",

        "Respect for Others",

        "Teamwork",

        "Responsibility",

        "Self-Control"

    ];


    conductBody.innerHTML = "";


    traits.forEach(
        trait => {

            const row =
                document.createElement(
                    "tr"
                );


            const oldValue =
                text(
                    existingConduct[
                        trait
                    ]
                );


            row.innerHTML = `

                <td>
                    ${trait}
                </td>

                <td>

                    <select
                        class="conduct-rating"
                        data-trait="${trait}"
                    >

                        <option value="">
                            Select
                        </option>

                        <option
                            value="Excellent"
                            ${oldValue === "Excellent" ? "selected" : ""}
                        >
                            Excellent
                        </option>

                        <option
                            value="Very Good"
                            ${oldValue === "Very Good" ? "selected" : ""}
                        >
                            Very Good
                        </option>

                        <option
                            value="Good"
                            ${oldValue === "Good" ? "selected" : ""}
                        >
                            Good
                        </option>

                        <option
                            value="Fair"
                            ${oldValue === "Fair" ? "selected" : ""}
                        >
                            Fair
                        </option>

                        <option
                            value="Poor"
                            ${oldValue === "Poor" ? "selected" : ""}
                        >
                            Poor
                        </option>

                    </select>

                </td>

            `;


            conductBody.appendChild(
                row
            );

        }
    );

}


// ============================================================
// GENERATE REPORT CARD
// ============================================================

async function generateReport() {

    const classId =
        reportClass.value;

    const studentId =
        reportStudent.value;

    const term =
        reportTerm.value;

    const session =
        reportSession.value;


    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!session) {

        Swal.fire(
            "Select Session",
            "Please select the academic session.",
            "warning"
        );

        return;

    }


    if (!term) {

        Swal.fire(
            "Select Term",
            "Please select the term.",
            "warning"
        );

        return;

    }


    if (!classId) {

        Swal.fire(
            "Select Class",
            "Please select a class.",
            "warning"
        );

        return;

    }


    if (!studentId) {

        Swal.fire(
            "Select Student",
            "Please select a student.",
            "warning"
        );

        return;

    }


    currentClass =
        allClasses.find(
            cls =>
                cls.firestoreId ===
                classId
        );


    currentStudent =
        allStudents.find(
            student =>
                student.firestoreId ===
                studentId
        );


    if (
        !currentClass ||
        !currentStudent
    ) {

        Swal.fire(
            "Error",
            "The selected class or student could not be found.",
            "error"
        );

        return;

    }


    const className =
        text(
            currentClass.name
        );


    console.log(
        "Generating report:",
        {
            classId,
            className,
            studentId,
            studentName:
                studentName(
                    currentStudent
                ),
            term,
            session
        }
    );


    // --------------------------------------------------------
    // FIND MATCHING RESULT DOCUMENTS
    // --------------------------------------------------------

    const matchingResults =
        getMatchingResultDocuments(
            classId,
            className,
            term,
            session
        );


    console.log(
        "Matching result documents:",
        matchingResults
    );


    if (
        matchingResults.length === 0
    ) {

        Swal.fire({

            icon: "warning",

            title: "No Results Found",

            html: `
                No result document was found for:

                <br><br>

                <strong>
                    ${studentName(currentStudent)}
                </strong>

                <br>

                Class:
                <strong>
                    ${className}
                </strong>

                <br>

                Term:
                <strong>
                    ${term}
                </strong>

                <br>

                Session:
                <strong>
                    ${session}
                </strong>
            `

        });

        return;

    }


    // --------------------------------------------------------
    // FIND STUDENT RESULT
    // --------------------------------------------------------

    const firstStudentResult =
        findStudentResult(
            currentStudent,
            matchingResults
        );


    if (!firstStudentResult) {

        console.error(
            "Result documents exist, but student was not found inside records.",
            {
                student:
                    currentStudent,

                matchingResults
            }
        );


        Swal.fire({

            icon: "warning",

            title: "No Result Found for Student",

            html: `
                Result documents exist for this
                class, term and session, but the
                selected student's result record
                could not be matched.

                <br><br>

                Student:
                <strong>
                    ${studentName(currentStudent)}
                </strong>
            `

        });

        return;

    }


    // --------------------------------------------------------
    // STUDENT INFORMATION
    // --------------------------------------------------------

    reportStudentName.textContent =
        studentName(
            currentStudent
        );


    reportAdmissionNo.textContent =
        text(
            currentStudent.id ||
            currentStudent.admissionNo ||
            currentStudent.admissionNumber,
            "—"
        );


    reportClassName.textContent =
        className;


    reportSessionName.textContent =
        session;


    reportTermTitle.textContent =
        term;


    // --------------------------------------------------------
    // RESULTS TABLE
    // --------------------------------------------------------

    reportResultsBody.innerHTML = "";


    let totalMarks = 0;

    let subjectCount = 0;


    /*
     * Prevent duplicate subject rows.
     */

    const displayedSubjects =
        new Set();


    /*
     * Sort results alphabetically
     * by subject.
     */

    const sortedResults =
        [...matchingResults].sort(
            (a, b) => {

                const subjectA =
                    resolveSubjectName(a);

                const subjectB =
                    resolveSubjectName(b);

                return subjectA.localeCompare(
                    subjectB
                );

            }
        );


    sortedResults.forEach(
        result => {

            const record =
                findStudentRecord(
                    result,
                    currentStudent
                );


            if (!record) {
                return;
            }


            const subject =
                resolveSubjectName(
                    result
                );


            /*
             * Use a stable subject key.
             */

            const subjectKey =
                normalize(subject);


            /*
             * Avoid duplicate subject rows.
             */

            if (
                displayedSubjects.has(
                    subjectKey
                )
            ) {

                return;

            }


            displayedSubjects.add(
                subjectKey
            );


            // ------------------------------------------------
            // SCORES
            // ------------------------------------------------

            const classWork1 =
                num(
                    record.classWork1
                );


            const classWork2 =
                num(
                    record.classWork2
                );


            const assignment1 =
                num(
                    record.assignment1
                );


            const assignment2 =
                num(
                    record.assignment2
                );


            const ca1 =
                num(
                    record.ca1
                );


            const ca2 =
                num(
                    record.ca2
                );


            const exam =
                num(
                    record.exam
                );


            const calculatedCA =
                classWork1 +
                classWork2 +
                assignment1 +
                assignment2 +
                ca1 +
                ca2;


            /*
             * Prefer the saved CA total if present.
             */

            const caTotal =
                Number.isFinite(
                    Number(
                        record.caTotal
                    )
                )
                    ? num(
                        record.caTotal
                    )
                    : calculatedCA;


            /*
             * Prefer saved final total.
             */

            const savedTotal =
                Number(
                    record.total
                );


            const finalTotal =
                Number.isFinite(
                    savedTotal
                )
                    ? savedTotal
                    : (
                        caTotal +
                        exam
                    );


            const grade =
                getGrade(
                    finalTotal
                );


            const remark =
                getRemark(
                    finalTotal
                );


            // ------------------------------------------------
            // ROW
            // ------------------------------------------------

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${subjectCount + 1}
                </td>

                <td>
                    ${subject}
                </td>

                <td>
                    ${classWork1}
                </td>

                <td>
                    ${classWork2}
                </td>

                <td>
                    ${assignment1}
                </td>

                <td>
                    ${assignment2}
                </td>

                <td>
                    ${ca1}
                </td>

                <td>
                    ${ca2}
                </td>

                <td>
                    ${exam}
                </td>

                <td class="score-grade">
                    ${finalTotal}
                </td>

                <td class="score-grade">
                    ${grade}
                </td>

                <td>
                    ${remark}
                </td>

            `;


            reportResultsBody.appendChild(
                row
            );


            totalMarks +=
                finalTotal;


            subjectCount++;

        }
    );


    // --------------------------------------------------------
    // NO SUBJECT RESULT
    // --------------------------------------------------------

    if (
        subjectCount === 0
    ) {

        Swal.fire(
            "No Result Found",
            "The result documents exist, but no result for this student could be displayed.",
            "warning"
        );

        return;

    }


    // --------------------------------------------------------
    // SUMMARY
    // --------------------------------------------------------

    const average =
        totalMarks /
        subjectCount;


    subjectsOffered.textContent =
        subjectCount;


    totalScore.textContent =
        totalMarks.toFixed(2);


    averageScore.textContent =
        average.toFixed(2);


    // --------------------------------------------------------
    // POSITION
    // --------------------------------------------------------

    studentPosition.textContent =
        calculatePosition(
            currentStudent,
            classId,
            className,
            term,
            session
        );


    // --------------------------------------------------------
    // ATTENDANCE
    // --------------------------------------------------------

    const attendance =
        getStudentAttendance(
            currentStudent,
            classId
        );


    schoolDays.textContent =
        attendance.schoolDays;


    daysPresent.textContent =
        attendance.present;


    daysAbsent.textContent =
        attendance.absent;


    // --------------------------------------------------------
    // CONDUCT
    // --------------------------------------------------------

    renderConduct();


    // --------------------------------------------------------
    // COMMENTS
    // --------------------------------------------------------

    teacherComment.value = "";

    principalComment.value = "";

    promotionStatus.value = "";


    // --------------------------------------------------------
    // CURRENT REPORT DATA
    // --------------------------------------------------------

    currentReport = {

        studentId:
            currentStudent.firestoreId,

        studentName:
            studentName(
                currentStudent
            ),

        classId,

        className,

        term,

        session,

        totalMarks,

        average,

        subjectCount

    };


    // --------------------------------------------------------
    // SHOW
    // --------------------------------------------------------

    reportCard.style.display =
        "block";


    reportCard.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });


    console.log(
        "Report generated successfully:",
        currentReport
    );

}


// ============================================================
// SAVE REPORT CARD
// ============================================================

async function saveReportCard() {

    if (
        !currentReport ||
        !currentStudent ||
        !currentClass
    ) {

        Swal.fire(
            "Generate Report First",
            "Please generate a report card before saving it.",
            "warning"
        );

        return;

    }


    const conduct = {};


    document
        .querySelectorAll(
            ".conduct-rating"
        )
        .forEach(
            select => {

                conduct[
                    select.dataset.trait
                ] = select.value;

            }
        );


    const reportId =
        `${currentStudent.firestoreId}_${currentReport.session}_${currentReport.term}`
            .replace(
                /[^a-zA-Z0-9_-]/g,
                "_"
            );


    const reportData = {

        studentId:
            currentStudent.firestoreId,

        studentName:
            studentName(
                currentStudent
            ),

        admissionNo:
            text(
                currentStudent.id ||
                currentStudent.admissionNo ||
                currentStudent.admissionNumber
            ),

        classId:
            currentReport.classId,

        className:
            currentReport.className,

        session:
            currentReport.session,

        term:
            currentReport.term,

        subjectsOffered:
            currentReport.subjectCount,

        totalScore:
            currentReport.totalMarks,

        averageScore:
            currentReport.average,

        position:
            studentPosition.textContent,

        schoolDays:
            num(
                schoolDays.textContent
            ),

        daysPresent:
            num(
                daysPresent.textContent
            ),

        daysAbsent:
            num(
                daysAbsent.textContent
            ),

        conduct,

        teacherComment:
            text(
                teacherComment.value
            ),

        principalComment:
            text(
                principalComment.value
            ),

        promotionStatus:
            text(
                promotionStatus.value
            ),

        updatedAt:
            serverTimestamp()

    };


    try {

        saveReportCardBtn.disabled =
            true;


        saveReportCardBtn.textContent =
            "Saving...";


        await setDoc(
            doc(
                db,
                "reportCards",
                reportId
            ),
            reportData,
            {
                merge: true
            }
        );


        Swal.fire(
            "Saved",
            "Report card saved successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Save report card error:",
            error
        );


        Swal.fire(
            "Error",
            error.message ||
            "Unable to save report card.",
            "error"
        );

    } finally {

        saveReportCardBtn.disabled =
            false;


        saveReportCardBtn.textContent =
            "💾 Save Report Card";

    }

}


// ============================================================
// PRINT
// ============================================================

function printReport() {

    if (
        !currentReport
    ) {

        Swal.fire(
            "Generate Report First",
            "Please generate a report card before printing.",
            "warning"
        );

        return;

    }


    window.print();

}


// ============================================================
// LOGOUT
// ============================================================

async function logout() {

    try {

        await auth.signOut();

        localStorage.removeItem(
            "adminLoggedIn"
        );

        localStorage.removeItem(
            "adminUsername"
        );

        localStorage.removeItem(
            "adminUid"
        );

        localStorage.removeItem(
            "adminEmail"
        );


        window.location.href =
            "admin-login.html";


    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }

}


// ============================================================
// MENU
// ============================================================

function setupMenu() {

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


// ============================================================
// EVENTS
// ============================================================

function setupEvents() {

    reportClass.addEventListener(
        "change",
        () => {

            populateStudentsForClass(
                reportClass.value
            );

        }
    );


    generateReportBtn.addEventListener(
        "click",
        generateReport
    );


    saveReportCardBtn.addEventListener(
        "click",
        saveReportCard
    );


    printReportBtn.addEventListener(
        "click",
        printReport
    );


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            logout
        );

    }


    setupMenu();

}


// ============================================================
// INITIALIZE
// ============================================================

async function initialize() {

    try {

        /*
         * Wait for the admin guard if
         * admin-login.js exposes it.
         */

        if (
            typeof window.adminReady !==
            "undefined"
        ) {

            await window.adminReady;

        }


        loadAdminDisplay();


        await loadClasses();

        await loadStudents();

        await loadSubjects();

        await loadResults();

        await loadAttendance();


        setupEvents();


        console.log(
            "Report card system ready."
        );


    } catch (error) {

        console.error(
            "Report card initialization error:",
            error
        );


        if (
            typeof Swal !==
            "undefined"
        ) {

            Swal.fire(
                "Error",
                "Unable to load the report card system.",
                "error"
            );

        }

    }

}


// ============================================================
// AUTH
// ============================================================

onAuthStateChanged(
    auth,
    async user => {

        if (!user) {
            return;
        }


        await initialize();

    }
);