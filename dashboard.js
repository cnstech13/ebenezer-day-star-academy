import { adminReady, withTimeout } from "./admin-guard.js";
/* =========================================================
   Ebenezer Day Star Academy
   DASHBOARD.JS
   FIRESTORE VERSION
========================================================= */

await adminReady;

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import { db } from "./firebase-config.js";


/* =========================================================
   FIRESTORE COLLECTIONS
========================================================= */

const studentsCollection =
    collection(db, "students");

const teachersCollection =
    collection(db, "teachers");

const classesCollection =
    collection(db, "classes");

const subjectsCollection =
    collection(db, "subjects");


/* =========================================================
   HELPER
========================================================= */

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent =
            value;

    }

}


/* =========================================================
   LOAD ONE COLLECTION COUNT
========================================================= */

async function getCollectionCount(
    collectionRef,
    collectionName
) {

    try {

        const snapshot =
            await withTimeout(getDocs(
                collectionRef
            ));

        console.log(
            `${collectionName}:`,
            snapshot.size
        );

        return snapshot.size;

    }

    catch (error) {

        console.error(
            `Error loading ${collectionName}:`,
            error
        );

        return 0;

    }

}


/* =========================================================
   DASHBOARD STATISTICS
========================================================= */

async function updateDashboardStats() {

    /*
     * Load each collection separately.
     *
     * This prevents one permission error
     * from making every counter show 0.
     */

    const totalStudents =
        await getCollectionCount(
            studentsCollection,
            "Students"
        );


    const totalTeachers =
        await getCollectionCount(
            teachersCollection,
            "Teachers"
        );


    const totalClasses =
        await getCollectionCount(
            classesCollection,
            "Classes"
        );


    const totalSubjects =
        await getCollectionCount(
            subjectsCollection,
            "Subjects"
        );


    /* =========================
       DISPLAY COUNTS
    ========================= */

    setText(
        "totalStudents",
        totalStudents
    );


    setText(
        "totalTeachers",
        totalTeachers
    );


    setText(
        "totalClasses",
        totalClasses
    );


    setText(
        "totalSubjects",
        totalSubjects
    );


    console.log(
        "Dashboard statistics:",
        {
            students: totalStudents,
            teachers: totalTeachers,
            classes: totalClasses,
            subjects: totalSubjects
        }
    );

}


/* =========================================================
   CURRENT DATE
========================================================= */

function displayCurrentDate() {

    const date =
        new Date();


    setText(
        "currentDate",

        date.toLocaleDateString(
            "en-NG",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        )
    );

}


/* =========================================================
   TODAY'S ATTENDANCE
========================================================= */

async function updateTodayAttendance() {

    try {

        const attendanceCollection =
            collection(
                db,
                "attendance"
            );


        const snapshot =
            await withTimeout(getDocs(
                attendanceCollection
            ));


        const today =
            new Date()
                .toISOString()
                .split("T")[0];


        let present = 0;

        let absent = 0;

        let late = 0;


        snapshot.forEach(
            documentSnapshot => {

                const record =
                    documentSnapshot.data();


                if (
                    record.date !==
                    today
                ) {

                    return;

                }


                const status =
                    String(
                        record.status || ""
                    ).toLowerCase();


                if (
                    status ===
                    "present"
                ) {

                    present++;

                }

                else if (
                    status ===
                    "absent"
                ) {

                    absent++;

                }

                else if (
                    status ===
                    "late"
                ) {

                    late++;

                }

            }
        );


        /* =========================
           UPDATE ATTENDANCE CARDS
        ========================= */

        const numbers =
            document.querySelectorAll(
                ".attendance-number"
            );


        if (
            numbers.length >= 3
        ) {

            numbers[0].textContent =
                present;


            numbers[1].textContent =
                absent;


            numbers[2].textContent =
                late;

        }


        console.log(
            "Today's attendance:",
            {
                present,
                absent,
                late
            }
        );

    }

    catch (error) {

        console.error(
            "Error loading attendance:",
            error
        );

    }

}


/* =========================================================
   RECENT ACTIVITIES
========================================================= */

async function loadRecentActivities() {

    const activityList =
        document.getElementById(
            "activityList"
        );


    if (!activityList) {

        return;

    }


    let activities = [];


    try {

        activities =
            JSON.parse(
                localStorage.getItem(
                    "schoolActivities"
                )
            ) || [];

    }

    catch (error) {

        console.error(
            "Error loading activities:",
            error
        );

        activities = [];

    }


    if (
        activities.length === 0
    ) {

        activityList.innerHTML = `

            <div class="empty-activity">

                No recent activities.

            </div>

        `;

        return;

    }


    activityList.innerHTML =
        "";


    activities
        .slice(-5)
        .reverse()
        .forEach(
            activity => {

                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "activity-item";


                div.innerHTML = `

                    <div class="activity-icon">

                        ${escapeHTML(
                            activity.icon ||
                            "📌"
                        )}

                    </div>


                    <div>

                        <strong>

                            ${escapeHTML(
                                activity.title ||
                                ""
                            )}

                        </strong>


                        <small>

                            ${escapeHTML(
                                activity.time ||
                                ""
                            )}

                        </small>

                    </div>

                `;


                activityList.appendChild(
                    div
                );

            }
        );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

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


/* =========================================================
   INITIALIZE DASHBOARD
========================================================= */

async function initializeDashboard() {

    console.log(
        "Ebenezer Day Star Academy Dashboard loading..."
    );


    /* Display date immediately */

    displayCurrentDate();


    /* Load Firestore statistics */

    await updateDashboardStats();


    /* Load today's attendance */

    await updateTodayAttendance();


    /* Load recent activities */

    await loadRecentActivities();


    console.log(
        "Dashboard loaded successfully."
    );

}


/* =========================================================
   START DASHBOARD
========================================================= */

initializeDashboard();