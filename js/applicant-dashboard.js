import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ========================================
// AUTHENTICATION
// ========================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;
    }


    try {

        // ====================================
        // LOAD APPLICANT PROFILE
        // ====================================

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        const userSnap =
            await getDoc(userRef);


        if (!userSnap.exists()) {

            alert(
                "Applicant profile not found."
            );

            window.location.href =
                "applicant-profile.html";

            return;
        }


        const data =
            userSnap.data();


        // ====================================
        // ROLE SECURITY
        // ====================================

        if (
            data.role !== "applicant"
        ) {

            alert(
                "Access denied. Applicant account required."
            );

            window.location.href =
                "dashboard.html";

            return;
        }


        // ====================================
        // DISPLAY APPLICANT NAME
        // ====================================

        setText(
            "applicantName",
            data.name || "Applicant"
        );


        setText(
            "headerApplicantName",
            data.name || "Applicant"
        );


        setText(
            "applicantEmail",
            user.email || data.email || ""
        );


        setText(
            "userEmail",
            user.email || data.email || ""
        );


        // ====================================
        // PROFILE STATUS
        // ====================================

        const profileStatus =
            document.getElementById(
                "profileStatus"
            );


        if (profileStatus) {

            profileStatus.textContent =
                data.profileCompleted === true
                    ? "Profile Complete"
                    : "Profile Incomplete";

        }


        // ====================================
        // LOAD APPLICATIONS
        // ====================================

        await loadApplicantApplications(
            user.uid
        );


        console.log(
            "Applicant dashboard loaded successfully."
        );


    } catch (error) {

        console.error(
            "Applicant dashboard error:",
            error
        );


        alert(
            "Unable to load applicant dashboard.\n\n" +
            error.message
        );

    }

});


// ========================================
// LOAD APPLICANT APPLICATIONS
// ========================================

async function loadApplicantApplications(uid) {

    try {

        const applicationsRef =
            collection(
                db,
                "applications"
            );


        // IMPORTANT:
        // Only load applications belonging
        // to the logged-in applicant.

        const applicationsQuery =
            query(
                applicationsRef,
                where(
                    "applicantUid",
                    "==",
                    uid
                )
            );


        const snapshot =
            await getDocs(
                applicationsQuery
            );


        let total = 0;
        let pending = 0;
        let approved = 0;
        let rejected = 0;


        const applications = [];


        snapshot.forEach((item) => {

            const data =
                item.data();


            total++;


            const status =
                String(
                    data.applicationStatus ||
                    data.status ||
                    "Pending"
                ).toLowerCase();


            if (
                status === "pending" ||
                status === "submitted"
            ) {

                pending++;

            }
            else if (
                status === "approved"
            ) {

                approved++;

            }
            else if (
                status === "rejected"
            ) {

                rejected++;

            }


            applications.push({

                id:
                    item.id,

                ...data

            });

        });


        // ====================================
        // UPDATE DASHBOARD COUNTERS
        // ====================================

        setText(
            "totalApplications",
            total
        );


        setText(
            "pendingApplications",
            pending
        );


        setText(
            "approvedApplications",
            approved
        );


        setText(
            "rejectedApplications",
            rejected
        );


        // ====================================
        // RECENT APPLICATIONS
        // ====================================

        applications.sort(
            (a, b) => {

                const aTime =
                    a.submittedAt?.seconds ||
                    0;

                const bTime =
                    b.submittedAt?.seconds ||
                    0;

                return bTime - aTime;

            }
        );


        renderRecentApplications(
            applications
        );


    } catch (error) {

        console.error(
            "Application loading error:",
            error
        );

        // Keep dashboard usable
        // even if application loading fails.

        setText(
            "totalApplications",
            "0"
        );

        setText(
            "pendingApplications",
            "0"
        );

        setText(
            "approvedApplications",
            "0"
        );

        setText(
            "rejectedApplications",
            "0"
        );

    }

}


// ========================================
// RECENT APPLICATIONS
// ========================================

function renderRecentApplications(
    applications
) {

    const container =
        document.getElementById(
            "recentApplications"
        );


    if (!container) {

        return;

    }


    // ====================================
    // NO APPLICATION
    // ====================================

    if (
        applications.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-applications">

                <div class="empty-icon">
                    📄
                </div>

                <h3>
                    No Applications Yet
                </h3>

                <p>
                    You haven't submitted
                    any certificate applications yet.
                </p>

                <button
                    class="btn-primary"
                    onclick="applyCertificate()"
                >
                    Apply for Your First Certificate
                </button>

            </div>

        `;

        return;

    }


    // ====================================
    // SHOW MAX 5 RECENT APPLICATIONS
    // ====================================

    const recent =
        applications.slice(
            0,
            5
        );


    container.innerHTML =
        recent.map(
            (application) => {

                const status =
                    application.applicationStatus ||
                    application.status ||
                    "Pending";


                return `

                    <div class="recent-application">

                        <div>

                            <strong>
                                ${
                                    application.applicationNo ||
                                    "Application"
                                }
                            </strong>

                            <p>
                                ${
                                    application.certificateType ||
                                    "Certificate"
                                }
                            </p>

                        </div>


                        <div class="application-status">

                            ${status}

                        </div>

                    </div>

                `;

            }
        ).join("");

}


// ========================================
// SAFE TEXT HELPER
// ========================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


// ========================================
// APPLY CERTIFICATE
// ========================================

window.applyCertificate =
    function () {

        window.location.href =
            "applicant-application.html";

    };


// ========================================
// MY APPLICATIONS
// ========================================

window.myApplications =
    function () {

        window.location.href =
            "my-applications.html";

    };


// ========================================
// PROFILE
// ========================================

window.openProfile =
    function () {

        window.location.href =
            "applicant-profile.html";

    };


// ========================================
// LOGOUT
// ========================================

window.logout =
    async function () {

        try {

            await signOut(auth);

            window.location.href =
                "login.html";

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

            alert(
                "Unable to logout."
            );

        }

    };
