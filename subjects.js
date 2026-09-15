import { adminReady, withTimeout } from "./admin-guard.js";
/* =========================
   FIREBASE SUBJECT DATABASE
========================= */

await adminReady;

import {
    collection,
    getDocs,
    doc,
    addDoc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import { db } from "./firebase-config.js";

let subjects = [];


/* =========================
   ELEMENTS
========================= */

const subjectModal =
    document.getElementById("subjectModal");

const subjectForm =
    document.getElementById("subjectForm");

const subjectsTableBody =
    document.getElementById("subjectsTableBody");

const emptySubjects =
    document.getElementById("emptySubjects");

const subjectSearch =
    document.getElementById("subjectSearch");

const subjectLevelFilter =
    document.getElementById("subjectLevelFilter");

const subjectStatusFilter =
    document.getElementById("subjectStatusFilter");

const addSubjectBtn =
    document.getElementById("addSubjectBtn");

const closeSubjectModal =
    document.getElementById("closeSubjectModal");

const cancelSubjectBtn =
    document.getElementById("cancelSubjectBtn");


/* =========================
   FIRESTORE COLLECTION
========================= */

const subjectsCollection =
    collection(db, "subjects");


/* =========================
   LOAD SUBJECTS
========================= */

async function loadSubjects() {

    try {

        const snapshot =
            await withTimeout(getDocs(
                subjectsCollection
            ));

        subjects = [];

        snapshot.forEach(
            documentSnapshot => {

                subjects.push({

                    firestoreId:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                });

            }
        );

        renderSubjects();

    }

    catch (error) {

        console.error(
            "Error loading subjects:",
            error
        );

        showError(
            "Unable to Load Subjects",
            getFirebaseErrorMessage(error)
        );

    }

}


/* =========================
   GENERATE SUBJECT ID
========================= */

function generateSubjectId() {

    let number =
        subjects.length + 1;

    let id =
        `SUB-${String(number).padStart(3, "0")}`;


    while (
        subjects.some(
            subject =>
                subject.id === id
        )
    ) {

        number++;

        id =
            `SUB-${String(number).padStart(3, "0")}`;

    }


    return id;

}


/* =========================
   OPEN MODAL
========================= */

function openSubjectModal(
    subject = null
) {

    subjectModal.classList.add(
        "show"
    );


    if (subject) {

        document.getElementById(
            "subjectModalTitle"
        ).textContent =
            "Edit Subject";


        document.getElementById(
            "editingSubjectId"
        ).value =
            subject.firestoreId;


        document.getElementById(
            "subjectName"
        ).value =
            subject.name || "";


        document.getElementById(
            "subjectCode"
        ).value =
            subject.code || "";


        document.getElementById(
            "subjectLevel"
        ).value =
            subject.level || "";


        document.getElementById(
            "subjectType"
        ).value =
            subject.type || "";


        document.getElementById(
            "subjectStatus"
        ).value =
            subject.status || "";


        document.getElementById(
            "subjectDescription"
        ).value =
            subject.description || "";

    }

    else {

        subjectForm.reset();


        document.getElementById(
            "subjectModalTitle"
        ).textContent =
            "Add Subject";


        document.getElementById(
            "editingSubjectId"
        ).value =
            "";

    }

}


/* =========================
   CLOSE MODAL
========================= */

function closeSubjectModalFunction() {

    subjectModal.classList.remove(
        "show"
    );

    subjectForm.reset();

}


/* =========================
   MODAL EVENTS
========================= */

addSubjectBtn.addEventListener(
    "click",
    () => openSubjectModal()
);


closeSubjectModal.addEventListener(
    "click",
    closeSubjectModalFunction
);


cancelSubjectBtn.addEventListener(
    "click",
    closeSubjectModalFunction
);


subjectModal.addEventListener(
    "click",
    function(event) {

        if (
            event.target ===
            subjectModal
        ) {

            closeSubjectModalFunction();

        }

    }
);


/* =========================
   SAVE SUBJECT
========================= */

subjectForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const editingId =
            document.getElementById(
                "editingSubjectId"
            ).value;


        const name =
            document.getElementById(
                "subjectName"
            ).value.trim();


        const code =
            document.getElementById(
                "subjectCode"
            ).value
                .trim()
                .toUpperCase();


        const level =
            document.getElementById(
                "subjectLevel"
            ).value;


        const type =
            document.getElementById(
                "subjectType"
            ).value;


        const status =
            document.getElementById(
                "subjectStatus"
            ).value;


        const description =
            document.getElementById(
                "subjectDescription"
            ).value.trim();


        /* =========================
           VALIDATION
        ========================= */

        if (
            !name ||
            !code ||
            !level ||
            !type ||
            !status
        ) {

            showWarning(
                "Incomplete Form",
                "Please complete all required fields."
            );

            return;

        }


        /* =========================
           DUPLICATE NAME
        ========================= */

        const duplicateName =
            subjects.some(
                subject =>

                    subject.name
                        ?.toLowerCase() ===
                    name.toLowerCase() &&

                    subject.firestoreId !==
                    editingId

            );


        if (duplicateName) {

            showWarning(
                "Duplicate Subject",
                "A subject with this name already exists."
            );

            return;

        }


        /* =========================
           DUPLICATE CODE
        ========================= */

        const duplicateCode =
            subjects.some(
                subject =>

                    subject.code
                        ?.toLowerCase() ===
                    code.toLowerCase() &&

                    subject.firestoreId !==
                    editingId

            );


        if (duplicateCode) {

            showWarning(
                "Duplicate Subject Code",
                "A subject with this code already exists."
            );

            return;

        }


        /* =========================
           FIND EXISTING SUBJECT
        ========================= */

        const existingSubject =
            subjects.find(
                subject =>
                    subject.firestoreId ===
                    editingId
            );


        /* =========================
           SUBJECT DATA
        ========================= */

        const subjectData = {

            id:
                editingId
                    ? (
                        existingSubject?.id ||
                        generateSubjectId()
                    )
                    : generateSubjectId(),

            name,

            code,

            level,

            type,

            status,

            description,

            updatedAt:
                new Date().toISOString()

        };


        try {

            /* =========================
               SHOW LOADING
            ========================= */

            showLoading(
                editingId
                    ? "Updating Subject..."
                    : "Adding Subject...",
                editingId
                    ? "Please wait while the subject is updated."
                    : "Please wait while the subject is added."
            );


            /* =========================
               EDIT
            ========================= */

            if (editingId) {

                const subjectRef =
                    doc(
                        db,
                        "subjects",
                        editingId
                    );


                await withTimeout(updateDoc(
                    subjectRef,
                    subjectData
                ));

            }


            /* =========================
               ADD
            ========================= */

            else {

                subjectData.createdAt =
                    new Date().toISOString();


                await withTimeout(addDoc(
                    subjectsCollection,
                    subjectData
                ));

            }


            /* =========================
               CLOSE LOADING
            ========================= */

            Swal.close();


            /* =========================
               RELOAD SUBJECTS
            ========================= */

            await loadSubjects();


            /* =========================
               CLOSE MODAL
            ========================= */

            closeSubjectModalFunction();


            /* =========================
               SUCCESS MESSAGE
            ========================= */

            await showSuccess(
                editingId
                    ? "Subject Updated"
                    : "Subject Added",
                editingId
                    ? "The subject has been updated successfully."
                    : "The subject has been added successfully."
            );

        }

        catch (error) {

            console.error(
                "Error saving subject:",
                error
            );


            Swal.close();


            showError(
                "Unable to Save Subject",
                getFirebaseErrorMessage(error)
            );

        }

    }
);


/* =========================
   RENDER SUBJECTS
========================= */

function renderSubjects() {

    const search =
        subjectSearch.value
            .trim()
            .toLowerCase();


    const selectedLevel =
        subjectLevelFilter.value;


    const selectedStatus =
        subjectStatusFilter.value;


    const filtered =
        subjects.filter(
            subject => {

                const matchesSearch =
                    !search ||

                    subject.name
                        ?.toLowerCase()
                        .includes(search) ||

                    subject.code
                        ?.toLowerCase()
                        .includes(search) ||

                    subject.id
                        ?.toLowerCase()
                        .includes(search);


                const matchesLevel =
                    !selectedLevel ||

                    subject.level ===
                    selectedLevel;


                const matchesStatus =
                    !selectedStatus ||

                    subject.status ===
                    selectedStatus;


                return (
                    matchesSearch &&
                    matchesLevel &&
                    matchesStatus
                );

            }
        );


    subjectsTableBody.innerHTML =
        "";


    if (
        filtered.length === 0
    ) {

        emptySubjects.style.display =
            "block";

        return;

    }


    emptySubjects.style.display =
        "none";


    filtered.forEach(
        subject => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>

                    <span class="student-id">

                        ${escapeHTML(
                            subject.id
                        )}

                    </span>

                </td>


                <td>

                    <strong>

                        ${escapeHTML(
                            subject.name
                        )}

                    </strong>

                </td>


                <td>

                    <span class="student-id">

                        ${escapeHTML(
                            subject.code
                        )}

                    </span>

                </td>


                <td>

                    ${escapeHTML(
                        subject.level
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        subject.type
                    )}

                </td>


                <td>

                    <span class="
                        status-badge
                        ${
                            subject.status ===
                            "Active"

                                ? "status-active"

                                : "status-inactive"
                        }
                    ">

                        ${escapeHTML(
                            subject.status
                        )}

                    </span>

                </td>


                <td>

                    <div class="table-actions">

                        <button
                            class="table-action"
                            title="Edit"
                            onclick="editSubject('${escapeAttribute(
                                subject.firestoreId
                            )}')"
                        >
                            ✏️
                        </button>


                        <button
                            class="table-action"
                            title="Delete"
                            onclick="deleteSubject('${escapeAttribute(
                                subject.firestoreId
                            )}')"
                        >
                            🗑️
                        </button>

                    </div>

                </td>

            `;


            subjectsTableBody.appendChild(
                row
            );

        }
    );

}


/* =========================
   EDIT SUBJECT
========================= */

function editSubject(
    firestoreId
) {

    const subject =
        subjects.find(
            item =>
                item.firestoreId ===
                firestoreId
        );


    if (!subject) {

        showError(
            "Subject Not Found",
            "The selected subject could not be found."
        );

        return;

    }


    openSubjectModal(
        subject
    );

}


/* =========================
   DELETE SUBJECT
========================= */

async function deleteSubject(
    firestoreId
) {

    const subject =
        subjects.find(
            item =>
                item.firestoreId ===
                firestoreId
        );


    if (!subject) {

        showError(
            "Subject Not Found",
            "The selected subject could not be found."
        );

        return;

    }


    /* =========================
       CONFIRM DELETE
    ========================= */

    const confirmed =
        await confirmDelete(
            `Delete ${subject.name}?`,
            "This subject will be permanently removed from Firestore."
        );


    if (!confirmed)
        return;


    try {

        /* =========================
           LOADING
        ========================= */

        showLoading(
            "Deleting Subject...",
            `Removing ${subject.name}. Please wait.`
        );


        /* =========================
           DELETE
        ========================= */

        await withTimeout(deleteDoc(
            doc(
                db,
                "subjects",
                firestoreId
            )
        ));


        /* =========================
           RELOAD
        ========================= */

        await loadSubjects();


        /* =========================
           CLOSE LOADING
        ========================= */

        Swal.close();


        /* =========================
           SUCCESS
        ========================= */

        await showSuccess(
            "Subject Deleted",
            `${subject.name} has been deleted successfully.`
        );

    }

    catch (error) {

        console.error(
            "Error deleting subject:",
            error
        );


        Swal.close();


        showError(
            "Unable to Delete Subject",
            getFirebaseErrorMessage(error)
        );

    }

}


/* =========================
   FILTERS
========================= */

subjectSearch.addEventListener(
    "input",
    renderSubjects
);


subjectLevelFilter.addEventListener(
    "change",
    renderSubjects
);


subjectStatusFilter.addEventListener(
    "change",
    renderSubjects
);


/* =========================
   ESCAPE HTML
========================= */

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


/* =========================
   ESCAPE ATTRIBUTE
========================= */

function escapeAttribute(value) {

    return String(
        value ?? ""
    )

        .replace(
            /\\/g,
            "\\\\"
        )

        .replace(
            /'/g,
            "\\'"
        )

        .replace(
            /"/g,
            "&quot;"
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


/* =========================
   FIREBASE ERROR MESSAGE
========================= */

function getFirebaseErrorMessage(
    error
) {

    if (!error)
        return "An unknown error occurred.";


    switch (error.code) {

        case "permission-denied":

            return "You do not have permission to perform this action.";


        case "unavailable":

            return "Firebase is temporarily unavailable. Please check your internet connection.";


        case "network-request-failed":

            return "A network error occurred. Please check your internet connection.";


        case "not-found":

            return "The requested subject could not be found.";


        default:

            return (
                error.message ||
                "An unexpected error occurred. Please try again."
            );

    }

}


/* =========================
   MAKE FUNCTIONS AVAILABLE
   TO INLINE BUTTONS
========================= */

window.editSubject =
    editSubject;

window.deleteSubject =
    deleteSubject;


/* =========================
   INITIAL LOAD
========================= */

loadSubjects();