import { goBackOr } from "./back-navigation.js";
// ============================================================
// PARENT FEES
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


const auth = getAuth();


const studentsCollection =
    collection(db, "students");


const feesCollection =
    collection(db, "fees");


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


document
    .getElementById("backBtn")
    ?.addEventListener(
        "click",
        () => {

            goBackOr("parent-dashboard.html");

        }
    );


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function getName(student) {

    const name =
        `${student.firstName || ""} ${student.lastName || ""}`
            .trim();


    return (
        name ||
        student.name ||
        student.fullName ||
        "Unnamed Student"
    );

}


function getClass(student) {

    return (
        student.studentClass ||
        student.className ||
        student.class ||
        ""
    );

}


async function getChildren(email) {

    const snapshot =
        await getDocs(
            studentsCollection
        );


    return snapshot.docs
        .map(
            d => ({

                firestoreId: d.id,

                ...d.data()

            })
        )
        .filter(
            student => {

                const parentEmail =
                    String(
                        student.parentEmail ||
                        student.guardianEmail ||
                        ""
                    )
                    .trim()
                    .toLowerCase();


                return (
                    parentEmail ===
                    email
                        .trim()
                        .toLowerCase()
                );

            }
        );

}


async function getFees(studentId) {

    const q =
        query(
            feesCollection,

            where(
                "studentId",
                "==",
                studentId
            )
        );


    const snapshot =
        await getDocs(q);


    return snapshot.docs.map(
        d => ({

            firestoreId: d.id,

            ...d.data()

        })
    );

}


function renderChild(
    student,
    fees
) {

    let total = 0;

    let paid = 0;


    fees.forEach(
        fee => {

            total +=
                Number(
                    fee.amount ||
                    fee.total ||
                    0
                );


            const status =
                String(
                    fee.status ||
                    ""
                )
                .toLowerCase();


            if (
                status === "paid"
            ) {

                paid +=
                    Number(
                        fee.amount ||
                        fee.total ||
                        0
                    );

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


    if (fees.length === 0) {

        html += `

            <div class="empty-fees">

                No fee records have been entered
                for this student yet.

            </div>

        `;

        return html + "</section>";

    }


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
                );


            html += `

                <tr>

                    <td>
                        ${escapeHTML(
                            fee.description ||
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
                        class="${status.toLowerCase()}"
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


    return html + "</section>";

}


async function loadPage(user) {

    try {

        const children =
            await getChildren(
                user.email
            );


        if (
            children.length === 0
        ) {

            container.innerHTML = `

                <div class="empty-fees">

                    No children are linked
                    to this parent account.

                </div>

            `;

            return;

        }


        let html = "";


        for (
            const child of children
        ) {

            const fees =
                await getFees(
                    child.firestoreId
                );


            html +=
                renderChild(
                    child,
                    fees
                );

        }


        container.innerHTML =
            html;

    }

    catch (err) {

        console.error(err);

        error.textContent =
            "Unable to load fee records.";

        error.style.display =
            "block";

    }

    finally {

        loading.style.display =
            "none";

    }

}


onAuthStateChanged(
    auth,
    user => {

        if (!user) {

            window.location.href =
                "parent-login.html";

            return;

        }


        loadPage(user);

    }
);