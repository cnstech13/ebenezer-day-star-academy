import { adminReady, withTimeout } from "./admin-guard.js";
// ============================================================
// Ebenezer Day Star Academy
// RESULTS MANAGEMENT
// FIREBASE 12 MODULAR FIRESTORE
//
// SCORE STRUCTURE
//
// Class Work 1  = 5
// Class Work 2  = 5
// Assignment 1 = 5
// Assignment 2 = 5
// CA 1          = 10
// CA 2          = 10
// Examination   = 60
//
// TOTAL         = 100
// ============================================================

await adminReady;

import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import { db } from "./firebase-config.js";


// ============================================================
// FIRESTORE COLLECTIONS
// ============================================================

const resultsCollection =
    collection(db, "results");

const studentsCollection =
    collection(db, "students");

const classesCollection =
    collection(db, "classes");

const subjectsCollection =
    collection(db, "subjects");


// ============================================================
// DATA
// ============================================================

let results = [];
let students = [];
let classes = [];
let subjects = [];


// ============================================================
// ELEMENTS
// ============================================================

// ------------------------------------------------------------
// RESULT MODAL
// ------------------------------------------------------------

const resultModal =
    document.getElementById("resultModal");

const resultForm =
    document.getElementById("resultForm");

const resultModalTitle =
    document.getElementById("resultModalTitle");

const closeResultModal =
    document.getElementById("closeResultModal");

const cancelResultBtn =
    document.getElementById("cancelResultBtn");

const addResultBtn =
    document.getElementById("addResultBtn");

const editingResultId =
    document.getElementById("editingResultId");


// ------------------------------------------------------------
// RESULT INFORMATION
// ------------------------------------------------------------

const resultSession =
    document.getElementById("resultSession");

const resultTerm =
    document.getElementById("resultTerm");

const resultClass =
    document.getElementById("resultClass");

const resultStudent =
    document.getElementById("resultStudent");

const resultSubject =
    document.getElementById("resultSubject");


// ------------------------------------------------------------
// SCORE INPUTS
// ------------------------------------------------------------

const classWork1 =
    document.getElementById("classWork1");

const classWork2 =
    document.getElementById("classWork2");

const assignment1 =
    document.getElementById("assignment1");

const assignment2 =
    document.getElementById("assignment2");

const ca1 =
    document.getElementById("ca1");

const ca2 =
    document.getElementById("ca2");

const exam =
    document.getElementById("exam");


// ------------------------------------------------------------
// CALCULATED FIELDS
// ------------------------------------------------------------

const resultTotal =
    document.getElementById("resultTotal");

const resultGrade =
    document.getElementById("resultGrade");

const resultRemark =
    document.getElementById("resultRemark");


// ------------------------------------------------------------
// RESULT TABLE
// ------------------------------------------------------------

const resultsTableBody =
    document.getElementById("resultsTableBody");

const emptyResults =
    document.getElementById("emptyResults");


// ------------------------------------------------------------
// FILTERS
// ------------------------------------------------------------

const resultSessionFilter =
    document.getElementById(
        "resultSessionFilter"
    );

const resultTermFilter =
    document.getElementById(
        "resultTermFilter"
    );

const resultClassFilter =
    document.getElementById(
        "resultClassFilter"
    );

const resultSearch =
    document.getElementById(
        "resultSearch"
    );


// ============================================================
// BULK RESULT ELEMENTS
// ============================================================

const bulkResultBtn =
    document.getElementById(
        "bulkResultBtn"
    );

const bulkResultModal =
    document.getElementById(
        "bulkResultModal"
    );

const closeBulkResultModal =
    document.getElementById(
        "closeBulkResultModal"
    );

const cancelBulkResultBtn =
    document.getElementById(
        "cancelBulkResultBtn"
    );

const bulkSession =
    document.getElementById(
        "bulkSession"
    );

const bulkTerm =
    document.getElementById(
        "bulkTerm"
    );

const bulkClass =
    document.getElementById(
        "bulkClass"
    );

const bulkSubject =
    document.getElementById(
        "bulkSubject"
    );

const loadClassStudentsBtn =
    document.getElementById(
        "loadClassStudentsBtn"
    );

const bulkResultTableContainer =
    document.getElementById(
        "bulkResultTableContainer"
    );

const bulkResultTableBody =
    document.getElementById(
        "bulkResultTableBody"
    );

const saveBulkResultsBtn =
    document.getElementById(
        "saveBulkResultsBtn"
    );


// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function getValue(element) {

    if (!element) {
        return "";
    }

    return String(
        element.value ?? ""
    ).trim();

}


// ============================================================
// FIREBASE ERROR MESSAGE
// ============================================================

function getFirebaseErrorMessage(error) {

    if (!error) {
        return "Unknown error.";
    }

    if (error.code) {

        switch (error.code) {

            case "permission-denied":
                return "Firestore permission denied. Check your Firestore security rules.";

            case "not-found":
                return "The requested Firestore document was not found.";

            case "unavailable":
                return "Firebase is temporarily unavailable. Check your internet connection.";

            case "failed-precondition":
                return "Firebase could not complete the operation because a required condition was not met.";

            default:
                return error.message || error.code;

        }

    }

    return error.message ||
        "An unexpected error occurred.";

}


// ============================================================
// HTML ESCAPE
// ============================================================

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


// ============================================================
// ATTRIBUTE ESCAPE
// ============================================================

function escapeAttribute(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
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


// ============================================================
// NUMBER WITHIN RANGE
// ============================================================

function numberWithinRange(
    value,
    min,
    max
) {

    const number =
        Number(value);

    if (
        Number.isNaN(number)
    ) {

        return 0;

    }

    return Math.min(
        max,
        Math.max(
            min,
            number
        )
    );

}


// ============================================================
// CALCULATE TOTAL
// ============================================================

function calculateTotal(
    cw1,
    cw2,
    ass1,
    ass2,
    caOne,
    caTwo,
    examScore
) {

    return (

        numberWithinRange(
            cw1,
            0,
            5
        )

        +

        numberWithinRange(
            cw2,
            0,
            5
        )

        +

        numberWithinRange(
            ass1,
            0,
            5
        )

        +

        numberWithinRange(
            ass2,
            0,
            5
        )

        +

        numberWithinRange(
            caOne,
            0,
            10
        )

        +

        numberWithinRange(
            caTwo,
            0,
            10
        )

        +

        numberWithinRange(
            examScore,
            0,
            60
        )

    );

}


// ============================================================
// GRADE
// ============================================================

function getGrade(total) {

    const score =
        Number(total) || 0;

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


// ============================================================
// REMARK
// ============================================================

function getRemark(total) {

    const score =
        Number(total) || 0;

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


// ============================================================
// UPDATE SCORE PREVIEW
// ============================================================

function updateScorePreview() {

    const total =
        calculateTotal(

            getValue(classWork1),

            getValue(classWork2),

            getValue(assignment1),

            getValue(assignment2),

            getValue(ca1),

            getValue(ca2),

            getValue(exam)

        );


    if (resultTotal) {

        resultTotal.value =
            total;

    }


    if (resultGrade) {

        resultGrade.value =
            getGrade(total);

    }


    if (resultRemark) {

        resultRemark.value =
            getRemark(total);

    }

}


// ============================================================
// SCORE INPUT EVENTS
// ============================================================

[
    classWork1,
    classWork2,
    assignment1,
    assignment2,
    ca1,
    ca2,
    exam
]
.forEach(
    input => {

        if (!input) {
            return;
        }

        input.addEventListener(
            "input",
            updateScorePreview
        );

    }
);


// ============================================================
// LOAD ALL DATA
// ============================================================

async function loadAllData() {

    try {

        await Promise.all([

            loadStudents(),

            loadClasses(),

            loadSubjects(),

            loadResults()

        ]);


        populateClassFilters();

        populateIndividualClassDropdown();

        populateBulkClassDropdown();

        populateSubjectDropdown(
            resultSubject
        );

        populateSubjectDropdown(
            bulkSubject
        );

    }

    catch (error) {

        console.error(
            "Error loading result data:",
            error
        );

        alert(
            "Unable to load result data from Firestore.\n\n" +
            getFirebaseErrorMessage(error)
        );

    }

}


// ============================================================
// LOAD STUDENTS
// ============================================================

async function loadStudents() {

    const snapshot =
        await withTimeout(getDocs(
            studentsCollection
        ));


    students =
        snapshot.docs.map(
            studentDoc => ({

                firestoreId:
                    studentDoc.id,

                ...studentDoc.data()

            })
        );

}


// ============================================================
// LOAD CLASSES
// ============================================================

async function loadClasses() {

    const snapshot =
        await withTimeout(getDocs(
            classesCollection
        ));


    classes =
        snapshot.docs.map(
            classDoc => ({

                firestoreId:
                    classDoc.id,

                ...classDoc.data()

            })
        );

}


// ============================================================
// LOAD SUBJECTS
// ============================================================

async function loadSubjects() {

    const snapshot =
        await withTimeout(getDocs(
            subjectsCollection
        ));


    subjects =
        snapshot.docs.map(
            subjectDoc => ({

                firestoreId:
                    subjectDoc.id,

                ...subjectDoc.data()

            })
        );

}


// ============================================================
// LOAD RESULTS
// ============================================================

async function loadResults() {

    const snapshot =
        await withTimeout(getDocs(
            resultsCollection
        ));


    results =
        snapshot.docs.map(
            resultDoc => ({

                firestoreId:
                    resultDoc.id,

                ...resultDoc.data()

            })
        );


    renderResults();

}


// ============================================================
// POPULATE CLASS DROPDOWN
// ============================================================

function populateClassDropdown(
    selectElement,
    includeAllOption = false
) {

    if (!selectElement) {
        return;
    }


    const currentValue =
        selectElement.value;


    selectElement.innerHTML =
        "";


    const firstOption =
        document.createElement(
            "option"
        );


    firstOption.value =
        "";


    firstOption.textContent =
        includeAllOption
            ? "All Classes"
            : "Select Class";


    selectElement.appendChild(
        firstOption
    );


    classes
        .slice()
        .sort(
            (a, b) => {

                const nameA =
                    a.name ||
                    a.className ||
                    a.id ||
                    "";

                const nameB =
                    b.name ||
                    b.className ||
                    b.id ||
                    "";

                return String(
                    nameA
                ).localeCompare(
                    String(
                        nameB
                    )
                );

            }
        )
        .forEach(
            classData => {

                const className =
                    classData.name ||
                    classData.className ||
                    classData.id ||
                    classData.firestoreId;


                if (!className) {
                    return;
                }


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    className;


                option.textContent =
                    className;


                selectElement.appendChild(
                    option
                );

            }
        );


    if (
        [...selectElement.options]
            .some(
                option =>
                    option.value ===
                    currentValue
            )
    ) {

        selectElement.value =
            currentValue;

    }

}


// ============================================================
// CLASS DROPDOWNS
// ============================================================

function populateIndividualClassDropdown() {

    populateClassDropdown(
        resultClass,
        false
    );

}


function populateBulkClassDropdown() {

    populateClassDropdown(
        bulkClass,
        false
    );

}


function populateClassFilters() {

    populateClassDropdown(
        resultClassFilter,
        true
    );

}


// ============================================================
// POPULATE SUBJECT DROPDOWN
// ============================================================

function populateSubjectDropdown(
    selectElement
) {

    if (!selectElement) {
        return;
    }


    const currentValue =
        selectElement.value;


    selectElement.innerHTML = `

        <option value="">
            Select Subject
        </option>

    `;


    subjects
        .slice()
        .sort(
            (a, b) => {

                const nameA =
                    a.name ||
                    a.subjectName ||
                    a.title ||
                    "";

                const nameB =
                    b.name ||
                    b.subjectName ||
                    b.title ||
                    "";

                return String(
                    nameA
                ).localeCompare(
                    String(
                        nameB
                    )
                );

            }
        )
        .forEach(
            subject => {

                const subjectName =
                    subject.name ||
                    subject.subjectName ||
                    subject.title ||
                    "";


                if (!subjectName) {
                    return;
                }


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    subjectName;


                option.textContent =
                    subjectName;


                selectElement.appendChild(
                    option
                );

            }
        );


    if (
        [...selectElement.options]
            .some(
                option =>
                    option.value ===
                    currentValue
            )
    ) {

        selectElement.value =
            currentValue;

    }

}


// ============================================================
// GET STUDENT CLASS
// ============================================================

function getStudentClass(student) {

    return String(

        student.studentClass ||

        student.className ||

        student.class ||

        ""

    ).trim();

}


// ============================================================
// GET STUDENT NAME
// ============================================================

function getStudentName(student) {

    const fullName =
        `${student.firstName || ""} ${student.lastName || ""}`
            .trim();


    if (fullName) {
        return fullName;
    }


    return (

        student.name ||

        student.fullName ||

        student.studentName ||

        "Unnamed Student"

    );

}


// ============================================================
// POPULATE STUDENT DROPDOWN
// ============================================================

function populateStudentDropdown(
    classValue = "",
    selectedStudent = ""
) {

    if (!resultStudent) {
        return;
    }


    resultStudent.innerHTML = `

        <option value="">
            Select Student
        </option>

    `;


    let filteredStudents =
        students;


    if (classValue) {

        const wantedClass =
            String(
                classValue
            )
            .trim()
            .toLowerCase();


        filteredStudents =
            students.filter(
                student => {

                    const studentClass =
                        getStudentClass(
                            student
                        )
                        .toLowerCase();


                    return (
                        studentClass ===
                        wantedClass
                    );

                }
            );

    }


    filteredStudents
        .slice()
        .sort(
            (a, b) => {

                return getStudentName(a)
                    .localeCompare(
                        getStudentName(b)
                    );

            }
        )
        .forEach(
            student => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    student.firestoreId;


                option.textContent =
                    getStudentName(
                        student
                    );


                resultStudent.appendChild(
                    option
                );

            }
        );


    if (selectedStudent) {

        resultStudent.value =
            selectedStudent;

    }

}


// ============================================================
// RESULT CLASS CHANGE
// ============================================================

if (resultClass) {

    resultClass.addEventListener(
        "change",
        function() {

            populateStudentDropdown(
                this.value
            );

        }
    );

}


// ============================================================
// OPEN RESULT MODAL
// ============================================================

function openResultModal(
    resultData = null
) {

    if (!resultModal) {
        return;
    }


    // --------------------------------------------------------
    // Reset the form first
    // --------------------------------------------------------

    if (resultForm) {

        resultForm.reset();

    }


    // --------------------------------------------------------
    // Clear editing ID
    // --------------------------------------------------------

    if (editingResultId) {

        editingResultId.value =
            "";

    }


    // --------------------------------------------------------
    // Rebuild dropdowns
    // --------------------------------------------------------

    populateClassDropdown(
        resultClass,
        false
    );

    populateSubjectDropdown(
        resultSubject
    );


    // --------------------------------------------------------
    // EDIT MODE
    // --------------------------------------------------------

    if (resultData) {

        if (resultModalTitle) {

            resultModalTitle.textContent =
                "Edit Result";

        }


        if (editingResultId) {

            editingResultId.value =
                resultData.firestoreId || "";

        }


        if (resultSession) {

            resultSession.value =
                resultData.session ||
                resultData.academicSession ||
                "";

        }


        if (resultTerm) {

            resultTerm.value =
                resultData.term ||
                "";

        }


        if (resultClass) {

            resultClass.value =
                resultData.className ||
                resultData.studentClass ||
                resultData.class ||
                "";

        }


        populateStudentDropdown(
            getValue(resultClass),
            resultData.studentId ||
            ""
        );


        if (resultSubject) {

            resultSubject.value =
                resultData.subject ||
                "";

        }


        if (classWork1) {

            classWork1.value =
                resultData.classWork1 ??
                resultData.cw1 ??
                0;

        }


        if (classWork2) {

            classWork2.value =
                resultData.classWork2 ??
                resultData.cw2 ??
                0;

        }


        if (assignment1) {

            assignment1.value =
                resultData.assignment1 ??
                resultData.ass1 ??
                0;

        }


        if (assignment2) {

            assignment2.value =
                resultData.assignment2 ??
                resultData.ass2 ??
                0;

        }


        if (ca1) {

            ca1.value =
                resultData.ca1 ??
                0;

        }


        if (ca2) {

            ca2.value =
                resultData.ca2 ??
                0;

        }


        if (exam) {

            exam.value =
                resultData.exam ??
                resultData.examScore ??
                0;

        }


        updateScorePreview();

    }

    // --------------------------------------------------------
    // ADD MODE
    // --------------------------------------------------------

    else {

        if (resultModalTitle) {

            resultModalTitle.textContent =
                "Enter Result";

        }


        if (resultSession) {

            resultSession.value =
                "2026/2027";

        }


        if (resultTerm) {

            resultTerm.value =
                "";

        }


        if (resultClass) {

            resultClass.value =
                "";

        }


        if (resultStudent) {

            resultStudent.innerHTML = `

                <option value="">
                    Select Student
                </option>

            `;

        }


        if (resultSubject) {

            resultSubject.value =
                "";

        }


        if (classWork1)
            classWork1.value = 0;

        if (classWork2)
            classWork2.value = 0;

        if (assignment1)
            assignment1.value = 0;

        if (assignment2)
            assignment2.value = 0;

        if (ca1)
            ca1.value = 0;

        if (ca2)
            ca2.value = 0;

        if (exam)
            exam.value = 0;


        updateScorePreview();

    }


    // --------------------------------------------------------
    // SHOW MODAL
    //
    // IMPORTANT:
    // classList.add("show") is used every time.
    // This allows the Enter Result button to work repeatedly.
    // --------------------------------------------------------

    resultModal.classList.add(
        "show"
    );

}


// ============================================================
// ADD RESULT BUTTON
// ============================================================

if (addResultBtn) {

    addResultBtn.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            openResultModal();

        }
    );

}


// ============================================================
// CLOSE RESULT MODAL
// ============================================================

function closeResultModalFunction() {

    if (!resultModal) {
        return;
    }


    resultModal.classList.remove(
        "show"
    );


    if (resultForm) {

        resultForm.reset();

    }


    if (editingResultId) {

        editingResultId.value =
            "";

    }


    if (resultModalTitle) {

        resultModalTitle.textContent =
            "Enter Result";

    }


    // Reset score fields

    if (classWork1)
        classWork1.value = 0;

    if (classWork2)
        classWork2.value = 0;

    if (assignment1)
        assignment1.value = 0;

    if (assignment2)
        assignment2.value = 0;

    if (ca1)
        ca1.value = 0;

    if (ca2)
        ca2.value = 0;

    if (exam)
        exam.value = 0;


    updateScorePreview();

}


// ============================================================
// CLOSE BUTTON
// ============================================================

if (closeResultModal) {

    closeResultModal.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            closeResultModalFunction();

        }
    );

}


// ============================================================
// CANCEL BUTTON
// ============================================================

if (cancelResultBtn) {

    cancelResultBtn.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            closeResultModalFunction();

        }
    );

}


// ============================================================
// CLICK OUTSIDE MODAL
// ============================================================

if (resultModal) {

    resultModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                resultModal
            ) {

                closeResultModalFunction();

            }

        }
    );

}


// ============================================================
// SAVE INDIVIDUAL RESULT
// ============================================================

if (resultForm) {

    resultForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const editingId =
                getValue(
                    editingResultId
                );


            const session =
                getValue(
                    resultSession
                );


            const term =
                getValue(
                    resultTerm
                );


            const className =
                getValue(
                    resultClass
                );


            const studentId =
                getValue(
                    resultStudent
                );


            const subject =
                getValue(
                    resultSubject
                );


            // ------------------------------------------------
            // VALIDATION
            // ------------------------------------------------

            if (
                !session ||
                !term ||
                !className ||
                !studentId ||
                !subject
            ) {

                alert(
                    "Please complete the session, term, class, student and subject fields."
                );

                return;

            }


            const student =
                students.find(
                    item =>
                        item.firestoreId ===
                        studentId
                );


            if (!student) {

                alert(
                    "Student could not be found."
                );

                return;

            }


            // ------------------------------------------------
            // SCORES
            // ------------------------------------------------

            const cw1 =
                numberWithinRange(
                    getValue(classWork1),
                    0,
                    5
                );


            const cw2 =
                numberWithinRange(
                    getValue(classWork2),
                    0,
                    5
                );


            const ass1 =
                numberWithinRange(
                    getValue(assignment1),
                    0,
                    5
                );


            const ass2 =
                numberWithinRange(
                    getValue(assignment2),
                    0,
                    5
                );


            const caOne =
                numberWithinRange(
                    getValue(ca1),
                    0,
                    10
                );


            const caTwo =
                numberWithinRange(
                    getValue(ca2),
                    0,
                    10
                );


            const examScore =
                numberWithinRange(
                    getValue(exam),
                    0,
                    60
                );


            // ------------------------------------------------
            // TOTAL
            // ------------------------------------------------

            const total =
                calculateTotal(
                    cw1,
                    cw2,
                    ass1,
                    ass2,
                    caOne,
                    caTwo,
                    examScore
                );


            const grade =
                getGrade(total);


            const remark =
                getRemark(total);


            // ------------------------------------------------
            // DUPLICATE CHECK
            // ------------------------------------------------

            const duplicate =
                results.find(
                    item => {

                        const itemStudent =
                            item.studentId ||
                            "";

                        const itemClass =
                            item.className ||
                            item.studentClass ||
                            item.class ||
                            "";

                        const itemSession =
                            item.session ||
                            item.academicSession ||
                            "";

                        const itemTerm =
                            item.term ||
                            "";

                        const itemSubject =
                            item.subject ||
                            "";


                        return (

                            itemStudent ===
                            studentId

                            &&

                            String(
                                itemClass
                            )
                            .trim()
                            .toLowerCase() ===
                            String(
                                className
                            )
                            .trim()
                            .toLowerCase()

                            &&

                            String(
                                itemSession
                            ) ===
                            String(
                                session
                            )

                            &&

                            String(
                                itemTerm
                            ) ===
                            String(
                                term
                            )

                            &&

                            String(
                                itemSubject
                            )
                            .trim()
                            .toLowerCase() ===
                            String(
                                subject
                            )
                            .trim()
                            .toLowerCase()

                            &&

                            item.firestoreId !==
                            editingId

                        );

                    }
                );


            if (duplicate) {

                alert(
                    "A result already exists for this student, subject, term and session."
                );

                return;

            }


            // ------------------------------------------------
            // RESULT DATA
            // ------------------------------------------------

            const resultData = {

                studentId:
                    studentId,

                studentName:
                    getStudentName(
                        student
                    ),

                className:
                    className,

                subject:
                    subject,

                session:
                    session,

                academicSession:
                    session,

                term:
                    term,


                // Assessment

                classWork1:
                    cw1,

                classWork2:
                    cw2,

                assignment1:
                    ass1,

                assignment2:
                    ass2,

                ca1:
                    caOne,

                ca2:
                    caTwo,

                exam:
                    examScore,


                // Calculated

                total:
                    total,

                grade:
                    grade,

                remark:
                    remark,

                updatedAt:
                    serverTimestamp()

            };


            // ------------------------------------------------
            // SAVE
            // ------------------------------------------------

            try {

                if (editingId) {

                    await withTimeout(updateDoc(

                        doc(
                            db,
                            "results",
                            editingId
                        ),

                        resultData

                    ));


                    alert(
                        "Result updated successfully."
                    );

                }

                else {

                    await withTimeout(addDoc(

                        resultsCollection,

                        {

                            ...resultData,

                            createdAt:
                                serverTimestamp()

                        }

                    ));


                    alert(
                        "Result saved successfully."
                    );

                }


                await loadResults();

                closeResultModalFunction();

            }

            catch (error) {

                console.error(
                    "Error saving result:",
                    error
                );


                alert(
                    "Unable to save result.\n\n" +
                    getFirebaseErrorMessage(
                        error
                    )
                );

            }

        }
    );

}




// ============================================================
// RENDER RESULTS
// ============================================================

function renderResults() {

    if (!resultsTableBody) {
        return;
    }


    const search =
        getValue(
            resultSearch
        )
        .toLowerCase();


    const sessionFilter =
        getValue(
            resultSessionFilter
        );


    const termFilter =
        getValue(
            resultTermFilter
        );


    const classFilter =
        getValue(
            resultClassFilter
        );


    const filtered =
        results.filter(
            result => {

                const studentName =
                    String(
                        result.studentName ||
                        ""
                    )
                    .toLowerCase();


                const subject =
                    String(
                        result.subject ||
                        ""
                    )
                    .toLowerCase();


                const className =
                    String(
                        result.className ||
                        result.studentClass ||
                        result.class ||
                        ""
                    );


                const session =
                    result.session ||
                    result.academicSession ||
                    "";


                const term =
                    result.term ||
                    "";


                const matchesSearch =
                    !search ||

                    studentName.includes(
                        search
                    ) ||

                    subject.includes(
                        search
                    ) ||

                    className
                        .toLowerCase()
                        .includes(
                            search
                        );


                const matchesSession =
                    !sessionFilter ||

                    session ===
                    sessionFilter;


                const matchesTerm =
                    !termFilter ||

                    term ===
                    termFilter;


                const matchesClass =
                    !classFilter ||

                    className ===
                    classFilter;


                return (

                    matchesSearch &&

                    matchesSession &&

                    matchesTerm &&

                    matchesClass

                );

            }
        );


    resultsTableBody.innerHTML =
        "";


    if (
        filtered.length === 0
    ) {

        if (emptyResults) {

            emptyResults.style.display =
                "block";

        }

        return;

    }


    if (emptyResults) {

        emptyResults.style.display =
            "none";

    }


    filtered.forEach(
        result => {

            const row =
                document.createElement(
                    "tr"
                );


            // ------------------------------------------------
            // SCORE VALUES
            // ------------------------------------------------

            const cw1 =
                Number(
                    result.classWork1 ??
                    result.cw1 ??
                    0
                );


            const cw2 =
                Number(
                    result.classWork2 ??
                    result.cw2 ??
                    0
                );


            const ass1 =
                Number(
                    result.assignment1 ??
                    result.ass1 ??
                    0
                );


            const ass2 =
                Number(
                    result.assignment2 ??
                    result.ass2 ??
                    0
                );


            const caOne =
                Number(
                    result.ca1 ??
                    0
                );


            const caTwo =
                Number(
                    result.ca2 ??
                    0
                );


            const examScore =
                Number(
                    result.exam ??
                    result.examScore ??
                    0
                );


            const calculatedTotal =
                calculateTotal(
                    cw1,
                    cw2,
                    ass1,
                    ass2,
                    caOne,
                    caTwo,
                    examScore
                );


            const total =
                Number(
                    result.total ??
                    calculatedTotal
                );


            const grade =
                result.grade ||
                getGrade(total);


            const remark =
                result.remark ||
                getRemark(total);


            // ------------------------------------------------
            // TABLE
            // ------------------------------------------------

            row.innerHTML = `

                <td>
                    ${escapeHTML(
                        result.studentName ||
                        "Unknown Student"
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        result.className ||
                        result.studentClass ||
                        result.class ||
                        ""
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        result.subject ||
                        ""
                    )}
                </td>


                <td>
                    ${cw1}
                </td>


                <td>
                    ${cw2}
                </td>


                <td>
                    ${ass1}
                </td>


                <td>
                    ${ass2}
                </td>


                <td>
                    ${caOne}
                </td>


                <td>
                    ${caTwo}
                </td>


                <td>
                    ${examScore}
                </td>


                <td>
                    <strong>
                        ${total}
                    </strong>
                </td>


                <td>
                    <strong>
                        ${escapeHTML(
                            grade
                        )}
                    </strong>
                </td>


                <td>
                    ${escapeHTML(
                        remark
                    )}
                </td>


                <td>

                    <div
                        class="table-actions"
                    >

                        <button
                            type="button"
                            class="table-action"
                            title="Edit"
                            data-edit-result="${escapeAttribute(
                                result.firestoreId
                            )}"
                        >
                            ✏️
                        </button>


                        <button
                            type="button"
                            class="table-action"
                            title="Delete"
                            data-delete-result="${escapeAttribute(
                                result.firestoreId
                            )}"
                        >
                            🗑️
                        </button>

                    </div>

                </td>

            `;


            resultsTableBody.appendChild(
                row
            );

        }
    );


    attachResultActions();

}


// ============================================================
// RESULT ACTION BUTTONS
// ============================================================

function attachResultActions() {

    document
        .querySelectorAll(
            "[data-edit-result]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function(event) {

                        event.preventDefault();

                        editResult(
                            this.dataset.editResult
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-delete-result]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function(event) {

                        event.preventDefault();

                        deleteResult(
                            this.dataset.deleteResult
                        );

                    }
                );

            }
        );

}


// ============================================================
// EDIT RESULT
// ============================================================

function editResult(
    firestoreId
) {

    const resultData =
        results.find(
            item =>
                item.firestoreId ===
                firestoreId
        );


    if (!resultData) {

        alert(
            "Result could not be found."
        );

        return;

    }


    openResultModal(
        resultData
    );

}


// ============================================================
// DELETE RESULT
// ============================================================

async function deleteResult(
    firestoreId
) {

    const resultData =
        results.find(
            item =>
                item.firestoreId ===
                firestoreId
        );


    if (!resultData) {
        return;
    }


    const confirmed =
        confirm(
            `Delete the result for ${resultData.studentName || "this student"} in ${resultData.subject || "this subject"}?`
        );


    if (!confirmed) {
        return;
    }


    try {

        await withTimeout(deleteDoc(

            doc(
                db,
                "results",
                firestoreId
            )

        ));


        alert(
            "Result deleted successfully."
        );


        await loadResults();

    }

    catch (error) {

        console.error(
            "Error deleting result:",
            error
        );


        alert(
            "Unable to delete result.\n\n" +
            getFirebaseErrorMessage(
                error
            )
        );

    }

}


// ============================================================
// FILTER EVENTS
// ============================================================

if (resultSessionFilter) {

    resultSessionFilter.addEventListener(
        "change",
        renderResults
    );

}


if (resultTermFilter) {

    resultTermFilter.addEventListener(
        "change",
        renderResults
    );

}


if (resultClassFilter) {

    resultClassFilter.addEventListener(
        "change",
        renderResults
    );

}


if (resultSearch) {

    resultSearch.addEventListener(
        "input",
        renderResults
    );

}


// ============================================================
// BULK RESULT MODAL
// ============================================================

if (bulkResultBtn) {

    bulkResultBtn.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            openBulkResultModal();

        }
    );

}


// ============================================================
// OPEN BULK MODAL
// ============================================================

function openBulkResultModal() {

    if (!bulkResultModal) {
        return;
    }


    bulkResultModal.classList.add(
        "show"
    );


    populateClassDropdown(
        bulkClass,
        false
    );


    populateSubjectDropdown(
        bulkSubject
    );


    if (bulkSession) {

        bulkSession.value =
            "2026/2027";

    }


    if (bulkTerm) {

        bulkTerm.value =
            "";

    }


    if (bulkClass) {

        bulkClass.value =
            "";

    }


    if (bulkSubject) {

        bulkSubject.value =
            "";

    }


    if (bulkResultTableContainer) {

        bulkResultTableContainer.style.display =
            "none";

    }


    if (saveBulkResultsBtn) {

        saveBulkResultsBtn.style.display =
            "none";

    }


    if (bulkResultTableBody) {

        bulkResultTableBody.innerHTML =
            "";

    }

}


// ============================================================
// CLOSE BULK MODAL
// ============================================================

function closeBulkResultModalFunction() {

    if (!bulkResultModal) {
        return;
    }


    bulkResultModal.classList.remove(
        "show"
    );


    if (bulkResultTableBody) {

        bulkResultTableBody.innerHTML =
            "";

    }


    if (bulkResultTableContainer) {

        bulkResultTableContainer.style.display =
            "none";

    }


    if (saveBulkResultsBtn) {

        saveBulkResultsBtn.style.display =
            "none";

    }

}


// ============================================================
// BULK CLOSE BUTTON
// ============================================================

if (closeBulkResultModal) {

    closeBulkResultModal.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            closeBulkResultModalFunction();

        }
    );

}


if (cancelBulkResultBtn) {

    cancelBulkResultBtn.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            closeBulkResultModalFunction();

        }
    );

}


if (bulkResultModal) {

    bulkResultModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                bulkResultModal
            ) {

                closeBulkResultModalFunction();

            }

        }
    );

}


// ============================================================
// LOAD CLASS STUDENTS
// ============================================================

if (loadClassStudentsBtn) {

    loadClassStudentsBtn.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            loadBulkStudents();

        }
    );

}


// ============================================================
// LOAD BULK STUDENTS
// ============================================================

function loadBulkStudents() {

    const className =
        getValue(
            bulkClass
        );


    const session =
        getValue(
            bulkSession
        );


    const term =
        getValue(
            bulkTerm
        );


    const subject =
        getValue(
            bulkSubject
        );


    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (
        !className ||
        !session ||
        !term ||
        !subject
    ) {

        alert(
            "Please select the session, term, class and subject."
        );

        return;

    }


    // --------------------------------------------------------
    // FIND CLASS STUDENTS
    // --------------------------------------------------------

    const classStudents =
        students.filter(
            student => {

                return (

                    getStudentClass(
                        student
                    )
                    .toLowerCase() ===

                    className
                        .trim()
                        .toLowerCase()

                );

            }
        );


    if (
        classStudents.length === 0
    ) {

        alert(
            "No students were found in the selected class."
        );

        if (bulkResultTableContainer) {

            bulkResultTableContainer.style.display =
                "none";

        }

        if (saveBulkResultsBtn) {

            saveBulkResultsBtn.style.display =
                "none";

        }

        return;

    }


    // --------------------------------------------------------
    // CLEAR TABLE
    // --------------------------------------------------------

    if (bulkResultTableBody) {

        bulkResultTableBody.innerHTML =
            "";

    }


    // --------------------------------------------------------
    // CREATE ROW FOR EACH STUDENT
    // --------------------------------------------------------

    classStudents
        .slice()
        .sort(
            (a, b) =>
                getStudentName(a)
                    .localeCompare(
                        getStudentName(b)
                    )
        )
        .forEach(
            (student, index) => {

                const existingResult =
                    results.find(
                        result => {

                            const resultClass =
                                result.className ||
                                result.studentClass ||
                                result.class ||
                                "";

                            const resultSession =
                                result.session ||
                                result.academicSession ||
                                "";

                            const resultSubject =
                                result.subject ||
                                "";


                            return (

                                result.studentId ===
                                student.firestoreId

                                &&

                                String(
                                    resultClass
                                )
                                .toLowerCase() ===
                                String(
                                    className
                                )
                                .toLowerCase()

                                &&

                                resultSession ===
                                session

                                &&

                                result.term ===
                                term

                                &&

                                String(
                                    resultSubject
                                )
                                .toLowerCase() ===
                                String(
                                    subject
                                )
                                .toLowerCase()

                            );

                        }
                    );


                const cw1 =
                    existingResult
                        ? Number(
                            existingResult.classWork1 ??
                            existingResult.cw1 ??
                            0
                        )
                        : 0;


                const cw2 =
                    existingResult
                        ? Number(
                            existingResult.classWork2 ??
                            existingResult.cw2 ??
                            0
                        )
                        : 0;


                const ass1 =
                    existingResult
                        ? Number(
                            existingResult.assignment1 ??
                            existingResult.ass1 ??
                            0
                        )
                        : 0;


                const ass2 =
                    existingResult
                        ? Number(
                            existingResult.assignment2 ??
                            existingResult.ass2 ??
                            0
                        )
                        : 0;


                const caOne =
                    existingResult
                        ? Number(
                            existingResult.ca1 ??
                            0
                        )
                        : 0;


                const caTwo =
                    existingResult
                        ? Number(
                            existingResult.ca2 ??
                            0
                        )
                        : 0;


                const examScore =
                    existingResult
                        ? Number(
                            existingResult.exam ??
                            existingResult.examScore ??
                            0
                        )
                        : 0;


                const total =
                    calculateTotal(
                        cw1,
                        cw2,
                        ass1,
                        ass2,
                        caOne,
                        caTwo,
                        examScore
                    );


                const row =
                    document.createElement(
                        "tr"
                    );


                row.dataset.studentId =
                    student.firestoreId;


                if (
                    existingResult
                ) {

                    row.dataset.existingResultId =
                        existingResult.firestoreId;

                }


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

                        <input
                            type="number"
                            class="bulk-score bulk-cw1"
                            min="0"
                            max="5"
                            step="0.01"
                            value="${cw1}"
                        >

                    </td>


                    <td>

                        <input
                            type="number"
                            class="bulk-score bulk-cw2"
                            min="0"
                            max="5"
                            step="0.01"
                            value="${cw2}"
                        >

                    </td>


                    <td>

                        <input
                            type="number"
                            class="bulk-score bulk-assignment1"
                            min="0"
                            max="5"
                            step="0.01"
                            value="${ass1}"
                        >

                    </td>


                    <td>

                        <input
                            type="number"
                            class="bulk-score bulk-assignment2"
                            min="0"
                            max="5"
                            step="0.01"
                            value="${ass2}"
                        >

                    </td>


                    <td>

                        <input
                            type="number"
                            class="bulk-score bulk-ca1"
                            min="0"
                            max="10"
                            step="0.01"
                            value="${caOne}"
                        >

                    </td>


                    <td>

                        <input
                            type="number"
                            class="bulk-score bulk-ca2"
                            min="0"
                            max="10"
                            step="0.01"
                            value="${caTwo}"
                        >

                    </td>


                    <td>

                        <input
                            type="number"
                            class="bulk-score bulk-exam"
                            min="0"
                            max="60"
                            step="0.01"
                            value="${examScore}"
                        >

                    </td>


                    <td>

                        <strong
                            class="bulk-total"
                        >
                            ${total}
                        </strong>

                    </td>


                    <td>

                        <strong
                            class="bulk-grade"
                        >
                            ${getGrade(total)}
                        </strong>

                    </td>


                    <td>

                        <span
                            class="bulk-remark"
                        >
                            ${escapeHTML(
                                getRemark(total)
                            )}
                        </span>

                    </td>

                `;


                if (bulkResultTableBody) {

                    bulkResultTableBody.appendChild(
                        row
                    );

                }

            }
        );


    // --------------------------------------------------------
    // SHOW TABLE
    // --------------------------------------------------------

    if (bulkResultTableContainer) {

        bulkResultTableContainer.style.display =
            "block";

    }


    if (saveBulkResultsBtn) {

        saveBulkResultsBtn.style.display =
            "inline-flex";

    }


    attachBulkScoreEvents();

}


// ============================================================
// BULK SCORE CALCULATION
// ============================================================

function updateBulkRow(
    row
) {

    if (!row) {
        return;
    }


    const cw1 =
        numberWithinRange(
            row.querySelector(
                ".bulk-cw1"
            )?.value,
            0,
            5
        );


    const cw2 =
        numberWithinRange(
            row.querySelector(
                ".bulk-cw2"
            )?.value,
            0,
            5
        );


    const ass1 =
        numberWithinRange(
            row.querySelector(
                ".bulk-assignment1"
            )?.value,
            0,
            5
        );


    const ass2 =
        numberWithinRange(
            row.querySelector(
                ".bulk-assignment2"
            )?.value,
            0,
            5
        );


    const caOne =
        numberWithinRange(
            row.querySelector(
                ".bulk-ca1"
            )?.value,
            0,
            10
        );


    const caTwo =
        numberWithinRange(
            row.querySelector(
                ".bulk-ca2"
            )?.value,
            0,
            10
        );


    const examScore =
        numberWithinRange(
            row.querySelector(
                ".bulk-exam"
            )?.value,
            0,
            60
        );


    const total =
        calculateTotal(
            cw1,
            cw2,
            ass1,
            ass2,
            caOne,
            caTwo,
            examScore
        );


    const totalElement =
        row.querySelector(
            ".bulk-total"
        );


    const gradeElement =
        row.querySelector(
            ".bulk-grade"
        );


    const remarkElement =
        row.querySelector(
            ".bulk-remark"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (gradeElement) {

        gradeElement.textContent =
            getGrade(total);

    }


    if (remarkElement) {

        remarkElement.textContent =
            getRemark(total);

    }

}


// ============================================================
// BULK SCORE INPUT EVENTS
// ============================================================

function attachBulkScoreEvents() {

    if (!bulkResultTableBody) {
        return;
    }


    bulkResultTableBody
        .querySelectorAll(
            ".bulk-score"
        )
        .forEach(
            input => {

                input.addEventListener(
                    "input",
                    function() {

                        updateBulkRow(
                            this.closest("tr")
                        );

                    }
                );

            }
        );

}


// ============================================================
// SAVE BULK RESULTS
// ============================================================

if (saveBulkResultsBtn) {

    saveBulkResultsBtn.addEventListener(
        "click",
        async function(event) {

            event.preventDefault();

            await saveBulkResults();

        }
    );

}


// ============================================================
// SAVE BULK RESULTS FUNCTION
// ============================================================

async function saveBulkResults() {

    const session =
        getValue(
            bulkSession
        );


    const term =
        getValue(
            bulkTerm
        );


    const className =
        getValue(
            bulkClass
        );


    const subject =
        getValue(
            bulkSubject
        );


    if (
        !session ||
        !term ||
        !className ||
        !subject
    ) {

        alert(
            "Please select the session, term, class and subject."
        );

        return;

    }


    if (!bulkResultTableBody) {
        return;
    }


    const rows =
        [
            ...bulkResultTableBody
                .querySelectorAll("tr")
        ];


    if (rows.length === 0) {

        alert(
            "There are no students to save."
        );

        return;

    }


    // Prevent double clicking while saving

    if (saveBulkResultsBtn) {

        saveBulkResultsBtn.disabled =
            true;

        saveBulkResultsBtn.textContent =
            "Saving...";

    }


    try {

        let savedCount = 0;


        for (
            const row of rows
        ) {

            const studentId =
                row.dataset.studentId;


            if (!studentId) {
                continue;
            }


            const student =
                students.find(
                    item =>
                        item.firestoreId ===
                        studentId
                );


            if (!student) {
                continue;
            }


            const cw1 =
                numberWithinRange(
                    row.querySelector(
                        ".bulk-cw1"
                    )?.value,
                    0,
                    5
                );


            const cw2 =
                numberWithinRange(
                    row.querySelector(
                        ".bulk-cw2"
                    )?.value,
                    0,
                    5
                );


            const ass1 =
                numberWithinRange(
                    row.querySelector(
                        ".bulk-assignment1"
                    )?.value,
                    0,
                    5
                );


            const ass2 =
                numberWithinRange(
                    row.querySelector(
                        ".bulk-assignment2"
                    )?.value,
                    0,
                    5
                );


            const caOne =
                numberWithinRange(
                    row.querySelector(
                        ".bulk-ca1"
                    )?.value,
                    0,
                    10
                );


            const caTwo =
                numberWithinRange(
                    row.querySelector(
                        ".bulk-ca2"
                    )?.value,
                    0,
                    10
                );


            const examScore =
                numberWithinRange(
                    row.querySelector(
                        ".bulk-exam"
                    )?.value,
                    0,
                    60
                );


            const total =
                calculateTotal(
                    cw1,
                    cw2,
                    ass1,
                    ass2,
                    caOne,
                    caTwo,
                    examScore
                );


            const grade =
                getGrade(total);


            const remark =
                getRemark(total);


            const resultData = {

                studentId:
                    studentId,

                studentName:
                    getStudentName(
                        student
                    ),

                className:
                    className,

                subject:
                    subject,

                session:
                    session,

                academicSession:
                    session,

                term:
                    term,

                classWork1:
                    cw1,

                classWork2:
                    cw2,

                assignment1:
                    ass1,

                assignment2:
                    ass2,

                ca1:
                    caOne,

                ca2:
                    caTwo,

                exam:
                    examScore,

                total:
                    total,

                grade:
                    grade,

                remark:
                    remark,

                updatedAt:
                    serverTimestamp()

            };


            const existingResultId =
                row.dataset.existingResultId ||
                "";


            if (existingResultId) {

                await withTimeout(updateDoc(

                    doc(
                        db,
                        "results",
                        existingResultId
                    ),

                    resultData

                ));

            }

            else {

                await withTimeout(addDoc(

                    resultsCollection,

                    {

                        ...resultData,

                        createdAt:
                            serverTimestamp()

                    }

                ));

            }


            savedCount++;

        }


        alert(
            `${savedCount} result${savedCount === 1 ? "" : "s"} saved successfully.`
        );


        await loadResults();


        closeBulkResultModalFunction();

    }

    catch (error) {

        console.error(
            "Error saving bulk results:",
            error
        );


        alert(
            "Unable to save bulk results.\n\n" +
            getFirebaseErrorMessage(
                error
            )
        );

    }

    finally {

        if (saveBulkResultsBtn) {

            saveBulkResultsBtn.disabled =
                false;

            saveBulkResultsBtn.textContent =
                "Save All Results";

        }

    }

}


// ============================================================
// INITIALIZE
// ============================================================

async function initializeResultsPage() {

    updateScorePreview();

    await loadAllData();

}


// ============================================================
// START
// ============================================================

initializeResultsPage();
