/* =========================================================
   STUDENTS MANAGEMENT
   EBENEZER DAY STAR ACADEMY
   Firebase Firestore Version
========================================================= */

import {
    collection,
    addDoc,
    getDocs,
    getDoc,
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

const studentSearch = document.getElementById("studentSearch");
const classFilter = document.getElementById("classFilter");

const addStudentBtn = document.getElementById("addStudentBtn");

const studentModal = document.getElementById("studentModal");
const studentForm = document.getElementById("studentForm");

const editingStudentId =
    document.getElementById("editingStudentId");

const studentsTableBody =
    document.getElementById("studentsTableBody");

const emptyStudents =
    document.getElementById("emptyStudents");


/* =========================================================
   COLLECTIONS
========================================================= */

const studentsRef = collection(db, "students");
const classesRef = collection(db, "classes");


/* =========================================================
   DATA
========================================================= */

let students = [];
let classes = [];


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    try {

        await loadClasses();

        await loadStudents();

        setupEvents();

    } catch (error) {

        console.error("Students page error:", error);

        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message || "Unable to load students."
        });

    }

});


/* =========================================================
   LOAD CLASSES
========================================================= */

async function loadClasses() {

    const snapshot = await getDocs(classesRef);

    const classMap = new Map();

    snapshot.forEach((docSnap) => {

        const data = docSnap.data();

        const className =
            String(data.name || "").trim();

        if (!className) return;

        const normalized =
            className.toLowerCase();

        if (!classMap.has(normalized)) {

            classMap.set(normalized, {

                firestoreId: docSnap.id,

                ...data,

                name: className

            });

        }

    });

    classes = Array.from(classMap.values());

    classes.sort((a, b) =>
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
        document.getElementById("studentClass");

    if (!select) return;


    select.innerHTML = `
        <option value="">Select Class</option>
    `;


    classes.forEach((classItem) => {

        const option =
            document.createElement("option");

        option.value = classItem.name;

        option.textContent = classItem.name;

        option.dataset.classId =
            classItem.firestoreId;

        select.appendChild(option);

    });

}


/* =========================================================
   POPULATE CLASS FILTER
========================================================= */

function populateClassFilter() {

    if (!classFilter) return;


    classFilter.innerHTML = `
        <option value="">All Classes</option>
    `;


    classes.forEach((classItem) => {

        const option =
            document.createElement("option");

        option.value = classItem.name;

        option.textContent = classItem.name;

        classFilter.appendChild(option);

    });

}


/* =========================================================
   LOAD STUDENTS
========================================================= */

async function loadStudents() {

    const snapshot =
        await getDocs(studentsRef);

    students = [];

    snapshot.forEach((docSnap) => {

        students.push({

            firestoreId: docSnap.id,

            ...docSnap.data()

        });

    });


    students.sort((a, b) => {

        const nameA =
            `${a.firstName || ""} ${a.lastName || ""}`
                .trim()
                .toLowerCase();

        const nameB =
            `${b.firstName || ""} ${b.lastName || ""}`
                .trim()
                .toLowerCase();

        return nameA.localeCompare(nameB);

    });


    renderStudents();

}


/* =========================================================
   RENDER STUDENTS
========================================================= */

function renderStudents() {

    if (!studentsTableBody) return;


    const search =
        (studentSearch?.value || "")
            .trim()
            .toLowerCase();

    const selectedClass =
        classFilter?.value || "";


    const filtered =
        students.filter((student) => {

            const fullName =
                `${student.firstName || ""} ${student.lastName || ""}`
                    .trim()
                    .toLowerCase();

            const matchesSearch =
                !search ||
                fullName.includes(search) ||
                String(student.parentName || "")
                    .toLowerCase()
                    .includes(search) ||
                String(student.parentPhone || "")
                    .toLowerCase()
                    .includes(search);


            const matchesClass =
                !selectedClass ||
                student.studentClass === selectedClass;


            return matchesSearch && matchesClass;

        });


    studentsTableBody.innerHTML = "";


    if (filtered.length === 0) {

        if (emptyStudents) {
            emptyStudents.style.display = "block";
        }

        return;

    }


    if (emptyStudents) {
        emptyStudents.style.display = "none";
    }


    filtered.forEach((student) => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHTML(student.id || "-")}
            </td>

            <td>
                <strong>
                    ${escapeHTML(student.firstName || "")}
                    ${escapeHTML(student.lastName || "")}
                </strong>
            </td>

            <td>
                ${escapeHTML(student.gender || "-")}
            </td>

            <td>
                ${escapeHTML(student.studentClass || "-")}
            </td>

            <td>
                ${escapeHTML(student.parentName || "-")}
            </td>

            <td>
                ${escapeHTML(student.parentPhone || "-")}
            </td>

            <td>
                <span class="status-badge ${
                    String(student.status || "")
                        .toLowerCase() === "active"
                        ? "active"
                        : "inactive"
                }">
                    ${escapeHTML(student.status || "-")}
                </span>
            </td>

            <td>

                <button
                    type="button"
                    class="edit-student-btn"
                    data-id="${student.firestoreId}"
                >
                    Edit
                </button>

                <button
                    type="button"
                    class="delete-student-btn"
                    data-id="${student.firestoreId}"
                >
                    Delete
                </button>

            </td>

        `;


        studentsTableBody.appendChild(row);

    });


    attachRowButtons();

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

    if (addStudentBtn) {

        addStudentBtn.addEventListener(
            "click",
            openAddStudentModal
        );

    }


    if (studentSearch) {

        studentSearch.addEventListener(
            "input",
            renderStudents
        );

    }


    if (classFilter) {

        classFilter.addEventListener(
            "change",
            renderStudents
        );

    }


    if (studentForm) {

        studentForm.addEventListener(
            "submit",
            saveStudent
        );

    }


    document.addEventListener(
        "click",
        (event) => {

            if (
                event.target === studentModal
            ) {

                closeStudentModal();

            }

        }
    );

}


/* =========================================================
   ROW BUTTONS
========================================================= */

function attachRowButtons() {

    document
        .querySelectorAll(".edit-student-btn")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    editStudent(
                        button.dataset.id
                    );

                }
            );

        });


    document
        .querySelectorAll(".delete-student-btn")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    deleteStudent(
                        button.dataset.id
                    );

                }
            );

        });

}


/* =========================================================
   OPEN ADD MODAL
========================================================= */

function openAddStudentModal() {

    if (!studentForm) return;

    studentForm.reset();


    if (editingStudentId) {
        editingStudentId.value = "";
    }


    const title =
        studentModal?.querySelector(
            ".modal-title"
        );

    if (title) {
        title.textContent = "Add Student";
    }


    if (studentModal) {

        studentModal.style.display = "flex";

    }

}


/* =========================================================
   EDIT STUDENT
========================================================= */

async function editStudent(studentId) {

    const student =
        students.find(
            (item) =>
                item.firestoreId === studentId
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


    const title =
        studentModal?.querySelector(
            ".modal-title"
        );

    if (title) {
        title.textContent = "Edit Student";
    }


    if (studentModal) {
        studentModal.style.display = "flex";
    }

}


/* =========================================================
   SAVE STUDENT
========================================================= */

async function saveStudent(event) {

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


    if (
        !firstName ||
        !lastName ||
        !studentClass
    ) {

        Swal.fire({
            icon: "warning",
            title: "Incomplete Form",
            text:
                "Please enter the student's name and select a class."
        });

        return;

    }


    /* =====================================================
       FIND CLASS DOCUMENT
    ===================================================== */

    const selectedClass =
        classes.find(
            (classItem) =>
                classItem.name === studentClass
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
         * IMPORTANT
         * This is the Firestore class document ID.
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

        if (
            editingStudentId &&
            editingStudentId.value
        ) {

            /* =================================================
               UPDATE EXISTING STUDENT
            ================================================= */

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


            Swal.fire({
                icon: "success",
                title: "Updated",
                text: "Student updated successfully.",
                timer: 1500,
                showConfirmButton: false
            });

        } else {

            /* =================================================
               CREATE NEW STUDENT
            ================================================= */

            const studentId =
                await generateStudentId();


            await addDoc(
                studentsRef,
                {

                    id: studentId,

                    ...studentData,

                    createdAt:
                        serverTimestamp()

                }
            );


            Swal.fire({
                icon: "success",
                title: "Student Added",
                text: "Student added successfully.",
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
   GENERATE STUDENT ID
========================================================= */

async function generateStudentId() {

    const year =
        new Date().getFullYear();


    let highestNumber = 0;


    students.forEach((student) => {

        const id =
            String(student.id || "");


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

                highestNumber = number;

            }

        }

    });


    const nextNumber =
        String(
            highestNumber + 1
        ).padStart(
            4,
            "0"
        );


    return `STU-${year}-${nextNumber}`;

}


/* =========================================================
   DELETE STUDENT
========================================================= */

async function deleteStudent(studentId) {

    const student =
        students.find(
            (item) =>
                item.firestoreId === studentId
        );


    if (!student) return;


    const result =
        await Swal.fire({

            icon: "warning",

            title: "Delete Student?",

            text:
                `${student.firstName || ""} ${student.lastName || ""} will be permanently deleted.`,

            showCancelButton: true,

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


        Swal.fire({
            icon: "success",
            title: "Deleted",
            text: "Student deleted successfully.",
            timer: 1500,
            showConfirmButton: false
        });


        await loadStudents();


    } catch (error) {

        console.error(
            "Delete student error:",
            error
        );


        Swal.fire({
            icon: "error",
            title: "Delete Failed",
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

    if (!studentModal) return;

    studentModal.style.display = "none";

}


/* =========================================================
   HELPERS
========================================================= */

function getValue(id) {

    const element =
        document.getElementById(id);

    return element
        ? element.value.trim()
        : "";

}


function setValue(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.value =
            value || "";

    }

}


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


/* =========================================================
   GLOBAL CLOSE FUNCTION
========================================================= */

window.closeStudentModal =
    closeStudentModal;