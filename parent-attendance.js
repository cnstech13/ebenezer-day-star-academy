import { goBackOr } from "./back-navigation.js";
// ============================================================
// PARENT ATTENDANCE
// Ebenezer Day Star Academy
// ============================================================


import {

    collection,
    query,
    where,
    getDocs

}
from
"https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";


import {

    onAuthStateChanged

}
from
"https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";


import {

    auth,
    db

}
from "./firebase-config.js";



// ============================================================
// ELEMENTS
// ============================================================

const container =
    document.getElementById(
        "childrenAttendanceContainer"
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
// ESCAPE HTML
// ============================================================

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



// ============================================================
// HIDE LOADING
// ============================================================

function hideLoading() {

    if (loadingMessage) {

        loadingMessage.style.display =
            "none";

    }

}



// ============================================================
// SHOW ERROR
// ============================================================

function showError(message) {

    console.error(
        message
    );


    if (errorMessage) {

        errorMessage.textContent =
            message;

        errorMessage.style.display =
            "block";

    }

}



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
// STUDENT NAME
// ============================================================

function getStudentName(
    student
) {

    const firstName =
        student.firstName ||
        "";


    const lastName =
        student.lastName ||
        "";


    const fullName =
        `${firstName} ${lastName}`
            .trim();


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

function getStudentClass(
    student
) {

    return (

        student.studentClass ||

        student.className ||

        student.class ||

        "N/A"

    );

}



// ============================================================
// GET CHILDREN
// ============================================================

async function getChildren(
    parentUid
) {

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
// GET ATTENDANCE
// ============================================================

async function getAttendance(
    studentId
) {

    const attendanceRef =
        collection(
            db,
            "attendance"
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


    return snapshot.docs.map(
        attendanceDoc => ({

            firestoreId:
                attendanceDoc.id,

            ...attendanceDoc.data()

        })
    );

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


    records.forEach(
        record => {

            const status =
                String(
                    record.status ||
                    ""
                )
                .trim()
                .toLowerCase();


            if (
                status === "present"
            ) {

                present++;

            }


            else if (
                status === "absent"
            ) {

                absent++;

            }


            else if (
                status === "late"
            ) {

                late++;

            }

        }
    );


    let html = `

        <section
            class="child-attendance-card"
        >


            <div class="child-header">

                <div>

                    <h2>

                        ${escapeHTML(
                            getStudentName(
                                student
                            )
                        )}

                    </h2>


                    <p>

                        Class:
                        ${escapeHTML(
                            getStudentClass(
                                student
                            )
                        )}

                    </p>

                </div>

            </div>



            <div
                class="attendance-summary"
            >


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

    if (
        records.length === 0
    ) {

        html += `

            <div
                class="empty-attendance"
            >

                <h3>
                    No Attendance Records
                </h3>

                <p>

                    No attendance records
                    have been entered for
                    this student yet.

                </p>

            </div>

        `;


        html += `
            </section>
        `;


        return html;

    }



    // ========================================================
    // TABLE
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



    records.forEach(
        record => {

            const status =
                String(
                    record.status ||
                    "Unknown"
                )
                .trim();


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

                            ${escapeHTML(
                                status
                            )}

                        </span>

                    </td>

                </tr>

            `;

        }
    );



    html += `

                </tbody>

            </table>

        </div>

    `;



    html += `

        </section>

    `;


    return html;

}



// ============================================================
// LOAD PAGE
// ============================================================

async function loadPage(
    user
) {

    try {

        console.log(
            "Loading parent attendance..."
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

        if (
            children.length === 0
        ) {

            container.innerHTML = `

                <div
                    class="empty-attendance"
                >

                    <h3>
                        No Children Linked
                    </h3>

                    <p>

                        No student has been
                        linked to this parent
                        account.

                    </p>

                </div>

            `;


            return;

        }



        // ----------------------------------------------------
        // LOAD ATTENDANCE
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

            }


            catch (
                childError
            ) {

                console.error(
                    "Attendance error:",
                    childError
                );


                attendanceHTML.push(`

                    <section
                        class="child-attendance-card"
                    >

                        <div
                            class="empty-attendance"
                        >

                            <h3>
                                Unable to Load Attendance
                            </h3>

                            <p>

                                ${escapeHTML(
                                    getStudentName(
                                        child
                                    )
                                )}

                            </p>

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


    }


    catch (error) {

        console.error(
            "Parent attendance error:",
            error
        );


        showError(

            error.message ||

            "Unable to load attendance records."

        );

    }


    finally {

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


        loadPage(
            user
        );

    }

);