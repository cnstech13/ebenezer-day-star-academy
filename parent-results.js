import { goBackOr } from "./back-navigation.js";
// ============================================================
// PARENT RESULTS
// Ebenezer Day Star Academy
// ============================================================

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
    db
} from "./firebase-config.js";


// ============================================================
// FIREBASE AUTH
// ============================================================

const auth = getAuth();


// ============================================================
// COLLECTIONS
// ============================================================

const studentsCollection =
    collection(db, "students");

const resultsCollection =
    collection(db, "results");


// ============================================================
// ELEMENTS
// ============================================================

const container =
    document.getElementById(
        "childrenResultsContainer"
    );

const loadingMessage =
    document.getElementById(
        "loadingMessage"
    );

const errorMessage =
    document.getElementById(
        "errorMessage"
    );

const backBtn =
    document.getElementById(
        "backBtn"
    );


// ============================================================
// BACK TO DASHBOARD
// ============================================================

if (backBtn) {

    backBtn.addEventListener(
        "click",
        function () {

            goBackOr("parent-dashboard.html");

        }
    );

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ============================================================
// SHOW ERROR
// ============================================================

function showError(message) {

    if (errorMessage) {

        errorMessage.textContent =
            message;

        errorMessage.style.display =
            "block";

    }

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
// LOAD CHILDREN
// ============================================================

async function loadChildren(parentEmail) {

    const snapshot =
        await getDocs(
            studentsCollection
        );


    const allStudents =
        snapshot.docs.map(
            studentDoc => ({

                firestoreId:
                    studentDoc.id,

                ...studentDoc.data()

            })
        );


    // --------------------------------------------------------
    // FIND STUDENTS BELONGING TO THIS PARENT
    // --------------------------------------------------------

    const children =
        allStudents.filter(
            student => {

                const email =
                    String(
                        student.parentEmail ||
                        student.parent ||
                        student.guardianEmail ||
                        ""
                    )
                    .trim()
                    .toLowerCase();


                return (
                    email ===
                    parentEmail
                        .trim()
                        .toLowerCase()
                );

            }
        );


    return children;

}


// ============================================================
// LOAD RESULTS FOR CHILD
// ============================================================

async function loadChildResults(
    studentId
) {

    const resultQuery =
        query(
            resultsCollection,
            where(
                "studentId",
                "==",
                studentId
            )
        );


    const snapshot =
        await getDocs(
            resultQuery
        );


    return snapshot.docs.map(
        resultDoc => ({

            firestoreId:
                resultDoc.id,

            ...resultDoc.data()

        })
    );

}


// ============================================================
// RENDER RESULTS
// ============================================================

function renderChildResults(
    student,
    results
) {

    const studentName =
        getStudentName(student);

    const studentClass =
        getStudentClass(student);


    let html = `

        <section class="child-result-card">

            <div class="child-header">

                <div>

                    <h2>
                        ${escapeHTML(
                            studentName
                        )}
                    </h2>

                    <p>
                        Class:
                        ${escapeHTML(
                            studentClass
                        )}
                    </p>

                </div>

            </div>

    `;


    if (results.length === 0) {

        html += `

            <div class="empty-results">

                No academic results have been entered
                for this student yet.

            </div>

        `;

        html += `</section>`;

        return html;

    }


    // --------------------------------------------------------
    // GROUP RESULTS BY SESSION + TERM
    // --------------------------------------------------------

    const groups = {};


    results.forEach(
        result => {

            const session =
                result.session ||
                result.academicSession ||
                "Unknown Session";


            const term =
                result.term ||
                "Unknown Term";


            const key =
                `${session}|||${term}`;


            if (!groups[key]) {

                groups[key] = {

                    session,
                    term,
                    results: []

                };

            }


            groups[key].results.push(
                result
            );

        }
    );


    Object.values(groups)
        .forEach(
            group => {

                html += `

                    <div class="result-period">

                        <h3>

                            ${escapeHTML(
                                group.session
                            )}

                            -

                            ${escapeHTML(
                                group.term
                            )}

                        </h3>


                        <div class="table-wrapper">

                            <table>

                                <thead>

                                    <tr>

                                        <th>
                                            Subject
                                        </th>

                                        <th>
                                            CW1
                                        </th>

                                        <th>
                                            CW2
                                        </th>

                                        <th>
                                            Ass 1
                                        </th>

                                        <th>
                                            Ass 2
                                        </th>

                                        <th>
                                            CA1
                                        </th>

                                        <th>
                                            CA2
                                        </th>

                                        <th>
                                            Exam
                                        </th>

                                        <th>
                                            Total
                                        </th>

                                        <th>
                                            Grade
                                        </th>

                                        <th>
                                            Remark
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                `;


                group.results
                    .forEach(
                        result => {

                            html += `

                                <tr>

                                    <td>
                                        ${escapeHTML(
                                            result.subject ||
                                            ""
                                        )}
                                    </td>

                                    <td>
                                        ${result.classWork1 ?? 0}
                                    </td>

                                    <td>
                                        ${result.classWork2 ?? 0}
                                    </td>

                                    <td>
                                        ${result.assignment1 ?? 0}
                                    </td>

                                    <td>
                                        ${result.assignment2 ?? 0}
                                    </td>

                                    <td>
                                        ${result.ca1 ?? 0}
                                    </td>

                                    <td>
                                        ${result.ca2 ?? 0}
                                    </td>

                                    <td>
                                        ${result.exam ?? 0}
                                    </td>

                                    <td>
                                        <strong>
                                            ${result.total ?? 0}
                                        </strong>
                                    </td>

                                    <td>
                                        <strong>
                                            ${escapeHTML(
                                                result.grade ||
                                                ""
                                            )}
                                        </strong>
                                    </td>

                                    <td>
                                        ${escapeHTML(
                                            result.remark ||
                                            ""
                                        )}
                                    </td>

                                </tr>

                            `;

                        }
                    );


                html += `

                                </tbody>

                            </table>

                        </div>

                    </div>

                `;

            }
        );


    html += `</section>`;


    return html;

}


// ============================================================
// LOAD PAGE
// ============================================================

async function loadParentResults(
    user
) {

    try {

        if (loadingMessage) {

            loadingMessage.style.display =
                "block";

        }


        // ----------------------------------------------------
        // GET LOGGED-IN PARENT EMAIL
        // ----------------------------------------------------

        const parentEmail =
            user.email;


        if (!parentEmail) {

            throw new Error(
                "The logged-in parent has no email address."
            );

        }


        // ----------------------------------------------------
        // FIND CHILDREN
        // ----------------------------------------------------

        const children =
            await loadChildren(
                parentEmail
            );


        if (children.length === 0) {

            if (container) {

                container.innerHTML = `

                    <div class="empty-results">

                        No children are currently
                        linked to this parent account.

                    </div>

                `;

            }

            return;

        }


        // ----------------------------------------------------
        // LOAD RESULTS
        // ----------------------------------------------------

        let finalHTML = "";


        for (
            const child of children
        ) {

            const childResults =
                await loadChildResults(
                    child.firestoreId
                );


            finalHTML +=
                renderChildResults(
                    child,
                    childResults
                );

        }


        if (container) {

            container.innerHTML =
                finalHTML;

        }

    }

    catch (error) {

        console.error(
            "Parent results error:",
            error
        );


        showError(
            "Unable to load your children's results. " +
            error.message
        );

    }

    finally {

        if (loadingMessage) {

            loadingMessage.style.display =
                "none";

        }

    }

}


// ============================================================
// AUTH STATE
// ============================================================

onAuthStateChanged(
    auth,
    user => {

        if (!user) {

            window.location.href =
                "parent-login.html";

            return;

        }


        loadParentResults(
            user
        );

    }
);