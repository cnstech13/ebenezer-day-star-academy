// ============================================================
// PARENT RESULTS
// Ebenezer Day Star Academy
// ============================================================

import { goBackOr } from "./back-navigation.js";

import {
    collection,
    getDocs,
    query,
    where,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
    auth,
    db
} from "./firebase-config.js";


// ============================================================
// ELEMENTS
// ============================================================

const container =
    document.getElementById("childrenResultsContainer");

const loadingMessage =
    document.getElementById("loadingMessage");

const errorMessage =
    document.getElementById("errorMessage");

const backBtn =
    document.getElementById("backBtn");


// ============================================================
// BACK TO DASHBOARD
// ============================================================

if (backBtn) {

    backBtn.addEventListener("click", () => {

        goBackOr("parent-dashboard.html");

    });

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

    console.error(message);

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
// VERIFY PARENT ACCOUNT
// ============================================================

async function verifyParent(user) {

    const userRef =
        doc(
            db,
            "users",
            user.uid
        );

    const userSnapshot =
        await getDoc(userRef);


    if (!userSnapshot.exists()) {

        throw new Error(
            "Your parent account profile was not found."
        );

    }


    const userData =
        userSnapshot.data();


    if (
        userData.role !== "parent"
    ) {

        throw new Error(
            "This account is not registered as a parent."
        );

    }


    if (
        userData.active === false
    ) {

        throw new Error(
            "This parent account has been disabled."
        );

    }


    return userData;

}


// ============================================================
// LOAD CHILDREN
// ============================================================

async function loadChildren(parentUid) {

    const studentsCollection =
        collection(
            db,
            "students"
        );


    const childrenQuery =
        query(

            studentsCollection,

            where(
                "parentUid",
                "==",
                parentUid
            )

        );


    const snapshot =
        await getDocs(
            childrenQuery
        );


    return snapshot.docs.map(
        studentDoc => ({

            firestoreId:
                studentDoc.id,

            ...studentDoc.data()

        })
    );

}


// ============================================================
// LOAD RESULTS FOR ONE CHILD
// ============================================================

async function loadChildResults(
    studentId
) {

    const resultsCollection =
        collection(
            db,
            "results"
        );


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
                            studentClass || "N/A"
                        )}
                    </p>

                </div>

            </div>

    `;


    // ========================================================
    // NO RESULTS
    // ========================================================

    if (results.length === 0) {

        html += `

            <div class="empty-results">

                <h3>
                    No Academic Results
                </h3>

                <p>
                    No academic results have been
                    entered for this student yet.
                </p>

            </div>

        `;

        html += `</section>`;

        return html;

    }


    // ========================================================
    // GROUP BY SESSION + TERM
    // ========================================================

    const groups = {};


    results.forEach(result => {

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

    });


    // ========================================================
    // RENDER GROUPS
    // ========================================================

    Object.values(groups).forEach(group => {

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


        group.results.forEach(result => {

            html += `

                <tr>

                    <td>
                        ${escapeHTML(
                            result.subject ||
                            result.subjectName ||
                            ""
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            result.classWork1 ?? 0
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            result.classWork2 ?? 0
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            result.assignment1 ?? 0
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            result.assignment2 ?? 0
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            result.ca1 ?? 0
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            result.ca2 ?? 0
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            result.exam ?? 0
                        )}
                    </td>


                    <td>

                        <strong>
                            ${escapeHTML(
                                result.total ?? 0
                            )}
                        </strong>

                    </td>


                    <td>

                        <strong>
                            ${escapeHTML(
                                result.grade || ""
                            )}
                        </strong>

                    </td>


                    <td>
                        ${escapeHTML(
                            result.remark || ""
                        )}
                    </td>

                </tr>

            `;

        });


        html += `

                        </tbody>

                    </table>

                </div>

            </div>

        `;

    });


    html += `</section>`;


    return html;

}


// ============================================================
// LOAD PARENT RESULTS
// ============================================================

async function loadParentResults(user) {

    try {

        console.log(
            "Loading parent results..."
        );


        // ----------------------------------------------------
        // VERIFY PARENT
        // ----------------------------------------------------

        await verifyParent(user);


        console.log(
            "Parent account verified."
        );


        // ----------------------------------------------------
        // LOAD ONLY THIS PARENT'S CHILDREN
        // ----------------------------------------------------

        const children =
            await loadChildren(
                user.uid
            );


        console.log(
            "Children found:",
            children.length
        );


        // ----------------------------------------------------
        // NO CHILDREN
        // ----------------------------------------------------

        if (children.length === 0) {

            if (container) {

                container.innerHTML = `

                    <div class="empty-results">

                        <h3>
                            No Children Linked
                        </h3>

                        <p>
                            No student has been linked
                            to this parent account yet.
                        </p>

                    </div>

                `;

            }

            return;

        }


        // ----------------------------------------------------
        // LOAD EACH CHILD'S RESULTS
        // ----------------------------------------------------

        const resultsHTML = [];


        for (
            const child of children
        ) {

            try {

                const childResults =
                    await loadChildResults(
                        child.firestoreId
                    );


                resultsHTML.push(

                    renderChildResults(
                        child,
                        childResults
                    )

                );

            }

            catch (childError) {

                console.error(
                    "Result error for child:",
                    child.firestoreId,
                    childError
                );


                resultsHTML.push(`

                    <section
                        class="child-result-card"
                    >

                        <div class="empty-results">

                            <h3>
                                Unable to Load Results
                            </h3>

                            <p>
                                ${escapeHTML(
                                    getStudentName(child)
                                )}
                            </p>

                            <small>
                                ${escapeHTML(
                                    childError.message ||
                                    "Permission denied."
                                )}
                            </small>

                        </div>

                    </section>

                `);

            }

        }


        // ----------------------------------------------------
        // DISPLAY
        // ----------------------------------------------------

        if (container) {

            container.innerHTML =
                resultsHTML.join("");

        }

    }

    catch (error) {

        console.error(
            "Parent results error:",
            error
        );


        if (
            error.code ===
            "permission-denied"
        ) {

            showError(
                "Firebase denied access to your children's results. Check the Firestore rules for parent result access."
            );

        }

        else {

            showError(
                "Unable to load your children's results. " +
                (error.message || "")
            );

        }

    }

    finally {

        if (loadingMessage) {

            loadingMessage.style.display =
                "none";

        }

    }

}


// ============================================================
// FIREBASE AUTH STATE
// ============================================================

onAuthStateChanged(
    auth,
    user => {

        console.log(
            "Parent results authentication:",
            user
        );


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