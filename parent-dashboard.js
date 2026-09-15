// ============================================================
// PARENT DASHBOARD
// Ebenezer Day Star Academy
// ============================================================


import {

    onAuthStateChanged,

    signOut

}
from
"https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";


import {

    collection,

    query,

    where,

    getDocs,

    doc,

    getDoc

}
from
"https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";


import {

    auth,

    db

}
from "./firebase-config.js";




async function loadNotifications() {
    const el = document.getElementById("portalNotifications");
    if (!el) return;
    try {
        const q = await getDocs(query(collection(db, "notifications"), where("audience", "array-contains", "parent")));
        el.innerHTML = q.size ? [...q.docs].map(x => { const n=x.data(); return `<div style="padding:10px 0;border-bottom:1px solid #eee"><strong>${String(n.title||"")}</strong><div>${String(n.message||"")}</div></div>`; }).join("") : "<p>No notifications.</p>";
    } catch (e) { el.textContent = "Unable to load notifications."; }
}

// ============================================================
// ELEMENTS
// ============================================================

const welcomeText =
    document.getElementById(
        "welcomeText"
    );


const parentEmail =
    document.getElementById(
        "parentEmail"
    );


const childrenContainer =
    document.getElementById(
        "childrenContainer"
    );


const childrenCount =
    document.getElementById(
        "childrenCount"
    );


const errorMessage =
    document.getElementById(
        "errorMessage"
    );


const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );



// ============================================================
// ESCAPE HTML
// ============================================================

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



// ============================================================
// SHOW ERROR
// ============================================================

function showError(message) {

    errorMessage.textContent =
        message;

    errorMessage.style.display =
        "block";

}



// ============================================================
// LOAD PARENT PROFILE
// ============================================================

async function loadParentProfile(user) {

    const userRef =
        doc(
            db,
            "users",
            user.uid
        );


    const snapshot =
        await getDoc(
            userRef
        );


    if (!snapshot.exists()) {

        await signOut(auth);

        window.location.href =
            "parent-login.html";

        return;

    }


    const parent =
        snapshot.data();


    if (
        parent.role !==
        "parent"
    ) {

        await signOut(auth);

        window.location.href =
            "parent-login.html";

        return;

    }


    const name =
        parent.name ||
        parent.fullName ||
        parent.displayName ||
        "Parent";


    const email =
        parent.email ||
        user.email ||
        "";


    welcomeText.textContent =
        `Welcome, ${name}`;


    parentEmail.textContent =
        email;


    await loadChildren(
        user.uid
    );

    await loadNotifications();

}



// ============================================================
// LOAD CHILDREN
// ============================================================

async function loadChildren(parentUid) {

    try {

        const studentsRef =
            collection(
                db,
                "students"
            );


        const childrenQuery =
            query(
                studentsRef,

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


        childrenContainer.innerHTML =
            "";


        childrenCount.textContent =
            snapshot.size;


        if (snapshot.empty) {

            childrenContainer.innerHTML = `

                <div class="empty-children">

                    <h3>
                        No children linked
                    </h3>

                    <p>
                        Your account has not yet
                        been linked to a student.
                    </p>

                </div>

            `;

            return;

        }


        snapshot.forEach(
            documentSnapshot => {

                const student =
                    documentSnapshot.data();


                createChildCard(
                    student
                );

            }
        );

    }

    catch(error) {

        console.error(
            "Error loading children:",
            error
        );


        childrenContainer.innerHTML =
            "";


        showError(
            "Unable to load your children's records."
        );

    }

}



// ============================================================
// CREATE CHILD CARD
// ============================================================

function createChildCard(student) {

    const firstName =
        student.firstName ||
        "";


    const lastName =
        student.lastName ||
        "";


    const fullName =
        `${firstName} ${lastName}`
            .trim();


    const initials =
        (
            firstName.charAt(0) +
            lastName.charAt(0)
        )
        .toUpperCase();


    const card =
        document.createElement(
            "article"
        );


    card.className =
        "child-card";


    card.innerHTML = `

        <div class="child-avatar">

            ${escapeHTML(
                initials
            )}

        </div>


        <h3>

            ${escapeHTML(
                fullName
            )}

        </h3>


        <div class="child-info">

            <span>
                Student ID
            </span>

            <span>
                ${escapeHTML(
                    student.id ||
                    "N/A"
                )}
            </span>

        </div>


        <div class="child-info">

            <span>
                Class
            </span>

            <span>
                ${escapeHTML(
                    student.studentClass ||
                    "N/A"
                )}
            </span>

        </div>


        <div class="child-info">

            <span>
                Gender
            </span>

            <span>
                ${escapeHTML(
                    student.gender ||
                    "N/A"
                )}
            </span>

        </div>


        <div class="child-info">

            <span>
                Admission Date
            </span>

            <span>
                ${escapeHTML(
                    student.admissionDate ||
                    "N/A"
                )}
            </span>

        </div>


        <span class="child-status">

            ${escapeHTML(
                student.status ||
                "Active"
            )}

        </span>

    `;


    childrenContainer.appendChild(
        card
    );

}



// ============================================================
// AUTHENTICATION
// ============================================================

onAuthStateChanged(
    auth,
    async function(user) {

        if (!user) {

            window.location.href =
                "parent-login.html";

            return;

        }


        try {

            await loadParentProfile(
                user
            );

        }

        catch(error) {

            console.error(
                "Dashboard error:",
                error
            );


            showError(
                "Unable to load your parent dashboard."
            );

        }

    }
);

// ============================================================
// PARENT SERVICE BUTTONS
// ============================================================

const serviceButtons =
    document.querySelectorAll(
        ".service-card"
    );


serviceButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function () {

                const service =
                    button.dataset.service;


                switch (service) {

                    case "results":

                        openParentService(
                            "results"
                        );

                        break;


                    case "attendance":

                        openParentService(
                            "attendance"
                        );

                        break;


                    case "fees":

                        openParentService(
                            "fees"
                        );

                        break;


                    case "reportCards":

                        openParentService(
                            "reportCards"
                        );

                        break;

                }

            }
        );

    }
);



// ============================================================
// OPEN PARENT SERVICE
// ============================================================

function openParentService(
    service
) {

    switch (service) {

        case "results":

            window.location.href =
                "parent-results.html";

            break;


        case "attendance":

            window.location.href =
                "parent-attendance.html";

            break;


        case "fees":

            window.location.href =
                "parent-fees.html";

            break;


        case "reportCards":

            window.location.href =
                "parent-report-cards.html";

            break;


        default:

            console.error(
                "Unknown parent service:",
                service
            );

    }

}

// ============================================================
// LOGOUT
// ============================================================

logoutBtn.addEventListener(
    "click",
    async function() {

        logoutBtn.disabled =
            true;

        logoutBtn.textContent =
            "Logging out...";


        try {

            await signOut(
                auth
            );


            window.location.href =
                "parent-login.html";

        }

        catch(error) {

            console.error(
                "Logout error:",
                error
            );


            logoutBtn.disabled =
                false;

            logoutBtn.textContent =
                "Logout";

        }

    }
);