// ============================================================
// PARENT ATTENDANCE
// Ebenezer Day Star Academy
// ============================================================

import { goBackOr } from "./back-navigation.js";

import {
    collection,
    query,
    where,
    getDocs,
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
    document.getElementById("childrenAttendanceContainer");

const loadingMessage =
    document.getElementById("loadingMessage");

const errorMessage =
    document.getElementById("errorMessage");

const backBtn =
    document.getElementById("backBtn");


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
// HIDE LOADING
// ============================================================

function hideLoading() {

    if (loadingMessage) {
        loadingMessage.style.display = "none";
    }
}


// ============================================================
// SHOW ERROR
// ============================================================

function showError(message) {

    console.error(message);

    if (errorMessage) {

        errorMessage.textContent = message;

        errorMessage.style.display = "block";
    }
}


// ============================================================
// BACK BUTTON
// ============================================================

if (backBtn) {

    backBtn.addEventListener("click", () => {

        goBackOr("parent-dashboard.html");

    });

}


// ============================================================
// STUDENT NAME
// ============================================================

function getStudentName(student) {

    const firstName =
        student.firstName || "";

    const lastName =
        student.lastName || "";

    const fullName =
        `${firstName} ${lastName}`.trim();

    return (
        fullName ||
        student.name ||
        student.fullName ||
        student.studentName ||
        "Unnamed Student"
    );
}


// ============================================================
// STUDENT CLASS
// ============================================================

function getStudentClass(student) {

    return (
        student.studentClass ||
        student.className ||
        student.class ||
        "N/A"
    );
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

    const userSnap =
        await getDoc(userRef);

    if (!userSnap.exists()) {

        throw new Error(
            "Parent account profile was not found."
        );
    }

    const userData =
        userSnap.data();

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
// GET CHILDREN
// ============================================================

async function getChildren(parentUid) {

    const studentsRef =
        collection(
            db,
            "students"
        );

    const q =
        query(
            studentsRef,
            where(
                "parentUid",
                "==",
                parentUid
            )
        );

    const snapshot =
        await getDocs(q);

    return snapshot.docs.map(
        studentDoc => ({

            firestoreId:
                studentDoc.id,

            ...studentDoc.data()

        })
    );
}


// ============================================================
// GET INDIVIDUAL STUDENT ATTENDANCE
// ============================================================

async function getAttendance(studentId) {

    const attendanceRef =
        collection(
            db,
            "studentAttendance"
        );

    const q =
        query(
            attendanceRef,

            where(
                "studentId",
                "==",
                studentId
            )
        );

    const snapshot =
        await getDocs(q);

    const records =
        snapshot.docs.map(
            attendanceDoc => ({

                firestoreId:
                    attendanceDoc.id,

                ...attendanceDoc.data()

            })
        );


    // --------------------------------------------------------
    // SORT BY DATE — NEWEST FIRST
    // --------------------------------------------------------

    records.sort(
        (a, b) => {

            const dateA =
                new Date(
                    a.date || 0
                ).getTime();

            const dateB =
                new Date(
                    b.date || 0
                ).getTime();

            return dateB - dateA;

        }
    );


    return records;
}


// ============================================================
// RENDER ATTENDANCE
// ============================================================

function renderAttendance(
    student,
    records
) {

    let present = 0;
    let absent = 0;
    let late = 0;


    // --------------------------------------------------------
    // CALCULATE SUMMARY
    // --------------------------------------------------------

    records.forEach(record => {

        const status =
            String(
                record.status || ""
            )
            .trim()
            .toLowerCase();


        if (status === "present") {

            present++;

        } else if (status === "absent") {

            absent++;

        } else if (status === "late") {

            late++;

        }

    });


    let html = `

        <section class="child-attendance-card">

            <div class="child-header">

                <div>

                    <h2>
                        ${escapeHTML(
                            getStudentName(student)
                        )}
                    </h2>

                    <p>
                        Class:
                        ${escapeHTML(
                            getStudentClass(student)
                        )}
                    </p>

                </div>

            </div>


            <div class="attendance-summary">

                <div class="summary-card">

                    <strong>
                        ${present}
                    </strong>

                    <span>
                        Present
                    </span>

                </div>


                <div class="summary-card">

                    <strong>
                        ${absent}
                    </strong>

                    <span>
                        Absent
                    </span>

                </div>


                <div class="summary-card">

                    <strong>
                        ${late}
                    </strong>

                    <span>
                        Late
                    </span>

                </div>

            </div>
    `;


    // ========================================================
    // NO RECORDS
    // ========================================================

    if (records.length === 0) {

        html += `

            <div class="empty-attendance">

                <h3>
                    No Attendance Records
                </h3>

                <p>
                    No attendance records have been
                    entered for this student yet.
                </p>

            </div>

        </section>

        `;

        return html;
    }


    // ========================================================
    // ATTENDANCE TABLE
    // ========================================================

    html += `

        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>

                        <th>
                            Date
                        </th>

                        <th>
                            Session
                        </th>

                        <th>
                            Term
                        </th>

                        <th>
                            Status
                        </th>

                    </tr>

                </thead>

                <tbody>
    `;


    records.forEach(record => {

        const status =
            String(
                record.status ||
                "Unknown"
            ).trim();


        const statusClass =
            status
                .toLowerCase()
                .replace(
                    /\s+/g,
                    "-"
                );


        html += `

            <tr>

                <td>
                    ${escapeHTML(
                        record.date ||
                        "N/A"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        record.session ||
                        record.academicSession ||
                        "N/A"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        record.term ||
                        "N/A"
                    )}
                </td>

                <td>

                    <span
                        class="attendance-status ${escapeHTML(
                            statusClass
                        )}"
                    >
                        ${escapeHTML(status)}
                    </span>

                </td>

            </tr>

        `;

    });


    html += `

                </tbody>

            </table>

        </div>

        </section>

    `;


    return html;
}


// ============================================================
// LOAD PAGE
// ============================================================

async function loadPage(user) {

    try {

        console.log(
            "Parent attendance: checking account..."
        );


        // ----------------------------------------------------
        // VERIFY PARENT
        // ----------------------------------------------------

        await verifyParent(user);


        console.log(
            "Parent account verified."
        );


        // ----------------------------------------------------
        // GET CHILDREN
        // ----------------------------------------------------

        const children =
            await getChildren(
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

            container.innerHTML = `

                <div class="empty-attendance">

                    <h3>
                        No Children Linked
                    </h3>

                    <p>
                        No student has been linked
                        to this parent account yet.
                    </p>

                </div>

            `;

            return;
        }


        // ----------------------------------------------------
        // LOAD EACH CHILD'S ATTENDANCE
        // ----------------------------------------------------

        const attendanceHTML = [];


        for (
            const child of children
        ) {

            try {

                const records =
                    await getAttendance(
                        child.firestoreId
                    );


                attendanceHTML.push(
                    renderAttendance(
                        child,
                        records
                    )
                );


            } catch (childError) {

                console.error(
                    "Attendance error for child:",
                    child.firestoreId,
                    childError
                );


                attendanceHTML.push(`

                    <section
                        class="child-attendance-card"
                    >

                        <div class="empty-attendance">

                            <h3>
                                Unable to Load Attendance
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

        container.innerHTML =
            attendanceHTML.join("");


    } catch (error) {

        console.error(
            "Parent attendance error:",
            error
        );


        if (
            error.code ===
            "permission-denied"
        ) {

            showError(
                "Firebase denied access to the attendance records. Check the Firestore rules for parents."
            );

        } else {

            showError(
                error.message ||
                "Unable to load attendance records."
            );

        }

    } finally {

        hideLoading();

    }
}


// ============================================================
// FIREBASE AUTHENTICATION
// ============================================================

onAuthStateChanged(
    auth,
    user => {

        console.log(
            "Authentication state:",
            user
        );


        if (!user) {

            window.location.href =
                "parent-login.html";

            return;
        }


        loadPage(user);

    }
);