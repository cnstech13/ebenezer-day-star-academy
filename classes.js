import { adminReady, withTimeout } from "./admin-guard.js";
/* =========================================================
   Ebenezer Day Star Academy
   CLASS MANAGEMENT
   FIRESTORE VERSION
   SWEETALERT2 VERSION
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


// =========================================================
// GENERATE CLASS ID
// =========================================================

function generateClassId() {

    let number =
        classes.length + 1;

    let id =
        `CLS-${String(number).padStart(3, "0")}`;


    while (
        classes.some(
            item =>
                item.id === id
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
            await withTimeout(getDocs(
                teachersCollection
            ));


        teachers = [];


        snapshot.forEach(
            teacherDocument => {

                teachers.push({

                    firestoreId:
                        teacherDocument.id,

                    ...teacherDocument.data()

                });

            }
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

    if (!classTeacher)
        return;


    classTeacher.innerHTML = `

        <option value="">
            No Class Teacher
        </option>

    `;


    teachers.forEach(
        teacher => {

            const fullName =
                `${teacher.firstName || ""} ${teacher.lastName || ""}`
                    .trim();


            if (!fullName)
                return;


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
// LOAD CLASSES
// =========================================================

async function loadClasses() {

    try {

        const snapshot =
            await withTimeout(getDocs(
                classesCollection
            ));


        classes = [];


        snapshot.forEach(
            classDocument => {

                classes.push({

                    firestoreId:
                        classDocument.id,

                    ...classDocument.data()

                });

            }
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

    if (!classModal)
        return;


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
            classData.firestoreId;


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
            classData.status || "Active";

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

    if (!classModal || !classForm)
        return;


    classModal.classList.remove(
        "show"
    );


    classForm.reset();


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

}


// =========================================================
// OPEN MODAL BUTTON
// =========================================================

if (addClassBtn) {

    addClassBtn.addEventListener(
        "click",
        function() {

            openClassModal();

        }
    );

}


// =========================================================
// CLOSE BUTTONS
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
// CLOSE WHEN CLICKING OUTSIDE
// =========================================================

if (classModal) {

    classModal.addEventListener(
        "click",
        function(event) {

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
        async function(event) {

            event.preventDefault();


            const editingId =
                document.getElementById(
                    "editingClassId"
                ).value;


            const className =
                document.getElementById(
                    "className"
                ).value.trim();


            const section =
                document.getElementById(
                    "classSection"
                ).value;


            const teacherId =
                document.getElementById(
                    "classTeacher"
                ).value;


            const academicSession =
                document.getElementById(
                    "academicSession"
                ).value.trim();


            const maxStudents =
                Number(
                    document.getElementById(
                        "maxStudents"
                    ).value
                );


            const status =
                document.getElementById(
                    "classStatus"
                ).value;


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


            // =================================================
            // DUPLICATE CLASS CHECK
            // =================================================

            const duplicate =
                classes.some(
                    item =>

                        item.name
                            ?.toLowerCase() ===
                        className.toLowerCase() &&

                        item.academicSession ===
                        academicSession &&

                        item.firestoreId !==
                        editingId

                );


            if (duplicate) {

                await showWarning(
                    "Class Already Exists",
                    "This class already exists for the selected academic session."
                );

                return;

            }


            // =================================================
            // FIND TEACHER NAME
            // =================================================

            const teacher =
                teachers.find(
                    item =>

                        (
                            item.id ||
                            item.firestoreId
                        ) ===
                        teacherId

                );


            const teacherName =
                teacher
                    ? `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim()
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

                studentCount:
                    existingClass?.studentCount ||
                    0,

                updatedAt:
                    new Date().toISOString()

            };


            // =================================================
            // SAVE TO FIRESTORE
            // =================================================

            try {

                // =============================================
                // UPDATE
                // =============================================

                if (editingId) {

                    const classRef =
                        doc(
                            db,
                            "classes",
                            editingId
                        );


                    showLoading(
                        "Updating Class...",
                        "Please wait while the class information is being updated."
                    );


                    await withTimeout(setDoc(
                        classRef,
                        classData,
                        {
                            merge: true
                        }
                    ));


                    Swal.close();


                    await showSuccess(
                        "Class Updated",
                        "Class information has been updated successfully."
                    );

                }

                // =============================================
                // ADD
                // =============================================

                else {

                    const classId =
                        classData.id;


                    const classRef =
                        doc(
                            db,
                            "classes",
                            classId
                        );


                    showLoading(
                        "Adding Class...",
                        "Please wait while the class is being added."
                    );


                    await withTimeout(setDoc(
                        classRef,
                        {

                            ...classData,

                            createdAt:
                                new Date().toISOString()

                        }
                    ));


                    Swal.close();


                    await showSuccess(
                        "Class Added",
                        "Class has been added successfully."
                    );

                }


                // =============================================
                // REFRESH
                // =============================================

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

    if (
        !classesTableBody
    )
        return;


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
                    ).toLowerCase();


                const className =
                    String(
                        classData.name || ""
                    ).toLowerCase();


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


    classesTableBody.innerHTML =
        "";


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


    filtered.forEach(
        classData => {

            const row =
                document.createElement(
                    "tr"
                );


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

                    ${escapeHTML(
                        classData.studentCount ||
                        0
                    )}

                    /

                    ${escapeHTML(
                        classData.maxStudents ||
                        0
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
                            class="table-action"
                            title="Edit"
                            data-edit-class="${escapeAttribute(
                                classData.firestoreId
                            )}"
                        >
                            ✏️
                        </button>


                        <button
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


    // =====================================================
    // CONFIRM DELETE
    // =====================================================

    const confirmed =
        await confirmDelete(
            `Delete ${classData.name}?`,
            "This class record will be permanently deleted."
        );


    if (!confirmed)
        return;


    try {

        // =================================================
        // LOADING
        // =================================================

        showLoading(
            "Deleting Class...",
            "Please wait while the class is being deleted."
        );


        // =================================================
        // DELETE
        // =================================================

        await withTimeout(deleteDoc(

            doc(
                db,
                "classes",
                firestoreId
            )

        ));


        Swal.close();


        // =================================================
        // SUCCESS
        // =================================================

        await showSuccess(
            "Class Deleted",
            `${classData.name} has been deleted successfully.`
        );


        // =================================================
        // REFRESH
        // =================================================

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


// =========================================================
// ATTRIBUTE ESCAPE
// =========================================================

function escapeAttribute(
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

        default:

            return error.message ||
                "An unexpected error occurred.";

    }

}


// =========================================================
// INITIALIZE
// =========================================================

async function initializeClassesPage() {

    await loadTeachers();

    await loadClasses();

}


initializeClassesPage();