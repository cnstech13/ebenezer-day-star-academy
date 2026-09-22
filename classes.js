import { adminReady, withTimeout } from "./admin-guard.js";

/* =========================================================
   EBENEZER DAY STAR ACADEMY
   CLASS MANAGEMENT
   FIRESTORE VERSION
   SWEETALERT2 VERSION

   FEATURES:
   - Add class
   - Edit class
   - Delete class
   - Search classes
   - Filter by section
   - Assign class teacher
   - Prevent duplicate classes
   - Show actual student enrollment
   - Display Students as: 2 / 40
========================================================= */

await adminReady;

import {
    collection,
    getDocs,
    doc,
    setDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import { db } from "./firebase-config.js";


// =========================================================
// DATA
// =========================================================

let classes = [];
let teachers = [];
let students = [];


// =========================================================
// ELEMENTS
// =========================================================

const classModal =
    document.getElementById("classModal");

const classForm =
    document.getElementById("classForm");

const classesTableBody =
    document.getElementById("classesTableBody");

const emptyClasses =
    document.getElementById("emptyClasses");

const classSearch =
    document.getElementById("classSearch");

const sectionFilter =
    document.getElementById("sectionFilter");

const addClassBtn =
    document.getElementById("addClassBtn");

const closeClassModal =
    document.getElementById("closeClassModal");

const cancelClassBtn =
    document.getElementById("cancelClassBtn");

const classTeacher =
    document.getElementById("classTeacher");


// =========================================================
// FIRESTORE COLLECTIONS
// =========================================================

const classesCollection =
    collection(db, "classes");

const teachersCollection =
    collection(db, "teachers");

const studentsCollection =
    collection(db, "students");


// =========================================================
// NORMALIZE TEXT
// =========================================================

function normalizeText(value) {

    return String(value ?? "")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();

}


// =========================================================
// GENERATE CLASS ID
// =========================================================

function generateClassId() {

    let number = 1;

    let id =
        `CLS-${String(number).padStart(3, "0")}`;


    while (
        classes.some(
            item =>
                String(item.id || "")
                    .toUpperCase() ===
                id
        )
    ) {

        number++;

        id =
            `CLS-${String(number).padStart(3, "0")}`;

    }


    return id;

}


// =========================================================
// LOAD TEACHERS
// =========================================================

async function loadTeachers() {

    try {

        const snapshot =
            await withTimeout(
                getDocs(
                    teachersCollection
                )
            );


        const uniqueTeachers =
            new Map();


        snapshot.forEach(
            teacherDocument => {

                const data =
                    teacherDocument.data();


                const firestoreId =
                    teacherDocument.id;


                const fullName =
                    `${data.firstName || ""} ${data.lastName || ""}`
                        .trim();


                if (!fullName) {
                    return;
                }


                if (
                    uniqueTeachers.has(
                        firestoreId
                    )
                ) {

                    return;

                }


                uniqueTeachers.set(
                    firestoreId,
                    {
                        firestoreId,
                        ...data
                    }
                );

            }
        );


        teachers =
            Array.from(
                uniqueTeachers.values()
            );


        populateTeacherDropdown();

    }

    catch (error) {

        console.error(
            "Error loading teachers:",
            error
        );


        await showError(
            "Unable to Load Teachers",
            getFirebaseErrorMessage(error)
        );

    }

}


// =========================================================
// POPULATE TEACHER DROPDOWN
// =========================================================

function populateTeacherDropdown() {

    if (!classTeacher) {
        return;
    }


    classTeacher.innerHTML = "";


    const defaultOption =
        document.createElement("option");


    defaultOption.value = "";


    defaultOption.textContent =
        "No Class Teacher";


    classTeacher.appendChild(
        defaultOption
    );


    const addedTeachers =
        new Set();


    teachers.forEach(
        teacher => {

            const fullName =
                `${teacher.firstName || ""} ${teacher.lastName || ""}`
                    .trim();


            if (!fullName) {
                return;
            }


            const teacherKey =
                normalizeText(fullName);


            if (
                addedTeachers.has(
                    teacherKey
                )
            ) {

                return;

            }


            addedTeachers.add(
                teacherKey
            );


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                teacher.id ||
                teacher.firestoreId;


            option.textContent =
                fullName;


            classTeacher.appendChild(
                option
            );

        }
    );

}


// =========================================================
// LOAD STUDENTS
// =========================================================

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
            studentDocument => {

                const data =
                    studentDocument.data();


                students.push({
                    firestoreId:
                        studentDocument.id,

                    ...data
                });

            }
        );


        console.log(
            "Students loaded:",
            students.length
        );

    }

    catch (error) {

        console.error(
            "Error loading students:",
            error
        );


        students = [];


        await showError(
            "Unable to Load Students",
            getFirebaseErrorMessage(error)
        );

    }

}


// =========================================================
// GET STUDENT COUNT FOR A CLASS
// =========================================================

function getStudentCountForClass(
    className
) {

    const normalizedClassName =
        normalizeText(
            className
        );


    return students.filter(
        student => {

            const studentClass =
                normalizeText(
                    student.studentClass
                );


            return (
                studentClass ===
                normalizedClassName
            );

        }
    ).length;

}


// =========================================================
// LOAD CLASSES
// PREVENT DUPLICATE CLASS RECORDS
// =========================================================

async function loadClasses() {

    try {

        const snapshot =
            await withTimeout(
                getDocs(
                    classesCollection
                )
            );


        const uniqueClasses =
            new Map();


        snapshot.forEach(
            classDocument => {

                const data =
                    classDocument.data();


                const className =
                    String(
                        data.name || ""
                    )
                    .trim()
                    .replace(
                        /\s+/g,
                        " "
                    );


                const academicSession =
                    String(
                        data.academicSession ||
                        "2026/2027"
                    )
                    .trim()
                    .replace(
                        /\s+/g,
                        " "
                    );


                if (!className) {
                    return;
                }


                const uniqueKey =
                    `${normalizeText(className)}__${normalizeText(academicSession)}`;


                if (
                    uniqueClasses.has(
                        uniqueKey
                    )
                ) {

                    return;

                }


                /*
                 * Calculate the REAL number
                 * of students currently in
                 * this class.
                 */

                const actualStudentCount =
                    getStudentCountForClass(
                        className
                    );


                uniqueClasses.set(
                    uniqueKey,
                    {
                        firestoreId:
                            classDocument.id,

                        ...data,

                        name:
                            className,

                        academicSession:
                            academicSession,

                        studentCount:
                            actualStudentCount,

                        maxStudents:
                            Number(
                                data.maxStudents
                            ) || 40

                    }
                );

            }
        );


        classes =
            Array.from(
                uniqueClasses.values()
            );


        renderClasses();

    }

    catch (error) {

        console.error(
            "Error loading classes:",
            error
        );


        await showError(
            "Unable to Load Classes",
            getFirebaseErrorMessage(error)
        );

    }

}


// =========================================================
// OPEN CLASS MODAL
// =========================================================

function openClassModal(
    classData = null
) {

    if (!classModal) {
        return;
    }


    classModal.classList.add(
        "show"
    );


    if (classData) {

        document.getElementById(
            "classModalTitle"
        ).textContent =
            "Edit Class";


        document.getElementById(
            "editingClassId"
        ).value =
            classData.firestoreId || "";


        document.getElementById(
            "className"
        ).value =
            classData.name || "";


        document.getElementById(
            "classSection"
        ).value =
            classData.section || "";


        document.getElementById(
            "classTeacher"
        ).value =
            classData.teacherId || "";


        document.getElementById(
            "academicSession"
        ).value =
            classData.academicSession ||
            "2026/2027";


        document.getElementById(
            "maxStudents"
        ).value =
            classData.maxStudents || 40;


        document.getElementById(
            "classStatus"
        ).value =
            classData.status ||
            "Active";

    }

    else {

        classForm.reset();


        document.getElementById(
            "classModalTitle"
        ).textContent =
            "Add Class";


        document.getElementById(
            "editingClassId"
        ).value =
            "";


        document.getElementById(
            "academicSession"
        ).value =
            "2026/2027";


        document.getElementById(
            "maxStudents"
        ).value =
            40;


        document.getElementById(
            "classStatus"
        ).value =
            "Active";


        document.getElementById(
            "classTeacher"
        ).value =
            "";

    }

}


// =========================================================
// CLOSE CLASS MODAL
// =========================================================

function closeClassModalFunction() {

    if (
        !classModal ||
        !classForm
    ) {

        return;

    }


    classModal.classList.remove(
        "show"
    );


    classForm.reset();


    const academicSession =
        document.getElementById(
            "academicSession"
        );


    const maxStudents =
        document.getElementById(
            "maxStudents"
        );


    const classStatus =
        document.getElementById(
            "classStatus"
        );


    if (academicSession) {

        academicSession.value =
            "2026/2027";

    }


    if (maxStudents) {

        maxStudents.value =
            40;

    }


    if (classStatus) {

        classStatus.value =
            "Active";

    }

}


// =========================================================
// OPEN MODAL
// =========================================================

if (addClassBtn) {

    addClassBtn.addEventListener(
        "click",
        () => {

            openClassModal();

        }
    );

}


// =========================================================
// CLOSE MODAL
// =========================================================

if (closeClassModal) {

    closeClassModal.addEventListener(
        "click",
        closeClassModalFunction
    );

}


if (cancelClassBtn) {

    cancelClassBtn.addEventListener(
        "click",
        closeClassModalFunction
    );

}


// =========================================================
// CLOSE OUTSIDE MODAL
// =========================================================

if (classModal) {

    classModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                classModal
            ) {

                closeClassModalFunction();

            }

        }
    );

}


// =========================================================
// SAVE CLASS
// =========================================================

if (classForm) {

    classForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const editingId =
                document.getElementById(
                    "editingClassId"
                )?.value || "";


            const className =
                document.getElementById(
                    "className"
                )?.value
                .trim()
                .replace(
                    /\s+/g,
                    " "
                ) || "";


            const section =
                document.getElementById(
                    "classSection"
                )?.value || "";


            const teacherId =
                document.getElementById(
                    "classTeacher"
                )?.value || "";


            const academicSession =
                document.getElementById(
                    "academicSession"
                )?.value
                .trim()
                .replace(
                    /\s+/g,
                    " "
                ) || "";


            const maxStudents =
                Number(
                    document.getElementById(
                        "maxStudents"
                    )?.value
                );


            const status =
                document.getElementById(
                    "classStatus"
                )?.value || "Active";


            // =================================================
            // VALIDATION
            // =================================================

            if (
                !className ||
                !section ||
                !academicSession ||
                !maxStudents
            ) {

                await showWarning(
                    "Incomplete Form",
                    "Please complete all required fields."
                );

                return;

            }


            if (
                maxStudents < 1
            ) {

                await showWarning(
                    "Invalid Capacity",
                    "Maximum students must be at least 1."
                );

                return;

            }


            // =================================================
            // DUPLICATE CLASS CHECK
            // =================================================

            const newClassName =
                normalizeText(
                    className
                );


            const newSession =
                normalizeText(
                    academicSession
                );


            const duplicate =
                classes.some(
                    item => {

                        const existingName =
                            normalizeText(
                                item.name
                            );


                        const existingSession =
                            normalizeText(
                                item.academicSession
                            );


                        return (

                            existingName ===
                            newClassName &&

                            existingSession ===
                            newSession &&

                            item.firestoreId !==
                            editingId

                        );

                    }
                );


            if (duplicate) {

                await showWarning(
                    "Class Already Exists",
                    `${className} already exists for ${academicSession}.`
                );

                return;

            }


            // =================================================
            // FIND TEACHER
            // =================================================

            const teacher =
                teachers.find(
                    item => {

                        return (

                            (
                                item.id ||
                                item.firestoreId
                            ) ===
                            teacherId

                        );

                    }
                );


            const teacherName =
                teacher
                    ? `${teacher.firstName || ""} ${teacher.lastName || ""}`
                        .trim()
                    : "No Class Teacher";


            // =================================================
            // EXISTING CLASS
            // =================================================

            const existingClass =
                editingId
                    ? classes.find(
                        item =>
                            item.firestoreId ===
                            editingId
                    )
                    : null;


            // =================================================
            // CLASS DATA
            // =================================================

            const classData = {

                id:
                    existingClass?.id ||
                    generateClassId(),

                name:
                    className,

                section:
                    section,

                teacherId:
                    teacherId,

                teacherName:
                    teacherName,

                academicSession:
                    academicSession,

                maxStudents:
                    maxStudents,

                status:
                    status,

                /*
                 * Keep the existing field,
                 * but the displayed count is
                 * always calculated from students.
                 */

                studentCount:
                    existingClass?.studentCount ||
                    0,

                updatedAt:
                    new Date().toISOString()

            };


            // =================================================
            // SAVE
            // =================================================

            try {

                showLoading(
                    editingId
                        ? "Updating Class..."
                        : "Adding Class...",

                    editingId
                        ? "Please wait while the class information is being updated."
                        : "Please wait while the class is being added."
                );


                // =================================================
                // UPDATE
                // =================================================

                if (editingId) {

                    const classRef =
                        doc(
                            db,
                            "classes",
                            editingId
                        );


                    await withTimeout(
                        setDoc(
                            classRef,
                            classData,
                            {
                                merge: true
                            }
                        )
                    );


                    Swal.close();


                    await showSuccess(
                        "Class Updated",
                        "Class information has been updated successfully."
                    );

                }


                // =================================================
                // ADD
                // =================================================

                else {

                    const classId =
                        classData.id;


                    const classRef =
                        doc(
                            db,
                            "classes",
                            classId
                        );


                    await withTimeout(
                        setDoc(
                            classRef,
                            {
                                ...classData,

                                createdAt:
                                    new Date().toISOString()
                            }
                        )
                    );


                    Swal.close();


                    await showSuccess(
                        "Class Added",
                        "Class has been added successfully."
                    );

                }


                await loadClasses();

                closeClassModalFunction();

            }

            catch (error) {

                console.error(
                    "Error saving class:",
                    error
                );


                Swal.close();


                if (
                    error.code ===
                    "permission-denied"
                ) {

                    await showError(
                        "Permission Denied",
                        "You do not have permission to save this class. Please check your Firestore security rules."
                    );

                }

                else {

                    await showError(
                        "Unable to Save Class",
                        getFirebaseErrorMessage(error)
                    );

                }

            }

        }
    );

}


// =========================================================
// RENDER CLASSES
// =========================================================

function renderClasses() {

    if (!classesTableBody) {
        return;
    }


    const search =
        classSearch
            ? classSearch.value
                .trim()
                .toLowerCase()
            : "";


    const selectedSection =
        sectionFilter
            ? sectionFilter.value
            : "";


    const filtered =
        classes.filter(
            classData => {

                const classId =
                    String(
                        classData.id || ""
                    )
                    .toLowerCase();


                const className =
                    String(
                        classData.name || ""
                    )
                    .toLowerCase();


                const matchesSearch =
                    !search ||

                    classId.includes(
                        search
                    ) ||

                    className.includes(
                        search
                    );


                const matchesSection =
                    !selectedSection ||

                    classData.section ===
                    selectedSection;


                return (
                    matchesSearch &&
                    matchesSection
                );

            }
        );


    // =====================================================
    // CLEAR TABLE
    // =====================================================

    classesTableBody.innerHTML =
        "";


    // =====================================================
    // EMPTY STATE
    // =====================================================

    if (
        filtered.length === 0
    ) {

        if (emptyClasses) {

            emptyClasses.style.display =
                "block";

        }

        return;

    }


    if (emptyClasses) {

        emptyClasses.style.display =
            "none";

    }


    // =====================================================
    // RENDER TABLE
    // =====================================================

    filtered.forEach(
        classData => {

            const row =
                document.createElement(
                    "tr"
                );


            /*
             * Calculate the count again
             * immediately before displaying.
             *
             * This guarantees that the
             * Students column shows the
             * current number.
             */

            const currentStudentCount =
                getStudentCountForClass(
                    classData.name
                );


            const maximumStudents =
                Number(
                    classData.maxStudents
                ) || 40;


            row.innerHTML = `

                <td>

                    <span class="student-id">

                        ${escapeHTML(
                            classData.id
                        )}

                    </span>

                </td>


                <td>

                    <strong>

                        ${escapeHTML(
                            classData.name
                        )}

                    </strong>

                </td>


                <td>

                    ${escapeHTML(
                        classData.section
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        classData.teacherName ||
                        "No Class Teacher"
                    )}

                </td>


                <td>

                    <strong>
                        ${escapeHTML(
                            currentStudentCount
                        )}
                    </strong>

                    /

                    ${escapeHTML(
                        maximumStudents
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        classData.academicSession
                    )}

                </td>


                <td>

                    <span class="
                        status-badge
                        ${
                            classData.status ===
                            "Active"

                                ? "status-active"

                                : "status-inactive"
                        }
                    ">

                        ${escapeHTML(
                            classData.status
                        )}

                    </span>

                </td>


                <td>

                    <div class="table-actions">

                        <button
                            type="button"
                            class="table-action"
                            title="Edit"
                            data-edit-class="${escapeAttribute(
                                classData.firestoreId
                            )}"
                        >
                            ✏️
                        </button>


                        <button
                            type="button"
                            class="table-action"
                            title="Delete"
                            data-delete-class="${escapeAttribute(
                                classData.firestoreId
                            )}"
                        >
                            🗑️
                        </button>

                    </div>

                </td>

            `;


            classesTableBody.appendChild(
                row
            );

        }
    );


    // =====================================================
    // EDIT BUTTONS
    // =====================================================

    classesTableBody
        .querySelectorAll(
            "[data-edit-class]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function() {

                        editClass(
                            this.dataset.editClass
                        );

                    }
                );

            }
        );


    // =====================================================
    // DELETE BUTTONS
    // =====================================================

    classesTableBody
        .querySelectorAll(
            "[data-delete-class]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async function() {

                        await deleteClass(
                            this.dataset.deleteClass
                        );

                    }
                );

            }
        );

}


// =========================================================
// EDIT CLASS
// =========================================================

function editClass(
    firestoreId
) {

    const classData =
        classes.find(
            item =>
                item.firestoreId ===
                firestoreId
        );


    if (!classData) {

        showError(
            "Class Not Found",
            "The selected class could not be found."
        );

        return;

    }


    openClassModal(
        classData
    );

}


// =========================================================
// DELETE CLASS
// =========================================================

async function deleteClass(
    firestoreId
) {

    const classData =
        classes.find(
            item =>
                item.firestoreId ===
                firestoreId
        );


    if (!classData) {

        await showError(
            "Class Not Found",
            "The selected class could not be found."
        );

        return;

    }


    const confirmed =
        await confirmDelete(
            `Delete ${classData.name}?`,
            "This class record will be permanently deleted."
        );


    if (!confirmed) {
        return;
    }


    try {

        showLoading(
            "Deleting Class...",
            "Please wait while the class is being deleted."
        );


        await withTimeout(
            deleteDoc(
                doc(
                    db,
                    "classes",
                    firestoreId
                )
            )
        );


        Swal.close();


        await showSuccess(
            "Class Deleted",
            `${classData.name} has been deleted successfully.`
        );


        await loadClasses();

    }

    catch (error) {

        console.error(
            "Error deleting class:",
            error
        );


        Swal.close();


        if (
            error.code ===
            "permission-denied"
        ) {

            await showError(
                "Permission Denied",
                "You do not have permission to delete this class."
            );

        }

        else {

            await showError(
                "Unable to Delete Class",
                getFirebaseErrorMessage(error)
            );

        }

    }

}


// =========================================================
// SEARCH
// =========================================================

if (classSearch) {

    classSearch.addEventListener(
        "input",
        renderClasses
    );

}


// =========================================================
// SECTION FILTER
// =========================================================

if (sectionFilter) {

    sectionFilter.addEventListener(
        "change",
        renderClasses
    );

}


// =========================================================
// HTML ESCAPE
// =========================================================

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


// =========================================================
// ATTRIBUTE ESCAPE
// =========================================================

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


// =========================================================
// FIREBASE ERROR MESSAGE
// =========================================================

function getFirebaseErrorMessage(
    error
) {

    if (!error) {

        return "An unknown error occurred.";

    }


    switch (
        error.code
    ) {

        case "permission-denied":

            return "You do not have permission to perform this action. Please check your Firestore security rules.";


        case "unavailable":

            return "Firebase is temporarily unavailable. Please check your internet connection and try again.";


        case "network-request-failed":

            return "Network error. Please check your internet connection and try again.";


        case "failed-precondition":

            return "The requested operation could not be completed because a Firestore requirement is not satisfied.";


        case "deadline-exceeded":

            return "The Firebase request took too long. Please check your internet connection and try again.";


        default:

            return error.message ||
                "An unexpected error occurred.";

    }

}


// =========================================================
// INITIALIZE
// =========================================================

async function initializeClassesPage() {

    try {

        /*
         * IMPORTANT:
         *
         * Students must be loaded BEFORE
         * classes are rendered because the
         * student count comes from the
         * students collection.
         */

        await loadTeachers();

        await loadStudents();

        await loadClasses();

    }

    catch (error) {

        console.error(
            "Error initializing classes page:",
            error
        );

    }

}


initializeClassesPage();