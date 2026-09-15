// ============================================================
// PARENT MANAGEMENT
// Ebenezer Day Star Academy
//
// IMPORTANT:
// - Uses existing "students" collection
// - Does NOT create a new parents collection
// - Does NOT create Firebase parent accounts
// - Groups students using parentEmail
// - Falls back to parentName + parentPhone when email is absent
// ============================================================


import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";


import { db } from "./firebase-config.js";



// ============================================================
// DATA
// ============================================================

let students = [];

let parents = [];



// ============================================================
// ELEMENTS
// ============================================================

const parentsTableBody =
    document.getElementById(
        "parentsTableBody"
    );


const emptyParents =
    document.getElementById(
        "emptyParents"
    );


const parentSearch =
    document.getElementById(
        "parentSearch"
    );


const studentCountFilter =
    document.getElementById(
        "studentCountFilter"
    );


const totalParents =
    document.getElementById(
        "totalParents"
    );


const parentModal =
    document.getElementById(
        "parentModal"
    );


const closeParentModal =
    document.getElementById(
        "closeParentModal"
    );


const cancelParentBtn =
    document.getElementById(
        "cancelParentBtn"
    );


const parentAvatar =
    document.getElementById(
        "parentAvatar"
    );


const detailParentName =
    document.getElementById(
        "detailParentName"
    );


const detailParentEmail =
    document.getElementById(
        "detailParentEmail"
    );


const detailParentPhone =
    document.getElementById(
        "detailParentPhone"
    );


const detailStudentCount =
    document.getElementById(
        "detailStudentCount"
    );


const linkedStudentsList =
    document.getElementById(
        "linkedStudentsList"
    );



// ============================================================
// FIRESTORE COLLECTION
// ============================================================

const studentsCollection =
    collection(
        db,
        "students"
    );



// ============================================================
// LOAD STUDENTS
// ============================================================

async function loadStudents() {

    try {

        showLoading(
            "Loading Parents",
            "Please wait while parent information is being loaded..."
        );


        const snapshot =
            await getDocs(
                studentsCollection
            );


        students =
            snapshot.docs.map(
                documentSnapshot => ({

                    firestoreId:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                })
            );


        buildParents();


        renderParents();


        Swal.close();

    }

    catch (error) {

        console.error(
            "Error loading parent information:",
            error
        );


        Swal.close();


        showError(
            "Unable to Load Parents",
            getFirebaseErrorMessage(
                error
            )
        );

    }

}



// ============================================================
// BUILD PARENT LIST
// ============================================================

function buildParents() {

    const parentMap =
        new Map();



    students.forEach(
        student => {


            const parentName =
                String(
                    student.parentName || ""
                )
                .trim();


            const parentPhone =
                String(
                    student.parentPhone || ""
                )
                .trim();


            const parentEmail =
                String(
                    student.parentEmail || ""
                )
                .trim()
                .toLowerCase();



            // ------------------------------------------------
            // IGNORE STUDENTS WITHOUT PARENT INFORMATION
            // ------------------------------------------------

            if (
                !parentName &&
                !parentPhone &&
                !parentEmail
            ) {

                return;

            }



            // ------------------------------------------------
            // CREATE UNIQUE PARENT KEY
            // ------------------------------------------------

            let parentKey;


            if (parentEmail) {

                parentKey =
                    `email:${parentEmail}`;

            }

            else if (
                parentName &&
                parentPhone
            ) {

                parentKey =
                    `phone:${parentPhone}|name:${parentName.toLowerCase()}`;

            }

            else if (parentPhone) {

                parentKey =
                    `phone:${parentPhone}`;

            }

            else {

                parentKey =
                    `name:${parentName.toLowerCase()}`;

            }



            // ------------------------------------------------
            // CREATE PARENT
            // ------------------------------------------------

            if (
                !parentMap.has(
                    parentKey
                )
            ) {

                parentMap.set(
                    parentKey,
                    {

                        key:
                            parentKey,

                        name:
                            parentName ||
                            "Parent / Guardian",

                        email:
                            parentEmail,

                        phone:
                            parentPhone,

                        students:
                            []

                    }
                );

            }



            // ------------------------------------------------
            // ADD STUDENT
            // ------------------------------------------------

            const parent =
                parentMap.get(
                    parentKey
                );


            parent.students.push(
                student
            );



            // ------------------------------------------------
            // FILL MISSING INFORMATION
            // ------------------------------------------------

            if (
                !parent.name &&
                parentName
            ) {

                parent.name =
                    parentName;

            }


            if (
                !parent.email &&
                parentEmail
            ) {

                parent.email =
                    parentEmail;

            }


            if (
                !parent.phone &&
                parentPhone
            ) {

                parent.phone =
                    parentPhone;

            }

        }
    );



    parents =
        Array.from(
            parentMap.values()
        );



    // --------------------------------------------------------
    // SORT BY NAME
    // --------------------------------------------------------

    parents.sort(
        (a, b) =>
            a.name.localeCompare(
                b.name
            )
    );



    // --------------------------------------------------------
    // UPDATE TOTAL
    // --------------------------------------------------------

    if (totalParents) {

        totalParents.textContent =
            parents.length;

    }

}



// ============================================================
// RENDER PARENTS
// ============================================================

function renderParents() {

    if (!parentsTableBody) {

        return;

    }


    const search =
        parentSearch
            ? parentSearch.value
                .trim()
                .toLowerCase()
            : "";


    const countFilter =
        studentCountFilter
            ? studentCountFilter.value
            : "";



    // ========================================================
    // FILTER
    // ========================================================

    const filteredParents =
        parents.filter(
            parent => {


                const matchesSearch =

                    !search ||

                    parent.name
                        .toLowerCase()
                        .includes(
                            search
                        ) ||

                    parent.email
                        .toLowerCase()
                        .includes(
                            search
                        ) ||

                    parent.phone
                        .toLowerCase()
                        .includes(
                            search
                        );



                let matchesCount =
                    true;


                if (
                    countFilter ===
                    "1"
                ) {

                    matchesCount =
                        parent.students.length ===
                        1;

                }


                if (
                    countFilter ===
                    "2"
                ) {

                    matchesCount =
                        parent.students.length ===
                        2;

                }


                if (
                    countFilter ===
                    "3+"
                ) {

                    matchesCount =
                        parent.students.length >=
                        3;

                }



                return (
                    matchesSearch &&
                    matchesCount
                );

            }
        );



    // ========================================================
    // CLEAR
    // ========================================================

    parentsTableBody.innerHTML =
        "";



    // ========================================================
    // EMPTY
    // ========================================================

    if (
        filteredParents.length ===
        0
    ) {

        if (emptyParents) {

            emptyParents.style.display =
                "block";

        }

        return;

    }



    if (emptyParents) {

        emptyParents.style.display =
            "none";

    }



    // ========================================================
    // CREATE ROWS
    // ========================================================

    filteredParents.forEach(
        parent => {


            const row =
                document.createElement(
                    "tr"
                );


            const initials =
                getInitials(
                    parent.name
                );


            const classes =
                [
                    ...new Set(
                        parent.students
                            .map(
                                student =>
                                    student.studentClass
                            )
                            .filter(Boolean)
                    )
                ];



            // ------------------------------------------------
            // CLASS HTML
            // ------------------------------------------------

            let classHTML =
                "";


            classes
                .slice(0, 2)
                .forEach(
                    className => {

                        classHTML += `

                            <span class="class-tag">

                                ${escapeHTML(
                                    className
                                )}

                            </span>

                        `;

                    }
                );


            if (
                classes.length >
                2
            ) {

                classHTML += `

                    <span class="class-more">

                        +${classes.length - 2}

                    </span>

                `;

            }


            if (
                classes.length ===
                0
            ) {

                classHTML = `
                    <span class="class-tag">
                        —
                    </span>
                `;

            }



            // ------------------------------------------------
            // EMAIL
            // ------------------------------------------------

            const emailHTML =
                parent.email

                    ? `

                        <span class="parent-email">

                            ${escapeHTML(
                                parent.email
                            )}

                        </span>

                    `

                    : `

                        <span class="parent-email empty">

                            Not provided

                        </span>

                    `;



            // ------------------------------------------------
            // ROW
            // ------------------------------------------------

            row.innerHTML = `

                <!-- PARENT -->

                <td>

                    <div class="parent-name">

                        <div class="parent-avatar">

                            ${escapeHTML(
                                initials
                            )}

                        </div>


                        <strong>

                            ${escapeHTML(
                                parent.name
                            )}

                        </strong>

                    </div>

                </td>



                <!-- EMAIL -->

                <td>

                    ${emailHTML}

                </td>



                <!-- PHONE -->

                <td>

                    <span class="parent-phone">

                        ${escapeHTML(
                            parent.phone ||
                            "Not provided"
                        )}

                    </span>

                </td>



                <!-- STUDENTS -->

                <td>

                    <span class="student-count">

                        ${parent.students.length}

                        ${
                            parent.students.length === 1
                                ? "Student"
                                : "Students"
                        }

                    </span>

                </td>



                <!-- CLASSES -->

                <td>

                    <div class="class-list">

                        ${classHTML}

                    </div>

                </td>



                <!-- ACTION -->

                <td>

                    <button
                        type="button"
                        class="view-parent-btn"
                        data-parent-key="${escapeAttribute(
                            parent.key
                        )}"
                    >

                        👁️ View

                    </button>

                </td>

            `;


            parentsTableBody.appendChild(
                row
            );

        }
    );

}



// ============================================================
// TABLE ACTION
// ============================================================

if (parentsTableBody) {

    parentsTableBody.addEventListener(
        "click",
        function (event) {


            const button =
                event.target.closest(
                    ".view-parent-btn"
                );


            if (!button) {

                return;

            }


            const key =
                button.dataset.parentKey;


            viewParent(
                key
            );

        }
    );

}



// ============================================================
// VIEW PARENT
// ============================================================

function viewParent(
    parentKey
) {

    const parent =
        parents.find(
            item =>
                item.key ===
                parentKey
        );


    if (!parent) {

        showError(
            "Parent Not Found",
            "The selected parent could not be found."
        );

        return;

    }



    // ========================================================
    // PROFILE
    // ========================================================

    const initials =
        getInitials(
            parent.name
        );


    if (parentAvatar) {

        parentAvatar.textContent =
            initials;

    }


    if (detailParentName) {

        detailParentName.textContent =
            parent.name;

    }


    if (detailParentEmail) {

        detailParentEmail.textContent =
            parent.email ||
            "Email not provided";

    }


    if (detailParentPhone) {

        detailParentPhone.textContent =
            parent.phone ||
            "Phone not provided";

    }



    // ========================================================
    // COUNT
    // ========================================================

    if (detailStudentCount) {

        detailStudentCount.textContent =

            `${parent.students.length} ${
                parent.students.length === 1
                    ? "Student"
                    : "Students"
            }`;

    }



    // ========================================================
    // STUDENTS
    // ========================================================

    if (linkedStudentsList) {

        linkedStudentsList.innerHTML =
            "";



        if (
            parent.students.length ===
            0
        ) {

            linkedStudentsList.innerHTML = `

                <div class="no-linked-students">

                    No linked students found.

                </div>

            `;

        }

        else {

            parent.students.forEach(
                student => {


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
                        )
                        .toUpperCase();



                    const studentName =
                        `${student.firstName || ""} ${student.lastName || ""}`
                            .trim();



                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "linked-student-card";


                    card.innerHTML = `

                        <div class="linked-student-info">

                            <div class="linked-student-avatar">

                                ${escapeHTML(
                                    initials
                                )}

                            </div>


                            <div>

                                <strong>

                                    ${escapeHTML(
                                        studentName
                                    )}

                                </strong>


                                <small>

                                    ${escapeHTML(
                                        student.id ||
                                        "No Student ID"
                                    )}

                                </small>

                            </div>

                        </div>


                        <span class="linked-student-class">

                            ${escapeHTML(
                                student.studentClass ||
                                "Class not assigned"
                            )}

                        </span>

                    `;


                    linkedStudentsList.appendChild(
                        card
                    );

                }
            );

        }

    }



    // ========================================================
    // OPEN MODAL
    // ========================================================

    if (parentModal) {

        parentModal.classList.add(
            "show"
        );

    }

}



// ============================================================
// CLOSE MODAL
// ============================================================

function closeParentModalFunction() {

    if (parentModal) {

        parentModal.classList.remove(
            "show"
        );

    }

}



// ============================================================
// CLOSE BUTTON
// ============================================================

if (closeParentModal) {

    closeParentModal.addEventListener(
        "click",
        closeParentModalFunction
    );

}



// ============================================================
// CANCEL BUTTON
// ============================================================

if (cancelParentBtn) {

    cancelParentBtn.addEventListener(
        "click",
        closeParentModalFunction
    );

}



// ============================================================
// CLICK OUTSIDE
// ============================================================

if (parentModal) {

    parentModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                parentModal
            ) {

                closeParentModalFunction();

            }

        }
    );

}



// ============================================================
// SEARCH
// ============================================================

if (parentSearch) {

    parentSearch.addEventListener(
        "input",
        renderParents
    );

}



// ============================================================
// STUDENT COUNT FILTER
// ============================================================

if (studentCountFilter) {

    studentCountFilter.addEventListener(
        "change",
        renderParents
    );

}



// ============================================================
// GET INITIALS
// ============================================================

function getInitials(
    name
) {

    const parts =
        String(
            name || ""
        )
        .trim()
        .split(
            /\s+/
        )
        .filter(Boolean);


    if (
        parts.length ===
        0
    ) {

        return "P";

    }


    if (
        parts.length ===
        1
    ) {

        return parts[0][0]
            .toUpperCase();

    }


    return (

        parts[0][0] +
        parts[parts.length - 1][0]

    )
    .toUpperCase();

}



// ============================================================
// ESCAPE HTML
// ============================================================

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



// ============================================================
// ESCAPE ATTRIBUTE
// ============================================================

function escapeAttribute(
    value
) {

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



// ============================================================
// FIREBASE ERROR MESSAGE
// ============================================================

function getFirebaseErrorMessage(
    error
) {

    if (!error) {

        return "An unknown error occurred.";

    }


    if (
        error.code ===
        "permission-denied"
    ) {

        return (

            "Firestore permission denied. " +

            "Please make sure the administrator " +

            "has permission to read the students collection."

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
        "unavailable"
    ) {

        return (

            "Firebase is temporarily unavailable. " +

            "Please check your internet connection."

        );

    }


    if (
        error.code ===
        "failed-precondition"
    ) {

        return (

            "Firebase could not complete the request. " +

            "Please check your Firebase configuration."

        );

    }


    return (

        error.message ||

        "An unexpected Firebase error occurred."

    );

}



// ============================================================
// INITIALIZE
// ============================================================

loadStudents();