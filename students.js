/* =========================================================
   STUDENTS MANAGEMENT
   EBENEZER DAY STAR ACADEMY
   Firebase Firestore Version
========================================================= */

import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import {
    db
} from "./firebase-config.js";


/* =========================================================
   ELEMENTS
========================================================= */

const studentSearch =
    document.getElementById("studentSearch");

const classFilter =
    document.getElementById("classFilter");

const addStudentBtn =
    document.getElementById("addStudentBtn");

const studentModal =
    document.getElementById("studentModal");

const studentForm =
    document.getElementById("studentForm");

const editingStudentId =
    document.getElementById("editingStudentId");

const studentsTableBody =
    document.getElementById("studentsTableBody");

const emptyStudents =
    document.getElementById("emptyStudents");

const closeStudentModalBtn =
    document.getElementById("closeStudentModal");

const cancelStudentBtn =
    document.getElementById("cancelStudentBtn");

const modalTitle =
    document.getElementById("modalTitle");


/* =========================================================
   COLLECTIONS
========================================================= */

const studentsRef =
    collection(db, "students");

const classesRef =
    collection(db, "classes");


/* =========================================================
   DATA
========================================================= */

let students = [];

let classes = [];


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            await loadClasses();

            await loadStudents();

            setupEvents();

        } catch (error) {

            console.error(
                "Students page error:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error.message ||
                    "Unable to load students."
            });

        }

    }
);


/* =========================================================
   LOAD CLASSES
========================================================= */

async function loadClasses() {

    const snapshot =
        await getDocs(classesRef);

    const classMap =
        new Map();


    snapshot.forEach((docSnap) => {

        const data =
            docSnap.data();

        const className =
            String(
                data.name || ""
            ).trim();


        if (!className) {
            return;
        }


        const normalized =
            className.toLowerCase();


        /*
         * Prevent duplicate class names.
         */

        if (!classMap.has(normalized)) {

            classMap.set(
                normalized,
                {
                    firestoreId: docSnap.id,
                    ...data,
                    name: className
                }
            );

        }

    });


    classes =
        Array.from(
            classMap.values()
        );


    /*
     * Sort classes naturally.
     */

    classes.sort(
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


    populateStudentClassSelect();

    populateClassFilter();

}


/* =========================================================
   POPULATE STUDENT CLASS SELECT
========================================================= */

function populateStudentClassSelect() {

    const select =
        document.getElementById(
            "studentClass"
        );


    if (!select) {
        return;
    }


    select.innerHTML = `
        <option value="">
            Select Class
        </option>
    `;


    classes.forEach(
        (classItem) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                classItem.name;


            option.textContent =
                classItem.name;


            option.dataset.classId =
                classItem.firestoreId;


            select.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   POPULATE CLASS FILTER
========================================================= */

function populateClassFilter() {

    if (!classFilter) {
        return;
    }


    classFilter.innerHTML = `
        <option value="">
            All Classes
        </option>
    `;


    classes.forEach(
        (classItem) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                classItem.name;


            option.textContent =
                classItem.name;


            classFilter.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   LOAD STUDENTS
========================================================= */

async function loadStudents() {

    const snapshot =
        await getDocs(
            studentsRef
        );


    students = [];


    snapshot.forEach(
        (docSnap) => {

            students.push({

                firestoreId:
                    docSnap.id,

                ...docSnap.data()

            });

        }
    );


    /*
     * Sort students alphabetically.
     */

    students.sort(
        (a, b) => {

            const nameA =
                `${a.firstName || ""} ${a.lastName || ""}`
                    .trim()
                    .toLowerCase();


            const nameB =
                `${b.firstName || ""} ${b.lastName || ""}`
                    .trim()
                    .toLowerCase();


            return nameA.localeCompare(
                nameB
            );

        }
    );


    renderStudents();

}


/* =========================================================
   RENDER STUDENTS
========================================================= */

function renderStudents() {

    if (!studentsTableBody) {
        return;
    }


    const search =
        (
            studentSearch?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const selectedClass =
        classFilter?.value ||
        "";


    /*
     * Filter students.
     */

    const filtered =
        students.filter(
            (student) => {

                const fullName =
                    `${student.firstName || ""} ${student.lastName || ""}`
                        .trim()
                        .toLowerCase();


                const admissionNumber =
                    String(
                        student.id || ""
                    ).toLowerCase();


                const parentName =
                    String(
                        student.parentName || ""
                    ).toLowerCase();


                const parentPhone =
                    String(
                        student.parentPhone || ""
                    ).toLowerCase();


                const parentEmail =
                    String(
                        student.parentEmail || ""
                    ).toLowerCase();


                const matchesSearch =
                    !search ||

                    fullName.includes(
                        search
                    ) ||

                    admissionNumber.includes(
                        search
                    ) ||

                    parentName.includes(
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


    studentsTableBody.innerHTML = "";


    /*
     * Empty state.
     */

    if (filtered.length === 0) {

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


    /*
     * Create table rows.
     */

    filtered.forEach(
        (student) => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <!-- ADMISSION NUMBER -->

                <td>
                    <strong>
                        ${escapeHTML(
                            student.id || "-"
                        )}
                    </strong>
                </td>


                <!-- STUDENT NAME -->

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


                <!-- GENDER -->

                <td>
                    ${escapeHTML(
                        student.gender || "-"
                    )}
                </td>


                <!-- CLASS -->

                <td>
                    ${escapeHTML(
                        student.studentClass || "-"
                    )}
                </td>


                <!-- PARENT / GUARDIAN -->

                <td>
                    ${escapeHTML(
                        student.parentName || "-"
                    )}
                </td>


                <!-- PHONE -->

                <td>
                    ${escapeHTML(
                        student.parentPhone || "-"
                    )}
                </td>


                <!-- PARENT EMAIL -->

                <td>

                    ${
                        student.parentEmail
                            ? `
                                <a
                                    href="mailto:${escapeHTML(
                                        student.parentEmail
                                    )}"
                                >
                                    ${escapeHTML(
                                        student.parentEmail
                                    )}
                                </a>
                              `
                            : "-"
                    }

                </td>


                <!-- STATUS -->

                <td>

                    <span
                        class="status-badge ${
                            String(
                                student.status || ""
                            )
                            .toLowerCase() ===
                            "active"
                                ? "active"
                                : "inactive"
                        }"
                    >

                        ${escapeHTML(
                            student.status || "-"
                        )}

                    </span>

                </td>


                <!-- ACTIONS -->

                <td>

                    <button
                        type="button"
                        class="edit-student-btn"
                        data-id="${
                            student.firestoreId
                        }"
                    >
                        Edit
                    </button>


                    <button
                        type="button"
                        class="delete-student-btn"
                        data-id="${
                            student.firestoreId
                        }"
                    >
                        Delete
                    </button>

                </td>

            `;


            studentsTableBody.appendChild(
                row
            );

        }
    );


    attachRowButtons();

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {


    /* ADD STUDENT */

    if (addStudentBtn) {

        addStudentBtn.addEventListener(
            "click",
            openAddStudentModal
        );

    }


    /* SEARCH */

    if (studentSearch) {

        studentSearch.addEventListener(
            "input",
            renderStudents
        );

    }


    /* CLASS FILTER */

    if (classFilter) {

        classFilter.addEventListener(
            "change",
            renderStudents
        );

    }


    /* FORM SUBMISSION */

    if (studentForm) {

        studentForm.addEventListener(
            "submit",
            saveStudent
        );

    }


    /* CLOSE BUTTON */

    if (closeStudentModalBtn) {

        closeStudentModalBtn.addEventListener(
            "click",
            closeStudentModal
        );

    }


    /* CANCEL BUTTON */

    if (cancelStudentBtn) {

        cancelStudentBtn.addEventListener(
            "click",
            closeStudentModal
        );

    }


    /* CLICK OUTSIDE MODAL */

    if (studentModal) {

        studentModal.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    studentModal
                ) {

                    closeStudentModal();

                }

            }
        );

    }

}


/* =========================================================
   ROW BUTTONS
========================================================= */

function attachRowButtons() {


    /* EDIT BUTTONS */

    document
        .querySelectorAll(
            ".edit-student-btn"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        editStudent(
                            button.dataset.id
                        );

                    }
                );

            }
        );


    /* DELETE BUTTONS */

    document
        .querySelectorAll(
            ".delete-student-btn"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteStudent(
                            button.dataset.id
                        );

                    }
                );

            }
        );

}


/* =========================================================
   OPEN ADD MODAL
========================================================= */

function openAddStudentModal() {

    if (!studentForm) {
        return;
    }


    studentForm.reset();


    if (editingStudentId) {

        editingStudentId.value =
            "";

    }


    if (modalTitle) {

        modalTitle.textContent =
            "Add Student";

    }


    if (studentModal) {

        studentModal.style.display =
            "flex";

    }

}


/* =========================================================
   EDIT STUDENT
========================================================= */

async function editStudent(
    studentId
) {

    const student =
        students.find(
            (item) =>
                item.firestoreId ===
                studentId
        );


    if (!student) {

        Swal.fire(
            "Error",
            "Student record not found.",
            "error"
        );

        return;

    }


    if (editingStudentId) {

        editingStudentId.value =
            student.firestoreId;

    }


    setValue(
        "firstName",
        student.firstName
    );


    setValue(
        "lastName",
        student.lastName
    );


    setValue(
        "dateOfBirth",
        student.dateOfBirth
    );


    setValue(
        "gender",
        student.gender
    );


    setValue(
        "studentClass",
        student.studentClass
    );


    setValue(
        "admissionDate",
        student.admissionDate
    );


    setValue(
        "parentName",
        student.parentName
    );


    setValue(
        "parentPhone",
        student.parentPhone
    );


    setValue(
        "parentEmail",
        student.parentEmail
    );


    setValue(
        "studentStatus",
        student.status
    );


    setValue(
        "studentAddress",
        student.address
    );


    if (modalTitle) {

        modalTitle.textContent =
            "Edit Student";

    }


    if (studentModal) {

        studentModal.style.display =
            "flex";

    }

}


/* =========================================================
   SAVE STUDENT
========================================================= */

async function saveStudent(
    event
) {

    event.preventDefault();


    const firstName =
        getValue("firstName");


    const lastName =
        getValue("lastName");


    const dateOfBirth =
        getValue("dateOfBirth");


    const gender =
        getValue("gender");


    const studentClass =
        getValue("studentClass");


    const admissionDate =
        getValue("admissionDate");


    const parentName =
        getValue("parentName");


    const parentPhone =
        getValue("parentPhone");


    const parentEmail =
        getValue("parentEmail");


    const status =
        getValue("studentStatus");


    const address =
        getValue("studentAddress");


    /* =====================================================
       VALIDATION
    ===================================================== */

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

        Swal.fire({

            icon: "warning",

            title: "Incomplete Form",

            text:
                "Please complete all required student and parent information."

        });

        return;

    }


    /* =====================================================
       FIND CLASS DOCUMENT
    ===================================================== */

    const selectedClass =
        classes.find(
            (classItem) =>
                classItem.name ===
                studentClass
        );


    if (!selectedClass) {

        Swal.fire({

            icon: "error",

            title: "Class Not Found",

            text:
                "The selected class could not be found in Firestore."

        });

        return;

    }


    /* =====================================================
       STUDENT DATA
    ===================================================== */

    const studentData = {

        firstName,

        lastName,

        dateOfBirth,

        gender,

        studentClass,

        /*
         * Firestore class document ID.
         * Example: CLS-001
         */

        classId:
            selectedClass.firestoreId,

        admissionDate,

        parentName,

        parentPhone,

        parentEmail,

        status,

        address,

        updatedAt:
            serverTimestamp()

    };


    try {


        /* =================================================
           UPDATE EXISTING STUDENT
        ================================================= */

        if (
            editingStudentId &&
            editingStudentId.value
        ) {

            const studentRef =
                doc(
                    db,
                    "students",
                    editingStudentId.value
                );


            await updateDoc(
                studentRef,
                studentData
            );


            await Swal.fire({

                icon: "success",

                title: "Updated",

                text:
                    "Student updated successfully.",

                timer: 1500,

                showConfirmButton: false

            });

        }


        /* =================================================
           CREATE NEW STUDENT
        ================================================= */

        else {

            const studentId =
                await generateStudentId();


            await addDoc(
                studentsRef,
                {

                    id:
                        studentId,

                    ...studentData,

                    createdAt:
                        serverTimestamp()

                }
            );


            await Swal.fire({

                icon: "success",

                title: "Student Added",

                text:
                    "Student added successfully.",

                timer: 1500,

                showConfirmButton: false

            });

        }


        closeStudentModal();


        await loadStudents();


    } catch (error) {

        console.error(
            "Saving student failed:",
            error
        );


        Swal.fire({

            icon: "error",

            title: "Save Failed",

            text:
                error.message ||
                "Unable to save student."

        });

    }

}


/* =========================================================
   GENERATE STUDENT ADMISSION NUMBER
========================================================= */

async function generateStudentId() {

    const year =
        new Date()
            .getFullYear();


    let highestNumber = 0;


    students.forEach(
        (student) => {

            const id =
                String(
                    student.id || ""
                );


            const match =
                id.match(
                    new RegExp(
                        `STU-${year}-(\\d+)`
                    )
                );


            if (match) {

                const number =
                    parseInt(
                        match[1],
                        10
                    );


                if (
                    number >
                    highestNumber
                ) {

                    highestNumber =
                        number;

                }

            }

        }
    );


    const nextNumber =
        String(
            highestNumber + 1
        )
        .padStart(
            4,
            "0"
        );


    return `STU-${year}-${nextNumber}`;

}


/* =========================================================
   DELETE STUDENT
========================================================= */

async function deleteStudent(
    studentId
) {

    const student =
        students.find(
            (item) =>
                item.firestoreId ===
                studentId
        );


    if (!student) {
        return;
    }


    const result =
        await Swal.fire({

            icon: "warning",

            title:
                "Delete Student?",

            text:
                `${student.firstName || ""} ${student.lastName || ""} will be permanently deleted.`,

            showCancelButton:
                true,

            confirmButtonText:
                "Yes, Delete",

            cancelButtonText:
                "Cancel"

        });


    if (!result.isConfirmed) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "students",
                studentId
            )
        );


        await Swal.fire({

            icon: "success",

            title:
                "Deleted",

            text:
                "Student deleted successfully.",

            timer:
                1500,

            showConfirmButton:
                false

        });


        await loadStudents();


    } catch (error) {

        console.error(
            "Delete student error:",
            error
        );


        Swal.fire({

            icon: "error",

            title:
                "Delete Failed",

            text:
                error.message ||
                "Unable to delete student."

        });

    }

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeStudentModal() {

    if (!studentModal) {
        return;
    }


    studentModal.style.display =
        "none";

}


/* =========================================================
   GET VALUE
========================================================= */

function getValue(id) {

    const element =
        document.getElementById(id);


    return element
        ? element.value.trim()
        : "";

}


/* =========================================================
   SET VALUE
========================================================= */

function setValue(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.value =
            value || "";

    }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
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
   GLOBAL CLOSE FUNCTION
========================================================= */

window.closeStudentModal =
    closeStudentModal;