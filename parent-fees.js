// ============================================================
// PARENT FEES
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
    document.getElementById(
        "childrenFeesContainer"
    );

const loading =
    document.getElementById(
        "loadingMessage"
    );

const error =
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
        () => {

            goBackOr(
                "parent-dashboard.html"
            );

        }
    );

}


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
// GET STUDENT NAME
// ============================================================

function getName(student) {

    const name =
        `${student.firstName || ""} ${student.lastName || ""}`
            .trim();

    return (

        name ||

        student.name ||

        student.fullName ||

        student.studentName ||

        "Unnamed Student"

    );

}


// ============================================================
// GET STUDENT CLASS
// ============================================================

function getClass(student) {

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


    const userSnapshot =
        await getDoc(
            userRef
        );


    if (
        !userSnapshot.exists()
    ) {

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
// GET CHILDREN
// ============================================================

async function getChildren(
    parentUid
) {

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
// GET FEES FOR CHILD
// ============================================================

async function getFees(
    studentId
) {

    const feesCollection =
        collection(
            db,
            "fees"
        );


    const feesQuery =
        query(

            feesCollection,

            where(
                "studentId",
                "==",
                studentId
            )

        );


    const snapshot =
        await getDocs(
            feesQuery
        );


    return snapshot.docs.map(
        feeDoc => ({

            firestoreId:
                feeDoc.id,

            ...feeDoc.data()

        })
    );

}


// ============================================================
// RENDER CHILD FEES
// ============================================================

function renderChild(
    student,
    fees
) {

    let total = 0;

    let paid = 0;


    fees.forEach(
        fee => {

            const amount =
                Number(
                    fee.amount ||
                    fee.total ||
                    0
                );


            total += amount;


            const status =
                String(
                    fee.status ||
                    ""
                )
                .trim()
                .toLowerCase();


            if (
                status === "paid"
            ) {

                paid += amount;

            }

        }
    );


    const balance =
        total - paid;


    let html = `

        <section class="child-fees-card">

            <div class="child-header">

                <h2>
                    ${escapeHTML(
                        getName(student)
                    )}
                </h2>

                <p>
                    Class:
                    ${escapeHTML(
                        getClass(student)
                    )}
                </p>

            </div>


            <div class="fee-summary">

                <div class="fee-box">

                    <strong>
                        ₦${total.toLocaleString()}
                    </strong>

                    <span>
                        Total Fees
                    </span>

                </div>


                <div class="fee-box">

                    <strong>
                        ₦${paid.toLocaleString()}
                    </strong>

                    <span>
                        Amount Paid
                    </span>

                </div>


                <div class="fee-box">

                    <strong>
                        ₦${balance.toLocaleString()}
                    </strong>

                    <span>
                        Balance
                    </span>

                </div>

            </div>

    `;


    // ========================================================
    // NO FEE RECORDS
    // ========================================================

    if (
        fees.length === 0
    ) {

        html += `

            <div class="empty-fees">

                <h3>
                    No Fee Records
                </h3>

                <p>
                    No fee records have been
                    entered for this student yet.
                </p>

            </div>

        `;


        html += `
            </section>
        `;


        return html;

    }


    // ========================================================
    // FEES TABLE
    // ========================================================

    html += `

        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>

                        <th>
                            Description
                        </th>

                        <th>
                            Session
                        </th>

                        <th>
                            Term
                        </th>

                        <th>
                            Amount
                        </th>

                        <th>
                            Status
                        </th>

                    </tr>

                </thead>


                <tbody>

    `;


    fees.forEach(
        fee => {

            const status =
                String(
                    fee.status ||
                    "Pending"
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
                            fee.description ||
                            fee.title ||
                            fee.feeName ||
                            "School Fees"
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            fee.session ||
                            fee.academicSession ||
                            ""
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            fee.term ||
                            ""
                        )}
                    </td>


                    <td>

                        ₦${Number(
                            fee.amount ||
                            fee.total ||
                            0
                        ).toLocaleString()}

                    </td>


                    <td
                        class="${escapeHTML(
                            statusClass
                        )}"
                    >

                        ${escapeHTML(
                            status
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
            "Loading parent fees..."
        );


        // ----------------------------------------------------
        // VERIFY PARENT
        // ----------------------------------------------------

        await verifyParent(
            user
        );


        console.log(
            "Parent account verified."
        );


        // ----------------------------------------------------
        // GET ONLY THIS PARENT'S CHILDREN
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

            if (container) {

                container.innerHTML = `

                    <div class="empty-fees">

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
        // LOAD FEES
        // ----------------------------------------------------

        const html = [];


        for (
            const child of children
        ) {

            try {

                const fees =
                    await getFees(
                        child.firestoreId
                    );


                html.push(

                    renderChild(
                        child,
                        fees
                    )

                );

            }

            catch (
                childError
            ) {

                console.error(
                    "Fee error for child:",
                    child.firestoreId,
                    childError
                );


                html.push(`

                    <section
                        class="child-fees-card"
                    >

                        <div class="empty-fees">

                            <h3>
                                Unable to Load Fees
                            </h3>

                            <p>
                                ${escapeHTML(
                                    getName(child)
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
                html.join("");

        }

    }

    catch (err) {

        console.error(
            "Parent fees error:",
            err
        );


        if (error) {

            if (
                err.code ===
                "permission-denied"
            ) {

                error.textContent =
                    "Firebase denied access to the fee records. Check the Firestore rules for parent fee access.";

            }

            else {

                error.textContent =
                    err.message ||
                    "Unable to load fee records.";

            }


            error.style.display =
                "block";

        }

    }

    finally {

        if (loading) {

            loading.style.display =
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
            "Parent fees authentication:",
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