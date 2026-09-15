// ============================================================
// PARENT REPORT CARDS
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
        "childrenReportContainer"
    );


const loadingMessage =
    document.getElementById(
        "loadingMessage"
    );


const errorMessage =
    document.getElementById(
        "errorMessage"
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
// GET STUDENT NAME
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
// GET CLASS
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
// GET REPORT CARDS
// ============================================================

async function getReportCards(
    studentId
) {

    const reportRef =
        collection(
            db,
            "reportCards"
        );


    const q =
        query(

            reportRef,

            where(
                "studentId",
                "==",
                studentId
            )

        );


    const snapshot =
        await getDocs(q);


    return snapshot.docs.map(
        reportDoc => ({

            firestoreId:
                reportDoc.id,

            ...reportDoc.data()

        })
    );

}


// ============================================================
// NUMBER HELPER
// ============================================================

function numberValue(value) {

    const number =
        Number(value);


    return Number.isFinite(number)
        ? number
        : 0;

}


// ============================================================
// GET GRADE
// ============================================================

function getGrade(
    total
) {

    if (total >= 70)
        return "A";

    if (total >= 60)
        return "B";

    if (total >= 50)
        return "C";

    if (total >= 45)
        return "D";

    if (total >= 40)
        return "E";

    return "F";

}


// ============================================================
// GET REMARK
// ============================================================

function getRemark(
    total
) {

    if (total >= 70)
        return "Excellent";

    if (total >= 60)
        return "Very Good";

    if (total >= 50)
        return "Good";

    if (total >= 45)
        return "Fair";

    if (total >= 40)
        return "Pass";

    return "Fail";

}


// ============================================================
// GET SUBJECT NAME
// ============================================================

function getSubjectName(
    record
) {

    return (

        record.subject ||

        record.subjectName ||

        record.subjectTitle ||

        "Unknown Subject"

    );

}


// ============================================================
// GET CA
// ============================================================

function getCA(
    record
) {

    return numberValue(

        record.ca ??

        record.CA ??

        record.continuousAssessment ??

        record.test ??

        record.assessment

    );

}


// ============================================================
// GET EXAM
// ============================================================

function getExam(
    record
) {

    return numberValue(

        record.exam ??

        record.Exam ??

        record.examScore ??

        record.examination

    );

}


// ============================================================
// GET TOTAL
// ============================================================

function getTotal(
    record
) {

    const storedTotal =

        record.total ??

        record.Total ??

        record.totalScore;


    if (
        storedTotal !== undefined &&
        storedTotal !== null &&
        storedTotal !== ""
    ) {

        return numberValue(
            storedTotal
        );

    }


    return (
        getCA(record) +
        getExam(record)
    );

}


// ============================================================
// GET SESSION
// ============================================================

function getSession(
    records
) {

    if (!records.length) {

        return "N/A";

    }


    const record =
        records[0];


    return (

        record.academicSession ||

        record.session ||

        "N/A"

    );

}


// ============================================================
// GET TERM
// ============================================================

function getTerm(
    records
) {

    if (!records.length) {

        return "N/A";

    }


    const record =
        records[0];


    return (
        record.term ||
        "N/A"
    );

}


// ============================================================
// RENDER REPORT CARD
// ============================================================

function renderReportCard(
    student,
    records
) {

    let grandTotal = 0;


    records.forEach(
        record => {

            grandTotal +=
                getTotal(record);

        }
    );


    const subjectCount =
        records.length;


    const average =
        subjectCount > 0

            ? (
                grandTotal /
                subjectCount
            ).toFixed(2)

            : "0.00";


    const session =
        getSession(
            records
        );


    const term =
        getTerm(
            records
        );


    const position =
        records[0]?.position ||
        records[0]?.studentPosition ||
        records[0]?.rank ||
        "N/A";


    let html = `

        <section
            class="report-card"
        >

            <!-- ========================================= -->
            <!-- STUDENT HEADER -->
            <!-- ========================================= -->

            <div class="student-header">

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

                    <p>
                        Student ID:
                        ${escapeHTML(
                            student.studentId ||
                            student.id ||
                            student.firestoreId ||
                            "N/A"
                        )}
                    </p>

                </div>


                <div class="term-info">

                    <span>
                        ${escapeHTML(
                            session
                        )}
                    </span>

                    <strong>
                        ${escapeHTML(
                            term
                        )}
                    </strong>

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

            <div class="empty-report">

                <h3>
                    No Report Card Available
                </h3>

                <p>
                    No academic records have
                    been entered for this student yet.
                </p>

            </div>

        `;


        return (
            html +
            "</section>"
        );

    }


    // ========================================================
    // SUBJECT TABLE
    // ========================================================

    html += `

        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>

                        <th>
                            #
                        </th>

                        <th>
                            Subject
                        </th>

                        <th>
                            CA
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


    records.forEach(
        (
            record,
            index
        ) => {

            const ca =
                getCA(record);


            const exam =
                getExam(record);


            const total =
                getTotal(record);


            const grade =
                record.grade ||
                getGrade(total);


            const remark =
                record.remark ||
                getRemark(total);


            html += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td class="subject-name">

                        ${escapeHTML(
                            getSubjectName(
                                record
                            )
                        )}

                    </td>

                    <td>
                        ${ca}
                    </td>

                    <td>
                        ${exam}
                    </td>

                    <td>
                        ${total}
                    </td>

                    <td>

                        <span
                            class="grade grade-${escapeHTML(
                                grade
                            )}"
                        >
                            ${escapeHTML(
                                grade
                            )}
                        </span>

                    </td>

                    <td>
                        ${escapeHTML(
                            remark
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


        <!-- ============================================= -->
        <!-- SUMMARY -->
        <!-- ============================================= -->

        <div class="result-summary">

            <div class="result-box">

                <span>
                    Subjects
                </span>

                <strong>
                    ${subjectCount}
                </strong>

            </div>


            <div class="result-box">

                <span>
                    Total Score
                </span>

                <strong>
                    ${grandTotal}
                </strong>

            </div>


            <div class="result-box">

                <span>
                    Average
                </span>

                <strong>
                    ${average}
                </strong>

            </div>


            <div class="result-box">

                <span>
                    Position
                </span>

                <strong>
                    ${escapeHTML(
                        position
                    )}
                </strong>

            </div>

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
            "Loading parent report cards..."
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

                <div class="empty-report">

                    <h3>
                        No Children Linked
                    </h3>

                    <p>
                        No student has been
                        linked to this parent account.
                    </p>

                </div>

            `;

            return;

        }


        // ----------------------------------------------------
        // LOAD REPORTS
        // ----------------------------------------------------

        const reports = [];


        for (
            const child of children
        ) {

            try {

                const records =
                    await getReportCards(
                        child.firestoreId
                    );


                reports.push(

                    renderReportCard(
                        child,
                        records
                    )

                );

            }

            catch (
                childError
            ) {

                console.error(
                    "Report error:",
                    childError
                );


                reports.push(`

                    <section
                        class="report-card"
                    >

                        <div
                            class="empty-report"
                        >

                            <h3>
                                Unable to load report
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
            reports.join("");


    }

    catch (error) {

        console.error(
            "Parent report card error:",
            error
        );


        showError(
            error.message ||
            "Unable to load report cards."
        );

    }

    finally {

        hideLoading();

    }

}


// ============================================================
// FIREBASE AUTH
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