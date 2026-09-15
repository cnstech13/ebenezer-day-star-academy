import { adminReady, withTimeout } from "./admin-guard.js";
// ============================================================
// STUDENTS MANAGEMENT
// Ebenezer Day Star Academy
// Firebase 12 Modular Firestore
//
// Features:
// - Add student
// - Edit student
// - Delete student
// - Search students
// - Filter by class
// - Generate student ID
// - Save parent details only
//
// SweetAlert2 added for:
// - Success messages
// - Error messages
// - Delete confirmation
// - Loading state
//
// IMPORTANT:
// - No parent account creation
// - No parent account linking
// - No parent UID
// - No localStorage
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
// STUDENTS DATA
// ============================================================

let students = [];



// ============================================================
// FIRESTORE COLLECTION
// ============================================================

const studentsCollection =
    collection(
        db,
        "students"
    );



// ============================================================
// ELEMENTS
// ============================================================

const studentModal =
    document.getElementById(
        "studentModal"
    );


const studentForm =
    document.getElementById(
        "studentForm"
    );


const studentsTableBody =
    document.getElementById(
        "studentsTableBody"
    );


const emptyStudents =
    document.getElementById(
        "emptyStudents"
    );


const studentSearch =
    document.getElementById(
        "studentSearch"
    );


const classFilter =
    document.getElementById(
        "classFilter"
    );


const addStudentBtn =
    document.getElementById(
        "addStudentBtn"
    );


const closeStudentModal =
    document.getElementById(
        "closeStudentModal"
    );


const cancelStudentBtn =
    document.getElementById(
        "cancelStudentBtn"
    );


const saveStudentBtn =
    studentForm?.querySelector(
        'button[type="submit"]'
    );



// ============================================================
// CHECK REQUIRED ELEMENTS
// ============================================================

if (!studentModal) {

    console.error(
        "studentModal was not found."
    );

}


if (!studentForm) {

    console.error(
        "studentForm was not found."
    );

}


if (!studentsTableBody) {

    console.error(
        "studentsTableBody was not found."
    );

}


if (!addStudentBtn) {

    console.error(
        "addStudentBtn was not found."
    );

}



// ============================================================
// GENERATE STUDENT ID
// ============================================================

function generateStudentId() {

    const year =
        new Date().getFullYear();


    let number =
        students.length + 1;


    let id =
        `STU-${year}-${String(number).padStart(4, "0")}`;


    while (

        students.some(
            student =>
                student.id === id
        )

    ) {

        number++;


        id =
            `STU-${year}-${String(number).padStart(4, "0")}`;

    }


    return id;

}



// ============================================================
// LOAD STUDENTS FROM FIRESTORE
// ============================================================

async function loadStudents() {

    try {

        const snapshot =
            await withTimeout(getDocs(
                studentsCollection
            ));


        students =
            snapshot.docs.map(
                documentSnapshot => ({

                    firestoreId:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                })
            );


        renderStudents();

    }

    catch (error) {

        console.error(
            "Error loading students:",
            error
        );


        students = [];


        renderStudents();


        showError(
            "Unable to Load Students",
            getFirebaseErrorMessage(error)
        );

    }

}



// ============================================================
// OPEN STUDENT MODAL
// ============================================================

function openStudentModal(
    student = null
) {

    if (!studentModal) {

        return;

    }


    studentModal.classList.add(
        "show"
    );


    // ========================================================
    // EDIT MODE
    // ========================================================

    if (student) {

        document.getElementById(
            "modalTitle"
        ).textContent =
            "Edit Student";


        document.getElementById(
            "editingStudentId"
        ).value =
            student.firestoreId || "";


        document.getElementById(
            "firstName"
        ).value =
            student.firstName || "";


        document.getElementById(
            "lastName"
        ).value =
            student.lastName || "";


        document.getElementById(
            "dateOfBirth"
        ).value =
            student.dateOfBirth || "";


        document.getElementById(
            "gender"
        ).value =
            student.gender || "";


        document.getElementById(
            "studentClass"
        ).value =
            student.studentClass || "";


        document.getElementById(
            "admissionDate"
        ).value =
            student.admissionDate || "";


        document.getElementById(
            "parentName"
        ).value =
            student.parentName || "";


        document.getElementById(
            "parentPhone"
        ).value =
            student.parentPhone || "";


        document.getElementById(
            "parentEmail"
        ).value =
            student.parentEmail || "";


        document.getElementById(
            "studentStatus"
        ).value =
            student.status || "Active";


        document.getElementById(
            "studentAddress"
        ).value =
            student.address || "";

    }


    // ========================================================
    // ADD MODE
    // ========================================================

    else {

        studentForm.reset();


        document.getElementById(
            "modalTitle"
        ).textContent =
            "Add Student";


        document.getElementById(
            "editingStudentId"
        ).value =
            "";


        document.getElementById(
            "studentStatus"
        ).value =
            "Active";

    }

}



// ============================================================
// CLOSE STUDENT MODAL
// ============================================================

function closeStudentModalFunction() {

    if (!studentModal) {

        return;

    }


    studentModal.classList.remove(
        "show"
    );


    if (studentForm) {

        studentForm.reset();

    }


    const editingStudentId =
        document.getElementById(
            "editingStudentId"
        );


    if (editingStudentId) {

        editingStudentId.value =
            "";

    }


    const modalTitle =
        document.getElementById(
            "modalTitle"
        );


    if (modalTitle) {

        modalTitle.textContent =
            "Add Student";

    }


    if (saveStudentBtn) {

        saveStudentBtn.disabled =
            false;

        saveStudentBtn.textContent =
            "Save Student";

    }

}



// ============================================================
// OPEN ADD STUDENT MODAL
// ============================================================

if (addStudentBtn) {

    addStudentBtn.addEventListener(
        "click",
        function () {

            openStudentModal();

        }
    );

}



// ============================================================
// CLOSE BUTTON
// ============================================================

if (closeStudentModal) {

    closeStudentModal.addEventListener(
        "click",
        closeStudentModalFunction
    );

}



// ============================================================
// CANCEL BUTTON
// ============================================================

if (cancelStudentBtn) {

    cancelStudentBtn.addEventListener(
        "click",
        closeStudentModalFunction
    );

}



// ============================================================
// CLICK OUTSIDE MODAL
// ============================================================

if (studentModal) {

    studentModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                studentModal
            ) {

                closeStudentModalFunction();

            }

        }
    );

}



// ============================================================
// SAVE / UPDATE STUDENT
// ============================================================

if (studentForm) {

    studentForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ------------------------------------------------
            // PREVENT DOUBLE CLICK
            // ------------------------------------------------

            if (
                saveStudentBtn &&
                saveStudentBtn.disabled
            ) {

                return;

            }


            // ------------------------------------------------
            // BUTTON STATE
            // ------------------------------------------------

            if (saveStudentBtn) {

                saveStudentBtn.disabled =
                    true;

                saveStudentBtn.textContent =
                    "Saving...";

            }


            try {

                // =================================================
                // EDITING ID
                // =================================================

                const editingId =
                    document.getElementById(
                        "editingStudentId"
                    )
                    .value
                    .trim();



                // =================================================
                // FORM VALUES
                // =================================================

                const firstName =
                    document.getElementById(
                        "firstName"
                    )
                    .value
                    .trim();


                const lastName =
                    document.getElementById(
                        "lastName"
                    )
                    .value
                    .trim();


                const dateOfBirth =
                    document.getElementById(
                        "dateOfBirth"
                    )
                    .value;


                const gender =
                    document.getElementById(
                        "gender"
                    )
                    .value;


                const studentClass =
                    document.getElementById(
                        "studentClass"
                    )
                    .value;


                const admissionDate =
                    document.getElementById(
                        "admissionDate"
                    )
                    .value;


                const parentName =
                    document.getElementById(
                        "parentName"
                    )
                    .value
                    .trim();


                const parentPhone =
                    document.getElementById(
                        "parentPhone"
                    )
                    .value
                    .trim();


                const parentEmail =
                    document.getElementById(
                        "parentEmail"
                    )
                    .value
                    .trim()
                    .toLowerCase();


                const status =
                    document.getElementById(
                        "studentStatus"
                    )
                    .value;


                const address =
                    document.getElementById(
                        "studentAddress"
                    )
                    .value
                    .trim();



                // =================================================
                // VALIDATION
                // =================================================

                if (

                    !firstName ||
                    !lastName ||
                    !dateOfBirth ||
                    !gender ||
                    !studentClass ||
                    !admissionDate ||
                    !parentName ||
                    !parentPhone

                ) {

                    throw new Error(
                        "Please complete all required fields."
                    );

                }



                // =================================================
                // EMAIL VALIDATION
                // =================================================

                if (parentEmail) {

                    const emailPattern =
                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


                    if (
                        !emailPattern.test(
                            parentEmail
                        )
                    ) {

                        throw new Error(
                            "Please enter a valid parent email address."
                        );

                    }

                }



                // =================================================
                // DUPLICATE STUDENT NAME
                // =================================================

                const duplicateStudent =
                    students.find(
                        student =>

                            String(
                                student.firstName || ""
                            )
                                .trim()
                                .toLowerCase() ===
                            firstName.toLowerCase()

                            &&

                            String(
                                student.lastName || ""
                            )
                                .trim()
                                .toLowerCase() ===
                            lastName.toLowerCase()

                            &&

                            student.firestoreId !==
                            editingId
                    );


                if (duplicateStudent) {

                    throw new Error(
                        "A student with this name already exists."
                    );

                }



                // =================================================
                // STUDENT DATA
                // =================================================

                const studentData = {

                    firstName,

                    lastName,

                    dateOfBirth,

                    gender,

                    studentClass,

                    admissionDate,

                    parentName,

                    parentPhone,

                    parentEmail,

                    status,

                    address,

                    updatedAt:
                        serverTimestamp()

                };



                // =================================================
                // SHOW LOADING
                // =================================================

                showLoading(
                    editingId
                        ? "Updating Student"
                        : "Saving Student",

                    editingId
                        ? "Please wait while the student information is being updated..."
                        : "Please wait while the student is being saved..."
                );



                // =================================================
                // UPDATE EXISTING STUDENT
                // =================================================

                if (editingId) {

                    const studentRef =
                        doc(
                            db,
                            "students",
                            editingId
                        );


                    await withTimeout(updateDoc(
                        studentRef,
                        studentData
                    ));


                    Swal.close();


                    await showSuccess(
                        "Student Updated!",
                        `${firstName} ${lastName} has been updated successfully.`
                    );

                }



                // =================================================
                // ADD NEW STUDENT
                // =================================================

                else {

                    const studentId =
                        generateStudentId();


                    const newStudent = {

                        id:
                            studentId,

                        ...studentData,

                        createdAt:
                            serverTimestamp()

                    };


                    await withTimeout(addDoc(
                        studentsCollection,
                        newStudent
                    ));


                    Swal.close();


                    await showSuccess(
                        "Student Added!",
                        `${firstName} ${lastName} has been saved successfully.\n\nStudent ID: ${studentId}`
                    );

                }



                // =================================================
                // RELOAD STUDENTS
                // =================================================

                await loadStudents();



                // =================================================
                // CLOSE MODAL
                // =================================================

                closeStudentModalFunction();

            }

            catch (error) {

                console.error(
                    "Error saving student:",
                    error
                );


                Swal.close();


                showError(
                    "Unable to Save Student",
                    getFirebaseErrorMessage(error)
                );

            }

            finally {

                if (saveStudentBtn) {

                    saveStudentBtn.disabled =
                        false;

                    saveStudentBtn.textContent =
                        "Save Student";

                }

            }

        }
    );

}



// ============================================================
// RENDER STUDENTS
// ============================================================

function renderStudents() {

    if (!studentsTableBody) {

        return;

    }


    const search =
        studentSearch

            ? studentSearch.value
                .trim()
                .toLowerCase()

            : "";


    const selectedClass =
        classFilter
            ? classFilter.value
            : "";



    // ========================================================
    // FILTER STUDENTS
    // ========================================================

    const filteredStudents =
        students.filter(
            student => {

                const fullName =
                    `${student.firstName || ""} ${student.lastName || ""}`
                        .trim()
                        .toLowerCase();


                const studentId =
                    String(
                        student.id || ""
                    )
                    .toLowerCase();


                const parentPhone =
                    String(
                        student.parentPhone || ""
                    )
                    .toLowerCase();


                const parentEmail =
                    String(
                        student.parentEmail || ""
                    )
                    .toLowerCase();


                const matchesSearch =

                    !search ||

                    fullName.includes(
                        search
                    ) ||

                    studentId.includes(
                        search
                    ) ||

                    parentPhone.includes(
                        search
                    ) ||

                    parentEmail.includes(
                        search
                    );


                const matchesClass =

                    !selectedClass ||

                    student.studentClass ===
                    selectedClass;


                return (

                    matchesSearch &&
                    matchesClass

                );

            }
        );



    // ========================================================
    // CLEAR TABLE
    // ========================================================

    studentsTableBody.innerHTML =
        "";



    // ========================================================
    // EMPTY
    // ========================================================

    if (
        filteredStudents.length ===
        0
    ) {

        if (emptyStudents) {

            emptyStudents.style.display =
                "block";

        }

        return;

    }



    if (emptyStudents) {

        emptyStudents.style.display =
            "none";

    }



    // ========================================================
    // CREATE TABLE ROWS
    // ========================================================

    filteredStudents.forEach(
        student => {

            const row =
                document.createElement(
                    "tr"
                );


            const firstInitial =
                student.firstName
                    ? student.firstName[0]
                    : "";


            const lastInitial =
                student.lastName
                    ? student.lastName[0]
                    : "";


            const initials =
                (
                    firstInitial +
                    lastInitial
                ).toUpperCase();



            row.innerHTML = `

                <!-- STUDENT ID -->

                <td>

                    <span class="student-id">

                        ${escapeHTML(
                            student.id
                        )}

                    </span>

                </td>



                <!-- STUDENT NAME -->

                <td>

                    <div class="student-name">

                        <div class="student-avatar">

                            ${escapeHTML(
                                initials
                            )}

                        </div>


                        <strong>

                            ${escapeHTML(
                                student.firstName || ""
                            )}

                            ${escapeHTML(
                                student.lastName || ""
                            )}

                        </strong>

                    </div>

                </td>



                <!-- GENDER -->

                <td>

                    ${escapeHTML(
                        student.gender || ""
                    )}

                </td>



                <!-- CLASS -->

                <td>

                    ${escapeHTML(
                        student.studentClass || ""
                    )}

                </td>



                <!-- PARENT PHONE -->

                <td>

                    ${escapeHTML(
                        student.parentPhone || ""
                    )}

                </td>



                <!-- STATUS -->

                <td>

                    <span class="
                        status-badge
                        ${
                            student.status ===
                            "Active"

                                ? "status-active"

                                : "status-inactive"
                        }
                    ">

                        ${escapeHTML(
                            student.status || ""
                        )}

                    </span>

                </td>



                <!-- ACTIONS -->

                <td>

                    <div class="table-actions">


                        <button
                            type="button"
                            class="table-action"
                            title="Edit"
                            data-action="edit"
                            data-id="${escapeHTML(
                                student.firestoreId
                            )}"
                        >

                            ✏️

                        </button>


                        <button
                            type="button"
                            class="table-action"
                            title="Delete"
                            data-action="delete"
                            data-id="${escapeHTML(
                                student.firestoreId
                            )}"
                        >

                            🗑️

                        </button>


                    </div>

                </td>

            `;


            studentsTableBody.appendChild(
                row
            );

        }
    );

}



// ============================================================
// TABLE ACTIONS
// ============================================================

if (studentsTableBody) {

    studentsTableBody.addEventListener(
        "click",
        async function (event) {

            const button =
                event.target.closest(
                    "button[data-action]"
                );


            if (!button) {

                return;

            }


            const action =
                button.dataset.action;


            const firestoreId =
                button.dataset.id;



            // =================================================
            // EDIT
            // =================================================

            if (
                action ===
                "edit"
            ) {

                editStudent(
                    firestoreId
                );

            }



            // =================================================
            // DELETE
            // =================================================

            if (
                action ===
                "delete"
            ) {

                await deleteStudent(
                    firestoreId
                );

            }

        }
    );

}



// ============================================================
// EDIT STUDENT
// ============================================================

function editStudent(
    firestoreId
) {

    const student =
        students.find(
            item =>
                item.firestoreId ===
                firestoreId
        );


    if (!student) {

        showError(
            "Student Not Found",
            "The student record could not be found."
        );

        return;

    }


    openStudentModal(
        student
    );

}



// ============================================================
// DELETE STUDENT
// ============================================================

async function deleteStudent(
    firestoreId
) {

    const student =
        students.find(
            item =>
                item.firestoreId ===
                firestoreId
        );


    if (!student) {

        showError(
            "Student Not Found",
            "The student record could not be found."
        );

        return;

    }


    const studentName =
        `${student.firstName || ""} ${student.lastName || ""}`
            .trim();



    // ========================================================
    // SWEETALERT DELETE CONFIRMATION
    // ========================================================

    const confirmed =
        await confirmDelete(
            "Delete Student?",
            `Are you sure you want to delete ${studentName}?\n\nThis action cannot be undone.`
        );


    if (!confirmed) {

        return;

    }



    try {

        // ====================================================
        // SHOW LOADING
        // ====================================================

        showLoading(
            "Deleting Student",
            `Please wait while ${studentName} is being deleted...`
        );


        const studentRef =
            doc(
                db,
                "students",
                firestoreId
            );


        await withTimeout(deleteDoc(
            studentRef
        ));


        Swal.close();


        await showSuccess(
            "Student Deleted!",
            `${studentName} has been deleted successfully.`
        );


        await loadStudents();

    }

    catch (error) {

        console.error(
            "Error deleting student:",
            error
        );


        Swal.close();


        showError(
            "Delete Failed",
            getFirebaseErrorMessage(error)
        );

    }

}



// ============================================================
// SEARCH
// ============================================================

if (studentSearch) {

    studentSearch.addEventListener(
        "input",
        renderStudents
    );

}



// ============================================================
// CLASS FILTER
// ============================================================

if (classFilter) {

    classFilter.addEventListener(
        "change",
        renderStudents
    );

}



// ============================================================
// ESCAPE HTML
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
// FIREBASE ERROR MESSAGE
// ============================================================

function getFirebaseErrorMessage(
    error
) {

    if (!error) {

        return "Unknown error.";

    }


    if (
        error.code ===
        "permission-denied"
    ) {

        return (

            "Firestore permission denied. " +

            "Make sure you are signed in " +

            "and your Firestore Rules allow " +

            "the operation."

        );

    }


    if (
        error.code ===
        "unauthenticated"
    ) {

        return (

            "You are not authenticated. " +

            "Please log in again."

        );

    }


    if (
        error.code ===
        "failed-precondition"
    ) {

        return (

            "Firestore could not complete the operation. " +

            "Please check your Firebase configuration."

        );

    }


    if (
        error.code ===
        "unavailable"
    ) {

        return (

            "Firebase is temporarily unavailable. " +

            "Check your internet connection."

        );

    }


    return (

        error.message ||

        "An unexpected Firebase error occurred."

    );

}



// ============================================================
// INITIAL LOAD
// ============================================================

loadStudents();