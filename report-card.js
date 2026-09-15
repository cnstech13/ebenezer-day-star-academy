import { adminReady, withTimeout } from "./admin-guard.js";
/* =========================================================
   Ebenezer Day Star Academy
   REPORT CARD SYSTEM
   COMPLETE CORRECTED FIRESTORE VERSION

await adminReady;

   Works with:
   - students
   - classes
   - subjects
   - results
   - attendanceRecords
   - reportCards

   SCORE STRUCTURE:

   CW1           = 5
   CW2           = 5
   Assignment1  = 5
   Assignment2  = 5
   CA1           = 10
   CA2           = 10
   Exam          = 60
   ------------------
   TOTAL         = 100
========================================================= */


import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";


/* =========================================================
   FIRESTORE COLLECTION NAMES
========================================================= */

const STUDENTS_COLLECTION =
    "students";

const CLASSES_COLLECTION =
    "classes";

const SUBJECTS_COLLECTION =
    "subjects";

const RESULTS_COLLECTION =
    "results";

const ATTENDANCE_COLLECTION =
    "attendanceRecords";

const REPORTS_COLLECTION =
    "reportCards";


/* =========================================================
   DATA
========================================================= */

let reportStudents = [];

let reportClasses = [];

let reportSubjects = [];


/* =========================================================
   CONDUCT / PSYCHOMOTOR TRAITS
========================================================= */

const conductTraits = [

    "Punctuality",

    "Neatness",

    "Attentiveness",

    "Class Participation",

    "Leadership",

    "Teamwork",

    "Responsibility",

    "Creativity",

    "Self Confidence",

    "Self Control",

    "Relationship With Others",

    "Sports"

];


/* =========================================================
   HTML ELEMENTS
========================================================= */

const reportSession =
    document.getElementById(
        "reportSession"
    );


const reportTerm =
    document.getElementById(
        "reportTerm"
    );


const reportClass =
    document.getElementById(
        "reportClass"
    );


const reportStudent =
    document.getElementById(
        "reportStudent"
    );


const generateReportBtn =
    document.getElementById(
        "generateReportBtn"
    );


const reportCard =
    document.getElementById(
        "reportCard"
    );


const printReportBtn =
    document.getElementById(
        "printReportBtn"
    );


const saveReportBtn =
    document.getElementById(
        "saveReportCardBtn"
    );


/* =========================================================
   UTILITY
========================================================= */

function cleanValue(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }

    return String(value)
        .trim();

}


/* =========================================================
   NORMALIZE TEXT
========================================================= */

function normalizeText(value) {

    return cleanValue(value)
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

}


/* =========================================================
   SAFE NUMBER
========================================================= */

function numberValue(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return 0;

    }


    const number =
        Number(value);


    return Number.isFinite(number)
        ? number
        : 0;

}


/* =========================================================
   GET FIRST AVAILABLE FIELD
========================================================= */

function getFirstValue(
    object,
    fields
) {

    if (!object)
        return "";


    for (
        const field of fields
    ) {

        if (
            object[field] !== undefined &&
            object[field] !== null &&
            object[field] !== ""
        ) {

            return object[field];

        }

    }


    return "";

}


/* =========================================================
   GET STUDENT NAME
========================================================= */

function getStudentName(
    student
) {

    if (!student)
        return "";


    const fullName =
        getFirstValue(
            student,
            [
                "studentName",
                "fullName",
                "name"
            ]
        );


    if (fullName) {

        return cleanValue(
            fullName
        );

    }


    return (

        `${student.firstName || ""} ` +

        `${student.middleName || ""} ` +

        `${student.lastName || ""}`

    )
        .replace(/\s+/g, " ")
        .trim();

}


/* =========================================================
   GET RESULT STUDENT ID
========================================================= */

function getResultStudentId(
    result
) {

    return cleanValue(
        getFirstValue(
            result,
            [
                "studentId",
                "studentID",
                "student_id",
                "studentDocId",
                "studentFirestoreId"
            ]
        )
    );

}


/* =========================================================
   GET RESULT CLASS
========================================================= */

function getResultClass(
    result
) {

    return cleanValue(
        getFirstValue(
            result,
            [
                "className",
                "studentClass",
                "class",
                "classNameValue"
            ]
        )
    );

}


/* =========================================================
   GET RESULT SESSION
========================================================= */

function getResultSession(
    result
) {

    return cleanValue(
        getFirstValue(
            result,
            [
                "session",
                "academicSession",
                "schoolSession",
                "academic_year"
            ]
        )
    );

}


/* =========================================================
   GET RESULT TERM
========================================================= */

function getResultTerm(
    result
) {

    return cleanValue(
        getFirstValue(
            result,
            [
                "term",
                "schoolTerm",
                "academicTerm"
            ]
        )
    );

}


/* =========================================================
   GET RESULT SUBJECT
========================================================= */

function getResultSubject(
    result
) {

    return cleanValue(
        getFirstValue(
            result,
            [
                "subjectName",
                "subject",
                "subjectTitle",
                "title"
            ]
        )
    );

}


/* =========================================================
   GET SCORE VALUE
========================================================= */

function getResultValue(
    result,
    possibleFields
) {

    for (
        const field of possibleFields
    ) {

        if (
            result[field] !== undefined &&
            result[field] !== null &&
            result[field] !== ""
        ) {

            return numberValue(
                result[field]
            );

        }

    }


    return 0;

}


/* =========================================================
   CLASS WORK 1
========================================================= */

function getClassWork1(
    result
) {

    return getResultValue(
        result,
        [
            "classWork1",
            "classwork1",
            "classWork_1",
            "cw1",
            "cw01",
            "class_work_1"
        ]
    );

}


/* =========================================================
   CLASS WORK 2
========================================================= */

function getClassWork2(
    result
) {

    return getResultValue(
        result,
        [
            "classWork2",
            "classwork2",
            "classWork_2",
            "cw2",
            "cw02",
            "class_work_2"
        ]
    );

}


/* =========================================================
   ASSIGNMENT 1
========================================================= */

function getAssignment1(
    result
) {

    return getResultValue(
        result,
        [
            "assignment1",
            "assignment_1",
            "ass1",
            "assignment01",
            "assignmentOne"
        ]
    );

}


/* =========================================================
   ASSIGNMENT 2
========================================================= */

function getAssignment2(
    result
) {

    return getResultValue(
        result,
        [
            "assignment2",
            "assignment_2",
            "ass2",
            "assignment02",
            "assignmentTwo"
        ]
    );

}


/* =========================================================
   CA 1
========================================================= */

function getCA1(
    result
) {

    return getResultValue(
        result,
        [
            "ca1",
            "CA1",
            "ca01",
            "continuousAssessment1",
            "continuousAssessment01"
        ]
    );

}


/* =========================================================
   CA 2
========================================================= */

function getCA2(
    result
) {

    return getResultValue(
        result,
        [
            "ca2",
            "CA2",
            "ca02",
            "continuousAssessment2",
            "continuousAssessment02"
        ]
    );

}


/* =========================================================
   EXAM
========================================================= */

function getExam(
    result
) {

    return getResultValue(
        result,
        [
            "exam",
            "examScore",
            "examMark",
            "examination"
        ]
    );

}


/* =========================================================
   CALCULATE TOTAL
========================================================= */

function calculateResultTotal(
    result
) {

    return (

        getClassWork1(result) +

        getClassWork2(result) +

        getAssignment1(result) +

        getAssignment2(result) +

        getCA1(result) +

        getCA2(result) +

        getExam(result)

    );

}


/* =========================================================
   GET TOTAL
========================================================= */

function getTotal(
    result
) {

    if (
        result.total !== undefined &&
        result.total !== null &&
        result.total !== ""
    ) {

        return numberValue(
            result.total
        );

    }


    return calculateResultTotal(
        result
    );

}


/* =========================================================
   CALCULATE GRADE
========================================================= */

function calculateGrade(
    score
) {

    score =
        numberValue(score);


    if (score >= 70)
        return "A";


    if (score >= 60)
        return "B";


    if (score >= 50)
        return "C";


    if (score >= 45)
        return "D";


    if (score >= 40)
        return "E";


    return "F";

}


/* =========================================================
   CALCULATE REMARK
========================================================= */

function calculateRemark(
    score
) {

    score =
        numberValue(score);


    if (score >= 70)
        return "Excellent";


    if (score >= 60)
        return "Very Good";


    if (score >= 50)
        return "Good";


    if (score >= 45)
        return "Fair";


    if (score >= 40)
        return "Pass";


    return "Fail";

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeReportHTML(
    value
) {

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
   LOAD CLASSES FROM FIRESTORE
========================================================= */

async function loadReportClassesFromFirestore() {

    try {

        const snapshot =
            await withTimeout(getDocs(
                collection(
                    db,
                    CLASSES_COLLECTION
                )
            ));


        reportClasses =
            snapshot.docs.map(
                classDocument => ({

                    id:
                        classDocument.id,

                    ...classDocument.data()

                })
            );


        return reportClasses;

    }

    catch (error) {

        console.error(
            "Error loading classes:",
            error
        );


        throw error;

    }

}


/* =========================================================
   LOAD ALL STUDENTS FROM FIRESTORE
========================================================= */

async function loadReportStudentsFromFirestore() {

    try {

        const snapshot =
            await withTimeout(getDocs(
                collection(
                    db,
                    STUDENTS_COLLECTION
                )
            ));


        reportStudents =
            snapshot.docs.map(
                studentDocument => ({

                    id:
                        studentDocument.id,

                    ...studentDocument.data()

                })
            );


        return reportStudents;

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
   LOAD SUBJECTS FROM FIRESTORE
========================================================= */

async function loadReportSubjectsFromFirestore() {

    try {

        const snapshot =
            await withTimeout(getDocs(
                collection(
                    db,
                    SUBJECTS_COLLECTION
                )
            ));


        reportSubjects =
            snapshot.docs.map(
                subjectDocument => ({

                    id:
                        subjectDocument.id,

                    ...subjectDocument.data()

                })
            );


        return reportSubjects;

    }

    catch (error) {

        console.error(
            "Error loading subjects:",
            error
        );


        throw error;

    }

}


/* =========================================================
   GET CLASS NAME
========================================================= */

function getClassName(
    classData
) {

    return cleanValue(
        getFirstValue(
            classData,
            [
                "name",
                "className",
                "title"
            ]
        )
    );

}


/* =========================================================
   LOAD CLASSES INTO DROPDOWN
========================================================= */

async function loadReportClasses() {

    if (!reportClass)
        return;


    reportClass.innerHTML = `

        <option value="">
            Loading classes...
        </option>

    `;


    try {

        await loadReportClassesFromFirestore();


        reportClass.innerHTML = `

            <option value="">
                Select Class
            </option>

        `;


        const classNames =
            new Set();


        reportClasses

            .slice()

            .sort(
                (a, b) =>
                    getClassName(a)
                        .localeCompare(
                            getClassName(b)
                        )
            )

            .forEach(
                classData => {

                    const className =
                        getClassName(
                            classData
                        );


                    if (!className)
                        return;


                    if (
                        classNames.has(
                            normalizeText(
                                className
                            )
                        )
                    ) {

                        return;

                    }


                    /*
                       Ignore inactive classes if
                       a status field exists.
                    */

                    if (
                        classData.status &&
                        normalizeText(
                            classData.status
                        ) !== "active"
                    ) {

                        return;

                    }


                    classNames.add(
                        normalizeText(
                            className
                        )
                    );


                    const option =
                        document.createElement(
                            "option"
                        );


                    /*
                       IMPORTANT:
                       We use the class NAME because
                       the results.js saves className
                       as the selected class name.
                    */

                    option.value =
                        className;


                    option.textContent =
                        className;


                    reportClass.appendChild(
                        option
                    );

                }
            );

    }

    catch (error) {

        console.error(
            "Unable to load classes:",
            error
        );


        reportClass.innerHTML = `

            <option value="">
                Unable to load classes
            </option>

        `;


        alert(
            "Unable to load classes from Firebase.\n\n" +
            (error.message || "")
        );

    }

}


/* =========================================================
   GET STUDENT CLASS
========================================================= */

function getStudentClass(
    student
) {

    return cleanValue(
        getFirstValue(
            student,
            [
                "studentClass",
                "className",
                "class",
                "class_name"
            ]
        )
    );

}


/* =========================================================
   LOAD STUDENTS FOR CLASS
========================================================= */

async function loadReportStudents() {

    if (!reportStudent)
        return;


    const selectedClass =
        cleanValue(
            reportClass?.value
        );


    reportStudent.innerHTML = `

        <option value="">
            Loading students...
        </option>

    `;


    if (!selectedClass) {

        reportStudent.innerHTML = `

            <option value="">
                Select Student
            </option>

        `;

        reportStudents = [];

        return;

    }


    try {

        /*
           Load ALL students instead of using a strict
           Firestore "where" query.

           This allows the system to work whether the
           student's class is stored as:

           studentClass
           className
           class
        */

        await loadReportStudentsFromFirestore();


        const selectedClassNormalized =
            normalizeText(
                selectedClass
            );


        const classStudents =
            reportStudents.filter(
                student => {

                    return (
                        normalizeText(
                            getStudentClass(
                                student
                            )
                        ) ===
                        selectedClassNormalized
                    );

                }
            );


        classStudents.sort(
            (a, b) =>
                getStudentName(a)
                    .localeCompare(
                        getStudentName(b)
                    )
        );


        reportStudent.innerHTML = `

            <option value="">
                Select Student
            </option>

        `;


        classStudents.forEach(
            student => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    student.id;


                option.textContent =
                    getStudentName(
                        student
                    ) ||
                    "Unnamed Student";


                reportStudent.appendChild(
                    option
                );

            }
        );


        if (
            classStudents.length === 0
        ) {

            reportStudent.innerHTML = `

                <option value="">
                    No students in this class
                </option>

            `;

        }

    }

    catch (error) {

        console.error(
            "Error loading students:",
            error
        );


        reportStudent.innerHTML = `

            <option value="">
                Unable to load students
            </option>

        `;


        alert(
            "Unable to load students from Firebase.\n\n" +
            (error.message || "")
        );

    }

}


/* =========================================================
   CLASS CHANGE EVENT
========================================================= */

if (reportClass) {

    reportClass.addEventListener(
        "change",
        loadReportStudents
    );

}


/* =========================================================
   LOAD ALL RESULTS
========================================================= */

async function loadAllResultsFromFirestore() {

    try {

        const snapshot =
            await withTimeout(getDocs(
                collection(
                    db,
                    RESULTS_COLLECTION
                )
            ));


        return snapshot.docs.map(
            resultDocument => ({

                id:
                    resultDocument.id,

                ...resultDocument.data()

            })
        );

    }

    catch (error) {

        console.error(
            "Error loading all results:",
            error
        );


        throw error;

    }

}


/* =========================================================
   CHECK IF RESULT BELONGS TO STUDENT
========================================================= */

function resultBelongsToStudent(
    result,
    studentId,
    student
) {

    const resultStudentId =
        getResultStudentId(
            result
        );


    /*
       Primary and most reliable match:
       Firestore student ID.
    */

    if (
        resultStudentId &&
        resultStudentId ===
        studentId
    ) {

        return true;

    }


    /*
       Fallback:
       Compare student names if an old result
       doesn't have studentId.
    */

    const resultName =
        normalizeText(
            getFirstValue(
                result,
                [
                    "studentName",
                    "name"
                ]
            )
        );


    const studentName =
        normalizeText(
            getStudentName(
                student
            )
        );


    if (
        resultName &&
        studentName &&
        resultName ===
        studentName
    ) {

        return true;

    }


    return false;

}


/* =========================================================
   RESULT MATCHING
========================================================= */

function resultMatchesReport(
    result,
    studentId,
    student,
    className,
    session,
    term
) {

    if (
        !resultBelongsToStudent(
            result,
            studentId,
            student
        )
    ) {

        return false;

    }


    const resultSession =
        normalizeText(
            getResultSession(
                result
            )
        );


    const selectedSession =
        normalizeText(
            session
        );


    const resultTerm =
        normalizeText(
            getResultTerm(
                result
            )
        );


    const selectedTerm =
        normalizeText(
            term
        );


    const resultClass =
        normalizeText(
            getResultClass(
                result
            )
        );


    const selectedClass =
        normalizeText(
            className
        );


    /*
       SESSION

       Accept:
       session
       academicSession
       schoolSession
    */

    if (
        resultSession &&
        selectedSession &&
        resultSession !==
        selectedSession
    ) {

        return false;

    }


    /*
       TERM
    */

    if (
        resultTerm &&
        selectedTerm &&
        resultTerm !==
        selectedTerm
    ) {

        return false;

    }


    /*
       CLASS

       If the result contains a class,
       make sure it matches.

       If an old result doesn't contain
       a class field, don't reject it.
    */

    if (
        resultClass &&
        selectedClass &&
        resultClass !==
        selectedClass
    ) {

        return false;

    }


    return true;

}


/* =========================================================
   LOAD STUDENT RESULTS
========================================================= */

async function loadStudentResultsFromFirestore(
    studentId,
    student,
    className,
    session,
    term
) {

    try {

        /*
           IMPORTANT FIX:

           We no longer query Firestore using:

           where("studentId", ...)
           where("session", ...)
           where("term", ...)

           because old/new result documents may
           use different field names.

           Instead, we load results and match them
           safely in JavaScript.
        */

        const allResults =
            await loadAllResultsFromFirestore();


        const matchingResults =
            allResults.filter(
                result =>

                    resultMatchesReport(

                        result,

                        studentId,

                        student,

                        className,

                        session,

                        term

                    )
            );


        /*
           Sort subjects alphabetically.
        */

        matchingResults.sort(
            (a, b) => {

                const subjectA =
                    normalizeText(
                        getResultSubject(a)
                    );


                const subjectB =
                    normalizeText(
                        getResultSubject(b)
                    );


                return subjectA.localeCompare(
                    subjectB
                );

            }
        );


        return matchingResults;

    }

    catch (error) {

        console.error(
            "Error loading student results:",
            error
        );


        throw error;

    }

}


/* =========================================================
   LOAD ATTENDANCE
========================================================= */

async function loadAttendanceFromFirestore(
    studentId,
    student,
    className,
    session,
    term
) {

    try {

        const snapshot =
            await withTimeout(getDocs(
                collection(
                    db,
                    ATTENDANCE_COLLECTION
                )
            ));


        const allAttendance =
            snapshot.docs.map(
                attendanceDocument => ({

                    id:
                        attendanceDocument.id,

                    ...attendanceDocument.data()

                })
            );


        const matching =
            allAttendance.filter(
                record => {

                    const attendanceStudentId =
                        cleanValue(
                            getFirstValue(
                                record,
                                [
                                    "studentId",
                                    "studentID",
                                    "student_id"
                                ]
                            )
                        );


                    const attendanceClass =
                        normalizeText(
                            getFirstValue(
                                record,
                                [
                                    "className",
                                    "studentClass",
                                    "class"
                                ]
                            )
                        );


                    const attendanceSession =
                        normalizeText(
                            getFirstValue(
                                record,
                                [
                                    "session",
                                    "academicSession"
                                ]
                            )
                        );


                    const attendanceTerm =
                        normalizeText(
                            getFirstValue(
                                record,
                                [
                                    "term",
                                    "schoolTerm",
                                    "academicTerm"
                                ]
                            )
                        );


                    let studentMatch =
                        false;


                    if (
                        attendanceStudentId &&
                        attendanceStudentId ===
                        studentId
                    ) {

                        studentMatch =
                            true;

                    }


                    /*
                       Fallback to student name.
                    */

                    if (
                        !studentMatch
                    ) {

                        const attendanceName =
                            normalizeText(
                                getFirstValue(
                                    record,
                                    [
                                        "studentName",
                                        "name"
                                    ]
                                )
                            );


                        const currentName =
                            normalizeText(
                                getStudentName(
                                    student
                                )
                            );


                        if (
                            attendanceName &&
                            currentName &&
                            attendanceName ===
                            currentName
                        ) {

                            studentMatch =
                                true;

                        }

                    }


                    if (
                        !studentMatch
                    ) {

                        return false;

                    }


                    /*
                       Class
                    */

                    if (
                        attendanceClass &&
                        normalizeText(
                            className
                        ) &&
                        attendanceClass !==
                        normalizeText(
                            className
                        )
                    ) {

                        return false;

                    }


                    /*
                       Session
                    */

                    if (
                        attendanceSession &&
                        attendanceSession !==
                        normalizeText(
                            session
                        )
                    ) {

                        return false;

                    }


                    /*
                       Term
                    */

                    if (
                        attendanceTerm &&
                        attendanceTerm !==
                        normalizeText(
                            term
                        )
                    ) {

                        return false;

                    }


                    return true;

                }
            );


        return matching;

    }

    catch (error) {

        console.error(
            "Error loading attendance:",
            error
        );


        /*
           Attendance should not stop the report
           from generating.
        */

        return [];

    }

}


/* =========================================================
   DISPLAY ATTENDANCE
========================================================= */

async function loadAttendance(
    studentId,
    student,
    className,
    session,
    term
) {

    const records =
        await loadAttendanceFromFirestore(

            studentId,

            student,

            className,

            session,

            term

        );


    let schoolDays = 0;

    let daysPresent = 0;

    let daysAbsent = 0;


    /*
       Different attendance systems may save
       one record per day OR summary fields.

       First try summary records.
    */

    records.forEach(
        record => {

            const status =
                normalizeText(
                    record.status
                );


            if (
                status ===
                "present"
            ) {

                daysPresent++;

            }


            if (
                status ===
                "absent"
            ) {

                daysAbsent++;

            }

        }
    );


    schoolDays =
        daysPresent +
        daysAbsent;


    /*
       If records contain explicit schoolDays,
       use the highest/available value.
    */

    records.forEach(
        record => {

            const possibleSchoolDays =
                numberValue(
                    getFirstValue(
                        record,
                        [
                            "schoolDays",
                            "totalSchoolDays",
                            "totalDays"
                        ]
                    )
                );


            if (
                possibleSchoolDays >
                schoolDays
            ) {

                schoolDays =
                    possibleSchoolDays;

            }

        }
    );


    const schoolDaysElement =
        document.getElementById(
            "schoolDays"
        );


    const daysPresentElement =
        document.getElementById(
            "daysPresent"
        );


    const daysAbsentElement =
        document.getElementById(
            "daysAbsent"
        );


    if (schoolDaysElement) {

        schoolDaysElement.textContent =
            schoolDays;

    }


    if (daysPresentElement) {

        daysPresentElement.textContent =
            daysPresent;

    }


    if (daysAbsentElement) {

        daysAbsentElement.textContent =
            daysAbsent;

    }


    return {

        schoolDays,

        daysPresent,

        daysAbsent

    };

}


/* =========================================================
   REPORT ID
========================================================= */

function getReportId(
    studentId,
    session,
    term
) {

    const cleanStudent =
        cleanValue(
            studentId
        )
        .replace(
            /[\/\\?#%]/g,
            "-"
        );


    const cleanSession =
        cleanValue(
            session
        )
        .replace(
            /[\/\\?#%]/g,
            "-"
        )
        .replace(
            /\s+/g,
            "-"
        );


    const cleanTerm =
        cleanValue(
            term
        )
        .replace(
            /[\/\\?#%]/g,
            "-"
        )
        .replace(
            /\s+/g,
            "-"
        );


    return (

        `${cleanStudent}_` +

        `${cleanSession}_` +

        `${cleanTerm}`

    );

}


/* =========================================================
   LOAD EXISTING REPORT
========================================================= */

async function loadExistingReport(
    studentId,
    session,
    term
) {

    try {

        const reportId =
            getReportId(
                studentId,
                session,
                term
            );


        const reportRef =
            doc(
                db,
                REPORTS_COLLECTION,
                reportId
            );


        const snapshot =
            await withTimeout(getDoc(
                reportRef
            ));


        if (
            !snapshot.exists()
        ) {

            return null;

        }


        return {

            id:
                snapshot.id,

            ...snapshot.data()

        };

    }

    catch (error) {

        console.error(
            "Error loading existing report:",
            error
        );


        return null;

    }

}


/* =========================================================
   GET SUBJECT NAME FROM RESULT
========================================================= */

function getSubjectNameFromResult(
    result
) {

    /*
       First check subjectName / subject.
    */

    const directSubject =
        getResultSubject(
            result
        );


    if (directSubject) {

        return directSubject;

    }


    /*
       Then check subjectId against
       the subjects collection.
    */

    const subjectId =
        cleanValue(
            getFirstValue(
                result,
                [
                    "subjectId",
                    "subjectID"
                ]
            )
        );


    if (subjectId) {

        const subject =
            reportSubjects.find(
                item =>
                    item.id ===
                    subjectId
            );


        if (subject) {

            return getFirstValue(
                subject,
                [
                    "name",
                    "subjectName",
                    "title"
                ]
            );

        }

    }


    return "Unknown Subject";

}


/* =========================================================
   CREATE CONDUCT TABLE
========================================================= */

function createConductTable() {

    const conductBody =
        document.getElementById(
            "conductBody"
        );


    if (!conductBody)
        return;


    conductBody.innerHTML =
        "";


    conductTraits.forEach(
        trait => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeReportHTML(
                        trait
                    )}
                </td>

                <td>

                    <select
                        class="conduct-rating"
                    >

                                <option value="Nursery">Nursery</option>
        <option value="Primary 1">Primary 1</option>
        <option value="Primary 2">Primary 2</option>
        <option value="Primary 3">Primary 3</option>
        <option value="Primary 4">Primary 4</option>
        <option value="JSS 1">JSS 1</option>
        <option value="JSS 2">JSS 2</option>

                                <option value="Nursery">Nursery</option>
        <option value="Primary 1">Primary 1</option>
        <option value="Primary 2">Primary 2</option>
        <option value="Primary 3">Primary 3</option>
        <option value="Primary 4">Primary 4</option>
        <option value="JSS 1">JSS 1</option>
        <option value="JSS 2">JSS 2</option>

                                <option value="Nursery">Nursery</option>
        <option value="Primary 1">Primary 1</option>
        <option value="Primary 2">Primary 2</option>
        <option value="Primary 3">Primary 3</option>
        <option value="Primary 4">Primary 4</option>
        <option value="JSS 1">JSS 1</option>
        <option value="JSS 2">JSS 2</option>

                                <option value="Nursery">Nursery</option>
        <option value="Primary 1">Primary 1</option>
        <option value="Primary 2">Primary 2</option>
        <option value="Primary 3">Primary 3</option>
        <option value="Primary 4">Primary 4</option>
        <option value="JSS 1">JSS 1</option>
        <option value="JSS 2">JSS 2</option>

                                <option value="Nursery">Nursery</option>
        <option value="Primary 1">Primary 1</option>
        <option value="Primary 2">Primary 2</option>
        <option value="Primary 3">Primary 3</option>
        <option value="Primary 4">Primary 4</option>
        <option value="JSS 1">JSS 1</option>
        <option value="JSS 2">JSS 2</option>

                    </select>

                </td>

            `;


            conductBody.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   LOAD EXISTING REPORT DATA
========================================================= */

function loadExistingReportData(
    report
) {

    if (!report)
        return;


    /* =====================================================
       TEACHER COMMENT
    ===================================================== */

    const teacherComment =
        document.getElementById(
            "teacherComment"
        );


    if (teacherComment) {

        teacherComment.value =
            report.teacherComment ||
            "";

    }


    /* =====================================================
       PRINCIPAL COMMENT
    ===================================================== */

    const principalComment =
        document.getElementById(
            "principalComment"
        );


    if (principalComment) {

        principalComment.value =
            report.principalComment ||
            "";

    }


    /* =====================================================
       PROMOTION STATUS
    ===================================================== */

    const promotionStatus =
        document.getElementById(
            "promotionStatus"
        );


    if (
        promotionStatus &&
        report.promotionStatus
    ) {

        promotionStatus.value =
            report.promotionStatus;

    }


    /* =====================================================
       PSYCHOMOTOR
    ===================================================== */

    if (
        report.psychomotor
    ) {

        document
            .querySelectorAll(
                ".conduct-table tbody tr"
            )
            .forEach(
                row => {

                    const traitCell =
                        row.querySelector(
                            "td"
                        );


                    const select =
                        row.querySelector(
                            ".conduct-rating"
                        );


                    if (
                        !traitCell ||
                        !select
                    ) {

                        return;

                    }


                    const trait =
                        traitCell
                            .textContent
                            .trim();


                    const savedRating =
                        report
                            .psychomotor[
                                trait
                            ];


                    if (
                        savedRating
                    ) {

                        select.value =
                            savedRating;

                    }

                }
            );

    }


    /* =====================================================
       ATTENDANCE
    ===================================================== */

    if (
        report.attendance
    ) {

        const attendance =
            report.attendance;


        const schoolDays =
            document.getElementById(
                "schoolDays"
            );


        const daysPresent =
            document.getElementById(
                "daysPresent"
            );


        const daysAbsent =
            document.getElementById(
                "daysAbsent"
            );


        if (schoolDays) {

            schoolDays.textContent =
                attendance.schoolDays ??
                0;

        }


        if (daysPresent) {

            daysPresent.textContent =
                attendance.daysPresent ??
                0;

        }


        if (daysAbsent) {

            daysAbsent.textContent =
                attendance.daysAbsent ??
                0;

        }

    }

}


/* =========================================================
   CALCULATE POSITION
========================================================= */

async function calculatePosition(
    studentId,
    className,
    session,
    term
) {

    try {

        /*
           Load ALL results.

           We don't use a strict Firestore query because
           your result documents may contain:

           className / studentClass / class
           session / academicSession
           term
        */

        const allResults =
            await loadAllResultsFromFirestore();


        const relevantResults =
            allResults.filter(
                result => {

                    const resultClass =
                        normalizeText(
                            getResultClass(
                                result
                            )
                        );


                    const resultSession =
                        normalizeText(
                            getResultSession(
                                result
                            )
                        );


                    const resultTerm =
                        normalizeText(
                            getResultTerm(
                                result
                            )
                        );


                    /*
                       Class must match if present.
                    */

                    if (
                        resultClass &&
                        resultClass !==
                        normalizeText(
                            className
                        )
                    ) {

                        return false;

                    }


                    /*
                       Session must match if present.
                    */

                    if (
                        resultSession &&
                        resultSession !==
                        normalizeText(
                            session
                        )
                    ) {

                        return false;

                    }


                    /*
                       Term must match if present.
                    */

                    if (
                        resultTerm &&
                        resultTerm !==
                        normalizeText(
                            term
                        )
                    ) {

                        return false;

                    }


                    return true;

                }
            );


        const studentTotals =
            {};


        relevantResults.forEach(
            result => {

                const resultStudentId =
                    getResultStudentId(
                        result
                    );


                if (!resultStudentId)
                    return;


                if (
                    !studentTotals[
                        resultStudentId
                    ]
                ) {

                    studentTotals[
                        resultStudentId
                    ] = {

                        total: 0,

                        subjects: 0

                    };

                }


                studentTotals[
                    resultStudentId
                ].total +=
                    getTotal(
                        result
                    );


                studentTotals[
                    resultStudentId
                ].subjects++;

            }
        );


        const ranking =
            Object.entries(
                studentTotals
            )

            .map(
                ([id, data]) => ({

                    studentId:
                        id,

                    average:
                        data.subjects > 0

                            ?

                            data.total /
                            data.subjects

                            :

                            0

                })
            )

            .sort(
                (a, b) =>
                    b.average -
                    a.average
            );


        const studentIndex =
            ranking.findIndex(
                item =>
                    item.studentId ===
                    studentId
            );


        if (
            studentIndex === -1
        ) {

            return "-";

        }


        return ordinal(
            studentIndex + 1
        );

    }

    catch (error) {

        console.error(
            "Error calculating position:",
            error
        );


        return "-";

    }

}


/* =========================================================
   ORDINAL POSITION
========================================================= */

function ordinal(
    number
) {

    const mod100 =
        number % 100;


    if (
        mod100 >= 11 &&
        mod100 <= 13
    ) {

        return `${number}th`;

    }


    switch (
        number % 10
    ) {

        case 1:
            return `${number}st`;

        case 2:
            return `${number}nd`;

        case 3:
            return `${number}rd`;

        default:
            return `${number}th`;

    }

}


/* =========================================================
   GENERATE REPORT
========================================================= */

async function generateReport() {

    const session =
        cleanValue(
            reportSession?.value
        );


    const term =
        cleanValue(
            reportTerm?.value
        );


    const className =
        cleanValue(
            reportClass?.value
        );


    const studentId =
        cleanValue(
            reportStudent?.value
        );


    /* =====================================================
       VALIDATION
    ===================================================== */

    if (
        !session ||
        !term ||
        !className ||
        !studentId
    ) {

        alert(
            "Please select the session, term, class and student."
        );

        return;

    }


    /* =====================================================
       FIND STUDENT
    ===================================================== */

    let student =
        reportStudents.find(
            item =>
                item.id ===
                studentId
        );


    /*
       If student isn't already in memory,
       retrieve directly from Firestore.
    */

    if (!student) {

        try {

            const studentRef =
                doc(
                    db,
                    STUDENTS_COLLECTION,
                    studentId
                );


            const studentSnapshot =
                await withTimeout(getDoc(
                    studentRef
                ));


            if (
                studentSnapshot.exists()
            ) {

                student = {

                    id:
                        studentSnapshot.id,

                    ...studentSnapshot.data()

                };

            }

        }

        catch (error) {

            console.error(
                "Error retrieving student:",
                error
            );

        }

    }


    if (!student) {

        alert(
            "Student could not be found."
        );

        return;

    }


    /* =====================================================
       DISABLE BUTTON
    ===================================================== */

    if (generateReportBtn) {

        generateReportBtn.disabled =
            true;


        generateReportBtn.textContent =
            "Generating...";

    }


    try {

        /* =================================================
           LOAD SUBJECTS
        ================================================= */

        if (
            reportSubjects.length === 0
        ) {

            await loadReportSubjectsFromFirestore();

        }


        /* =================================================
           LOAD RESULTS
        ================================================= */

        const studentResults =
            await loadStudentResultsFromFirestore(

                studentId,

                student,

                className,

                session,

                term

            );


        /*
           IMPORTANT:

           This is the main fix for the error shown
           in your screenshot.
        */

        if (
            studentResults.length === 0
        ) {

            /*
               Debug information is shown in the console
               so you can see exactly what the report
               system was searching for.
            */

            console.log(
                "REPORT SEARCH INFORMATION",
                {

                    studentId,

                    studentName:
                        getStudentName(
                            student
                        ),

                    className,

                    session,

                    term

                }
            );


            alert(

                "No result was found for this student.\n\n" +

                "Please check that the result was entered for:\n" +

                `Student: ${getStudentName(student)}\n` +

                `Class: ${className}\n` +

                `Session: ${session}\n` +

                `Term: ${term}`

            );


            return;

        }


        /* =================================================
           STUDENT INFORMATION
        ================================================= */

        const studentName =
            getStudentName(
                student
            );


        const studentNameElement =
            document.getElementById(
                "reportStudentName"
            );


        if (studentNameElement) {

            studentNameElement.textContent =
                studentName;

        }


        const admissionElement =
            document.getElementById(
                "reportAdmissionNo"
            );


        if (admissionElement) {

            admissionElement.textContent =

                getFirstValue(
                    student,
                    [
                        "admissionNo",
                        "admissionNumber",
                        "registrationNo",
                        "regNo"
                    ]
                ) ||

                student.id;

        }


        const classElement =
            document.getElementById(
                "reportClassName"
            );


        if (classElement) {

            classElement.textContent =
                className;

        }


        const sessionElement =
            document.getElementById(
                "reportSessionName"
            );


        if (sessionElement) {

            sessionElement.textContent =
                session;

        }


        const termTitle =
            document.getElementById(
                "reportTermTitle"
            );


        if (termTitle) {

            termTitle.textContent =
                `${term} • ${session}`;

        }


        /* =================================================
           RESULTS TABLE
        ================================================= */

        const body =
            document.getElementById(
                "reportResultsBody"
            );


        if (!body) {

            throw new Error(
                "reportResultsBody was not found in report-card HTML."
            );

        }


        body.innerHTML =
            "";


        let totalScore = 0;


        studentResults.forEach(
            (result, index) => {

                /* -----------------------------------------
                   SUBJECT
                ----------------------------------------- */

                const subjectName =
                    getSubjectNameFromResult(
                        result
                    );


                /* -----------------------------------------
                   SCORES
                ----------------------------------------- */

                const classWork1 =
                    getClassWork1(
                        result
                    );


                const classWork2 =
                    getClassWork2(
                        result
                    );


                const assignment1 =
                    getAssignment1(
                        result
                    );


                const assignment2 =
                    getAssignment2(
                        result
                    );


                const ca1 =
                    getCA1(
                        result
                    );


                const ca2 =
                    getCA2(
                        result
                    );


                const exam =
                    getExam(
                        result
                    );


                /* -----------------------------------------
                   TOTAL
                ----------------------------------------- */

                const total =
                    getTotal(
                        result
                    );


                /* -----------------------------------------
                   GRADE
                ----------------------------------------- */

                const grade =
                    result.grade ||
                    calculateGrade(
                        total
                    );


                /* -----------------------------------------
                   REMARK
                ----------------------------------------- */

                const remark =
                    result.remark ||
                    calculateRemark(
                        total
                    );


                /* -----------------------------------------
                   CREATE ROW
                ----------------------------------------- */

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${escapeReportHTML(
                            subjectName
                        )}
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

                    <td>
                        <strong>
                            ${total}
                        </strong>
                    </td>

                    <td>
                        <strong>
                            ${escapeReportHTML(
                                grade
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeReportHTML(
                            remark
                        )}
                    </td>

                `;


                body.appendChild(
                    row
                );


                totalScore +=
                    total;

            }
        );


        /* =================================================
           SUMMARY
        ================================================= */

        const subjectCount =
            studentResults.length;


        const average =
            subjectCount > 0

                ?

                (
                    totalScore /
                    subjectCount
                ).toFixed(2)

                :

                "0.00";


        const subjectsElement =
            document.getElementById(
                "subjectsOffered"
            );


        if (subjectsElement) {

            subjectsElement.textContent =
                subjectCount;

        }


        const totalElement =
            document.getElementById(
                "totalScore"
            );


        if (totalElement) {

            totalElement.textContent =
                totalScore;

        }


        const averageElement =
            document.getElementById(
                "averageScore"
            );


        if (averageElement) {

            averageElement.textContent =
                `${average}%`;

        }


        /* =================================================
           POSITION
        ================================================= */

        const position =
            await calculatePosition(

                studentId,

                className,

                session,

                term

            );


        const positionElement =
            document.getElementById(
                "studentPosition"
            );


        if (positionElement) {

            positionElement.textContent =
                position;

        }


        /* =================================================
           CONDUCT TABLE
        ================================================= */

        createConductTable();


        /* =================================================
           ATTENDANCE
        ================================================= */

        const attendance =
            await loadAttendance(

                studentId,

                student,

                className,

                session,

                term

            );


        console.log(
            "Report attendance:",
            attendance
        );


        /* =================================================
           EXISTING REPORT
        ================================================= */

        const existingReport =
            await loadExistingReport(

                studentId,

                session,

                term

            );


        if (existingReport) {

            loadExistingReportData(
                existingReport
            );

        }


        /* =================================================
           SHOW REPORT CARD
        ================================================= */

        if (reportCard) {

            reportCard.style.display =
                "block";


            reportCard.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "start"

            });

        }

    }

    catch (error) {

        console.error(
            "ERROR GENERATING REPORT:",
            error
        );


        alert(

            "Unable to generate report card.\n\n" +

            (
                error.message ||
                "An unexpected error occurred."
            )

        );

    }

    finally {

        if (generateReportBtn) {

            generateReportBtn.disabled =
                false;


            generateReportBtn.textContent =
                "Generate Report Card";

        }

    }

}


/* =========================================================
   GENERATE BUTTON EVENT
========================================================= */

if (generateReportBtn) {

    generateReportBtn.addEventListener(
        "click",
        generateReport
    );

}


/* =========================================================
   SAVE REPORT CARD
========================================================= */

async function saveReportCard() {

    const studentId =
        cleanValue(
            reportStudent?.value
        );


    const session =
        cleanValue(
            reportSession?.value
        );


    const term =
        cleanValue(
            reportTerm?.value
        );


    const className =
        cleanValue(
            reportClass?.value
        );


    /* =====================================================
       VALIDATION
    ===================================================== */

    if (
        !studentId ||
        !session ||
        !term ||
        !className
    ) {

        alert(
            "Please select the student, class, session and term."
        );

        return;

    }


    /* =====================================================
       FIND STUDENT
    ===================================================== */

    let student =
        reportStudents.find(
            item =>
                item.id ===
                studentId
        );


    if (!student) {

        try {

            const studentRef =
                doc(
                    db,
                    STUDENTS_COLLECTION,
                    studentId
                );


            const snapshot =
                await withTimeout(getDoc(
                    studentRef
                ));


            if (
                snapshot.exists()
            ) {

                student = {

                    id:
                        snapshot.id,

                    ...snapshot.data()

                };

            }

        }

        catch (error) {

            console.error(
                "Error loading student:",
                error
            );

        }

    }


    if (!student) {

        alert(
            "Student not found."
        );

        return;

    }


    /* =====================================================
       PSYCHOMOTOR
    ===================================================== */

    const psychomotor =
        {};


    document
        .querySelectorAll(
            ".conduct-table tbody tr"
        )
        .forEach(
            row => {

                const traitCell =
                    row.querySelector(
                        "td"
                    );


                const select =
                    row.querySelector(
                        ".conduct-rating"
                    );


                if (
                    !traitCell ||
                    !select
                ) {

                    return;

                }


                const trait =
                    traitCell
                        .textContent
                        .trim();


                psychomotor[
                    trait
                ] =
                    select.value;

            }
        );


    /* =====================================================
       ATTENDANCE
    ===================================================== */

    const schoolDays =
        numberValue(
            document.getElementById(
                "schoolDays"
            )?.textContent
        );


    const daysPresent =
        numberValue(
            document.getElementById(
                "daysPresent"
            )?.textContent
        );


    const daysAbsent =
        numberValue(
            document.getElementById(
                "daysAbsent"
            )?.textContent
        );


    /* =====================================================
       COMMENTS
    ===================================================== */

    const teacherComment =
        document.getElementById(
            "teacherComment"
        )?.value.trim() ||
        "";


    const principalComment =
        document.getElementById(
            "principalComment"
        )?.value.trim() ||
        "";


    /* =====================================================
       PROMOTION
    ===================================================== */

    const promotionStatus =
        document.getElementById(
            "promotionStatus"
        )?.value ||
        "Promoted";


    /* =====================================================
       REPORT ID
    ===================================================== */

    const reportId =
        getReportId(

            studentId,

            session,

            term

        );


    try {

        if (saveReportBtn) {

            saveReportBtn.disabled =
                true;


            saveReportBtn.textContent =
                "Saving...";

        }


        /* =================================================
           SAVE REPORT
        ================================================= */

        const reportData = {

            studentId:

                studentId,


            studentName:

                getStudentName(
                    student
                ),


            admissionNo:

                getFirstValue(
                    student,
                    [
                        "admissionNo",
                        "admissionNumber",
                        "registrationNo",
                        "regNo"
                    ]
                ) ||

                student.id,


            className:

                className,


            session:

                session,


            term:

                term,


            attendance: {

                schoolDays:

                    schoolDays,

                daysPresent:

                    daysPresent,

                daysAbsent:

                    daysAbsent

            },


            psychomotor:

                psychomotor,


            teacherComment:

                teacherComment,


            principalComment:

                principalComment,


            promotionStatus:

                promotionStatus,


            updatedAt:

                new Date()
                    .toISOString()

        };


        await withTimeout(setDoc(

            doc(
                db,
                REPORTS_COLLECTION,
                reportId
            ),

            reportData,

            {
                merge: true
            }

        ));


        alert(
            "Report card saved successfully."
        );

    }

    catch (error) {

        console.error(
            "Error saving report card:",
            error
        );


        alert(

            "Unable to save report card.\n\n" +

            (
                error.message ||
                ""
            )

        );

    }

    finally {

        if (saveReportBtn) {

            saveReportBtn.disabled =
                false;


            saveReportBtn.textContent =
                "💾 Save Report Card";

        }

    }

}


/* =========================================================
   SAVE BUTTON EVENT
========================================================= */

if (saveReportBtn) {

    saveReportBtn.addEventListener(
        "click",
        saveReportCard
    );

}


/* =========================================================
   PRINT REPORT
========================================================= */

if (printReportBtn) {

    printReportBtn.addEventListener(
        "click",
        function() {

            window.print();

        }
    );

}


/* =========================================================
   INITIALIZE REPORT CARD
========================================================= */

async function initializeReportCard() {

    try {

        /*
           Load everything from Firestore.
        */

        await Promise.all([

            loadReportClassesFromFirestore(),

            loadReportStudentsFromFirestore(),

            loadReportSubjectsFromFirestore()

        ]);


        /* =================================================
           POPULATE CLASS DROPDOWN
        ================================================= */

        if (reportClass) {

            reportClass.innerHTML = `

                <option value="">
                    Select Class
                </option>

            `;


            const classNames =
                new Set();


            reportClasses

                .slice()

                .sort(
                    (a, b) =>
                        getClassName(a)
                            .localeCompare(
                                getClassName(b)
                            )
                )

                .forEach(
                    classData => {

                        const className =
                            getClassName(
                                classData
                            );


                        if (!className)
                            return;


                        if (
                            classData.status &&
                            normalizeText(
                                classData.status
                            ) !== "active"
                        ) {

                            return;

                        }


                        const key =
                            normalizeText(
                                className
                            );


                        if (
                            classNames.has(
                                key
                            )
                        ) {

                            return;

                        }


                        classNames.add(
                            key
                        );


                        const option =
                            document.createElement(
                                "option"
                            );


                        option.value =
                            className;


                        option.textContent =
                            className;


                        reportClass.appendChild(
                            option
                        );

                    }
                );

        }


        /*
           Make sure student dropdown starts
           in the correct state.
        */

        if (reportStudent) {

            reportStudent.innerHTML = `

                <option value="">
                    Select Student
                </option>

            `;

        }


        console.log(
            "Report card system initialized.",
            {

                classes:
                    reportClasses.length,

                students:
                    reportStudents.length,

                subjects:
                    reportSubjects.length

            }
        );

    }

    catch (error) {

        console.error(
            "Error initializing report card:",
            error
        );


        if (reportClass) {

            reportClass.innerHTML = `

                <option value="">
                    Unable to load classes
                </option>

            `;

        }


        alert(

            "Unable to initialize the report card system.\n\n" +

            (
                error.message ||
                ""
            )

        );

    }

}


/* =========================================================
   START SYSTEM
========================================================= */

initializeReportCard();