/* =========================================================
   EBENEZER DAY STAR ACADEMY
   TEACHER MANAGEMENT
   ADMIN PORTAL

   TEACHER ACCOUNT SYSTEM - OPTION 2

   IMPORTANT:
   Admin creates the teacher's staff record.

   Teacher creates their own Firebase Authentication
   account later using the email registered by Admin.

   The Admin NEVER creates or stores the teacher password.
========================================================= */


import {
    collection,
    getDocs,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";


import { db } from "./firebase-config.js";


import { adminReady } from "./admin-guard.js";


/* =========================================================
   ADMIN PROTECTION
========================================================= */

await adminReady;


/* =========================================================
   STATE
========================================================= */

let allClasses = [];

let allTeachers = [];

let editingTeacherId = null;


/* =========================================================
   DOM ELEMENTS
========================================================= */

const teacherForm =
    document.getElementById("teacherForm");


const teacherName =
    document.getElementById("teacherName");


const teacherEmail =
    document.getElementById("teacherEmail");


const teacherPhone =
    document.getElementById("teacherPhone");


const teacherSubject =
    document.getElementById("teacherSubject");


const teacherStatus =
    document.getElementById("teacherStatus");


const classesContainer =
    document.getElementById("classesContainer");


const teachersTableBody =
    document.getElementById("teachersTableBody");


const saveTeacherBtn =
    document.getElementById("saveTeacherBtn");


const cancelEditBtn =
    document.getElementById("cancelEditBtn");


const resetBtn =
    document.getElementById("resetBtn");


const formTitle =
    document.getElementById("formTitle");


const editingBanner =
    document.getElementById("editingBanner");


const teacherCount =
    document.getElementById("teacherCount");


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   NORMALIZE EMAIL
========================================================= */

function normalizeEmail(email) {

    return String(email || "")
        .trim()
        .toLowerCase();

}


/* =========================================================
   LOAD CLASSES
========================================================= */

async function loadClasses() {

    const snapshot =
        await getDocs(
            collection(db, "classes")
        );


    allClasses = [];


    snapshot.forEach(
        documentSnapshot => {

            allClasses.push({

                id:
                    documentSnapshot.id,

                ...documentSnapshot.data()

            });

        }
    );


    /*
     * Remove duplicate classes that may have the
     * same displayed name.
     */

    const uniqueClasses = [];

    const seenNames = new Set();


    allClasses.forEach(classItem => {

        const className =
            String(
                classItem.name ||
                classItem.className ||
                classItem.title ||
                classItem.id ||
                ""
            )
            .trim()
            .toLowerCase();


        if (!seenNames.has(className)) {

            seenNames.add(className);

            uniqueClasses.push(classItem);

        }

    });


    allClasses =
        uniqueClasses;


    allClasses.sort(
        (a, b) => {

            const nameA =
                String(
                    a.name ||
                    a.className ||
                    a.title ||
                    a.id ||
                    ""
                ).toLowerCase();


            const nameB =
                String(
                    b.name ||
                    b.className ||
                    b.title ||
                    b.id ||
                    ""
                ).toLowerCase();


            return nameA.localeCompare(nameB);

        }
    );


    renderClassCheckboxes();

}


/* =========================================================
   RENDER CLASS CHECKBOXES
========================================================= */

function renderClassCheckboxes(
    selectedIds = []
) {

    if (!classesContainer) {
        return;
    }


    if (allClasses.length === 0) {

        classesContainer.innerHTML = `
            <p class="empty-message">
                No classes have been created yet.
            </p>
        `;

        return;

    }


    classesContainer.innerHTML =
        allClasses.map(
            classItem => {

                const classId =
                    classItem.id;


                const className =
                    classItem.name ||
                    classItem.className ||
                    classItem.title ||
                    classId;


                const checked =
                    selectedIds.includes(classId)
                        ? "checked"
                        : "";


                return `
                    <label class="class-checkbox">

                        <input
                            type="checkbox"
                            name="assignedClasses"
                            value="${escapeHTML(classId)}"
                            ${checked}
                        >

                        <span>
                            ${escapeHTML(className)}
                        </span>

                    </label>
                `;

            }
        ).join("");

}


/* =========================================================
   GET SELECTED CLASSES
========================================================= */

function getSelectedClassIds() {

    return [
        ...document.querySelectorAll(
            'input[name="assignedClasses"]:checked'
        )
    ].map(
        checkbox => checkbox.value
    );

}


/* =========================================================
   LOAD TEACHERS
========================================================= */

async function loadTeachers() {

    const snapshot =
        await getDocs(
            collection(db, "teachers")
        );


    allTeachers = [];


    snapshot.forEach(
        documentSnapshot => {

            allTeachers.push({

                id:
                    documentSnapshot.id,

                ...documentSnapshot.data()

            });

        }
    );


    allTeachers.sort(
        (a, b) => {

            const nameA =
                String(
                    a.name ||
                    a.fullName ||
                    ""
                ).toLowerCase();


            const nameB =
                String(
                    b.name ||
                    b.fullName ||
                    ""
                ).toLowerCase();


            return nameA.localeCompare(nameB);

        }
    );


    updateTeacherCount();

    renderTeachers();

}


/* =========================================================
   TEACHER COUNT
========================================================= */

function updateTeacherCount() {

    if (!teacherCount) {
        return;
    }


    teacherCount.textContent =
        allTeachers.length;

}


/* =========================================================
   RENDER TEACHERS
========================================================= */

function renderTeachers() {

    if (!teachersTableBody) {
        return;
    }


    if (allTeachers.length === 0) {

        teachersTableBody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="empty-message"
                >
                    No teachers registered yet.
                </td>
            </tr>
        `;

        return;

    }


    teachersTableBody.innerHTML =
        allTeachers.map(
            teacher => {

                const name =
                    teacher.name ||
                    teacher.fullName ||
                    "Unnamed Teacher";


                const email =
                    teacher.email ||
                    "";


                const phone =
                    teacher.phone ||
                    "—";


                const subject =
                    teacher.subject ||
                    "Not assigned";


                const status =
                    String(
                        teacher.status ||
                        "active"
                    ).toLowerCase();


                const accountCreated =
                    teacher.accountCreated === true;


                const assignedClassIds =
                    Array.isArray(
                        teacher.assignedClassIds
                    )
                        ? teacher.assignedClassIds
                        : [];


                const classNames =
                    assignedClassIds
                        .map(classId => {

                            const found =
                                allClasses.find(
                                    classItem =>
                                        classItem.id ===
                                        classId
                                );


                            return found
                                ? (
                                    found.name ||
                                    found.className ||
                                    found.title ||
                                    found.id
                                )
                                : classId;

                        })
                        .filter(Boolean);


                /* =========================================
                   ACCOUNT STATUS
                ========================================= */

                let accountHTML = "";


                if (!email) {

                    accountHTML = `
                        <span class="account-badge no-email">
                            No Email
                        </span>
                    `;

                }


                else if (accountCreated) {

                    accountHTML = `
                        <span class="account-badge registered">
                            Registered
                        </span>
                    `;

                }


                else {

                    accountHTML = `
                        <span class="account-badge not-registered">
                            Not Registered
                        </span>
                    `;

                }


                return `
                    <tr>

                        <td>
                            <strong>
                                ${escapeHTML(name)}
                            </strong>
                        </td>


                        <td>
                            ${
                                email
                                    ? escapeHTML(email)
                                    : "—"
                            }
                        </td>


                        <td>
                            ${escapeHTML(phone)}
                        </td>


                        <td>
                            ${escapeHTML(subject)}
                        </td>


                        <td>

                            ${
                                classNames.length

                                    ? classNames
                                        .map(
                                            className =>
                                                `<span class="class-tag">
                                                    ${escapeHTML(className)}
                                                </span>`
                                        )
                                        .join(" ")

                                    : "None"
                            }

                        </td>


                        <td>

                            <span
                                class="status-badge ${
                                    status === "active"
                                        ? "active"
                                        : "inactive"
                                }"
                            >
                                ${escapeHTML(status)}
                            </span>

                        </td>


                        <td>

                            ${accountHTML}

                        </td>


                        <td>

                            <div class="teacher-actions">

                                <button
                                    type="button"
                                    class="edit-btn"
                                    data-action="edit"
                                    data-id="${escapeHTML(teacher.id)}"
                                >
                                    Edit
                                </button>


                                <button
                                    type="button"
                                    class="toggle-btn"
                                    data-action="toggle"
                                    data-id="${escapeHTML(teacher.id)}"
                                >
                                    ${
                                        status === "active"
                                            ? "Deactivate"
                                            : "Activate"
                                    }
                                </button>


                                <button
                                    type="button"
                                    class="delete-btn"
                                    data-action="delete"
                                    data-id="${escapeHTML(teacher.id)}"
                                >
                                    Delete
                                </button>

                            </div>

                        </td>

                    </tr>
                `;

            }
        ).join("");

}


/* =========================================================
   EDIT TEACHER
========================================================= */

function editTeacher(id) {

    const teacher =
        allTeachers.find(
            item => item.id === id
        );


    if (!teacher) {
        return;
    }


    editingTeacherId =
        teacher.id;


    if (formTitle) {

        formTitle.textContent =
            "Edit Teacher";

    }


    if (editingBanner) {

        editingBanner.classList.remove(
            "hidden"
        );

    }


    if (teacherName) {

        teacherName.value =
            teacher.name ||
            teacher.fullName ||
            "";

    }


    if (teacherEmail) {

        teacherEmail.value =
            teacher.email ||
            "";


        /*
         * Once the teacher has registered,
         * do not allow the Admin to change
         * the email from this page.
         *
         * The Firebase Auth email and this
         * Firestore email must remain linked.
         */

        if (teacher.accountCreated === true) {

            teacherEmail.disabled =
                true;

            teacherEmail.title =
                "This email cannot be changed after the teacher has registered.";

        }

        else {

            teacherEmail.disabled =
                false;

            teacherEmail.title =
                "";

        }

    }


    if (teacherPhone) {

        teacherPhone.value =
            teacher.phone ||
            "";

    }


    if (teacherSubject) {

        teacherSubject.value =
            teacher.subject ||
            "";

    }


    if (teacherStatus) {

        teacherStatus.value =
            teacher.status ||
            "active";

    }


    renderClassCheckboxes(
        Array.isArray(
            teacher.assignedClassIds
        )
            ? teacher.assignedClassIds
            : []
    );


    if (saveTeacherBtn) {

        saveTeacherBtn.textContent =
            "Update Teacher";

    }


    if (cancelEditBtn) {

        cancelEditBtn.classList.remove(
            "hidden"
        );

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================================
   RESET FORM
========================================================= */

function resetTeacherForm() {

    editingTeacherId =
        null;


    if (teacherForm) {

        teacherForm.reset();

    }


    if (teacherEmail) {

        teacherEmail.disabled =
            false;

        teacherEmail.title =
            "";

    }


    if (teacherStatus) {

        teacherStatus.value =
            "active";

    }


    if (formTitle) {

        formTitle.textContent =
            "Add New Teacher";

    }


    if (editingBanner) {

        editingBanner.classList.add(
            "hidden"
        );

    }


    if (cancelEditBtn) {

        cancelEditBtn.classList.add(
            "hidden"
        );

    }


    if (saveTeacherBtn) {

        saveTeacherBtn.textContent =
            "Save Teacher";

    }


    renderClassCheckboxes();

}


/* =========================================================
   SHOW SUCCESS MESSAGE
========================================================= */

function showSuccess(message) {

    if (
        typeof Swal !== "undefined"
    ) {

        Swal.fire({

            icon: "success",

            title: "Success",

            text: message,

            confirmButtonColor:
                "#0b1f3a"

        });

    }

    else {

        alert(message);

    }

}


/* =========================================================
   SHOW ERROR MESSAGE
========================================================= */

function showError(message) {

    if (
        typeof Swal !== "undefined"
    ) {

        Swal.fire({

            icon: "error",

            title: "Unable to Continue",

            text: message,

            confirmButtonColor:
                "#0b1f3a"

        });

    }

    else {

        alert(message);

    }

}


/* =========================================================
   SAVE TEACHER
========================================================= */

async function saveTeacher(event) {

    event.preventDefault();


    const name =
        teacherName?.value.trim();


    const email =
        normalizeEmail(
            teacherEmail?.value
        );


    const phone =
        teacherPhone?.value.trim();


    const subject =
        teacherSubject?.value.trim();


    const status =
        teacherStatus?.value ||
        "active";


    const assignedClassIds =
        getSelectedClassIds();


    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!name) {

        showError(
            "Please enter the teacher's name."
        );

        teacherName?.focus();

        return;

    }


    if (!email) {

        showError(
            "Please enter the teacher's email address."
        );

        teacherEmail?.focus();

        return;

    }


    if (!phone) {

        showError(
            "Please enter the teacher's phone number."
        );

        teacherPhone?.focus();

        return;

    }


    if (!subject) {

        showError(
            "Please enter the teacher's main subject."
        );

        teacherSubject?.focus();

        return;

    }


    /*
     * Check for duplicate teacher email.
     *
     * This prevents two teacher records from
     * being registered with the same email.
     */

    const duplicateTeacher =
        allTeachers.find(
            teacher => {

                if (
                    editingTeacherId &&
                    teacher.id === editingTeacherId
                ) {

                    return false;

                }


                return (
                    normalizeEmail(
                        teacher.email
                    ) === email
                );

            }
        );


    if (duplicateTeacher) {

        showError(
            "A teacher with this email address already exists."
        );

        teacherEmail?.focus();

        return;

    }


    try {

        if (saveTeacherBtn) {

            saveTeacherBtn.disabled =
                true;

            saveTeacherBtn.textContent =
                editingTeacherId
                    ? "Updating..."
                    : "Saving...";

        }


        /* =================================================
           UPDATE EXISTING TEACHER
        ================================================= */

        if (editingTeacherId) {

            const existingTeacher =
                allTeachers.find(
                    teacher =>
                        teacher.id ===
                        editingTeacherId
                );


            const updateData = {

                name,

                phone,

                subject,

                status,

                assignedClassIds,

                updatedAt:
                    serverTimestamp()

            };


            /*
             * Only update email when the teacher
             * has NOT created an account yet.
             */

            if (
                !existingTeacher ||
                existingTeacher.accountCreated !== true
            ) {

                updateData.email =
                    email;

            }


            await updateDoc(

                doc(
                    db,
                    "teachers",
                    editingTeacherId
                ),

                updateData

            );


            showSuccess(
                "Teacher updated successfully."
            );

        }


        /* =================================================
           ADD NEW TEACHER
        ================================================= */

        else {

            await addDoc(

                collection(
                    db,
                    "teachers"
                ),

                {

                    name,

                    email,

                    phone,

                    subject,

                    status,

                    assignedClassIds,

                    role: "teacher",

                    /*
                     * This is false until the teacher
                     * creates their Firebase account.
                     */

                    accountCreated:
                        false,

                    createdAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp()

                }

            );


            showSuccess(
                "Teacher added successfully. The teacher can now create their Teacher Portal account using this email."
            );

        }


        resetTeacherForm();


        await loadTeachers();


    }


    catch (error) {

        console.error(
            "Teacher save error:",
            error
        );


        let message =
            error.message ||
            "Unable to save teacher.";


        if (
            error.code ===
            "permission-denied"
        ) {

            message =
                "You do not have permission to manage teachers. Please check your Firestore security rules.";

        }


        showError(message);

    }


    finally {

        if (saveTeacherBtn) {

            saveTeacherBtn.disabled =
                false;

            saveTeacherBtn.textContent =
                editingTeacherId
                    ? "Update Teacher"
                    : "Save Teacher";

        }

    }

}


/* =========================================================
   TOGGLE TEACHER STATUS
========================================================= */

async function toggleTeacherStatus(id) {

    const teacher =
        allTeachers.find(
            item => item.id === id
        );


    if (!teacher) {
        return;
    }


    const currentStatus =
        String(
            teacher.status ||
            "active"
        ).toLowerCase();


    const newStatus =
        currentStatus === "active"
            ? "inactive"
            : "active";


    try {

        await updateDoc(

            doc(
                db,
                "teachers",
                id
            ),

            {

                status:
                    newStatus,

                updatedAt:
                    serverTimestamp()

            }

        );


        showSuccess(
            `Teacher ${
                newStatus === "active"
                    ? "activated"
                    : "deactivated"
            } successfully.`
        );


        await loadTeachers();

    }


    catch (error) {

        console.error(
            "Status update error:",
            error
        );


        showError(
            error.message ||
            "Unable to update teacher status."
        );

    }

}


/* =========================================================
   DELETE TEACHER
========================================================= */

async function deleteTeacher(id) {

    const teacher =
        allTeachers.find(
            item => item.id === id
        );


    if (!teacher) {
        return;
    }


    const name =
        teacher.name ||
        teacher.fullName ||
        "this teacher";


    let confirmed =
        false;


    if (
        typeof Swal !== "undefined"
    ) {

        const result =
            await Swal.fire({

                icon: "warning",

                title: "Delete Teacher?",

                text:
                    `Are you sure you want to delete ${name}?`,

                showCancelButton: true,

                confirmButtonText:
                    "Yes, Delete",

                cancelButtonText:
                    "Cancel",

                confirmButtonColor:
                    "#b4232f",

                cancelButtonColor:
                    "#6c757d"

            });


        confirmed =
            result.isConfirmed;

    }

    else {

        confirmed =
            confirm(
                `Are you sure you want to delete ${name}?`
            );

    }


    if (!confirmed) {
        return;
    }


    try {

        await deleteDoc(

            doc(
                db,
                "teachers",
                id
            )

        );


        showSuccess(
            "Teacher deleted successfully."
        );


        await loadTeachers();

    }


    catch (error) {

        console.error(
            "Delete teacher error:",
            error
        );


        showError(
            error.message ||
            "Unable to delete teacher."
        );

    }

}


/* =========================================================
   TABLE ACTIONS
========================================================= */

if (teachersTableBody) {

    teachersTableBody.addEventListener(

        "click",

        event => {

            const button =
                event.target.closest(
                    "button[data-action]"
                );


            if (!button) {
                return;
            }


            const action =
                button.dataset.action;


            const id =
                button.dataset.id;


            if (action === "edit") {

                editTeacher(id);

            }


            else if (
                action === "toggle"
            ) {

                toggleTeacherStatus(id);

            }


            else if (
                action === "delete"
            ) {

                deleteTeacher(id);

            }

        }

    );

}


/* =========================================================
   FORM EVENTS
========================================================= */

if (teacherForm) {

    teacherForm.addEventListener(

        "submit",

        saveTeacher

    );

}


if (cancelEditBtn) {

    cancelEditBtn.addEventListener(

        "click",

        resetTeacherForm

    );

}


if (resetBtn) {

    resetBtn.addEventListener(

        "click",

        () => {

            /*
             * Allow the browser's reset event to
             * complete first.
             */

            setTimeout(
                resetTeacherForm,
                0
            );

        }

    );

}


/* =========================================================
   INITIALIZE
========================================================= */

async function initializeTeacherManagement() {

    try {

        console.log(
            "Teacher Management loading..."
        );


        await loadClasses();


        await loadTeachers();


        console.log(
            "Teacher Management loaded successfully."
        );

    }


    catch (error) {

        console.error(
            "Teacher Management initialization error:",
            error
        );


        showError(

            error.message ||
            "Unable to load teacher management."

        );

    }

}


initializeTeacherManagement();