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

        window.location.href =
            "login.html";

        return;
    }


    try {

        // =================================
        // LOAD APPLICANT PROFILE
        // =================================

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
                "Applicant profile not found. Please complete your profile."
            );

            window.location.href =
                "applicant-profile.html";

            return;
        }


        const data =
            userSnap.data();


        // =================================
        // ROLE SECURITY
        // =================================

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


        // =================================
        // APPLICANT NAME
        // =================================

        const applicantName =
            document.getElementById(
                "applicantName"
            );


        if (applicantName) {

            applicantName.textContent =
                data.name ||
                "Applicant";

        }


        // =================================
        // HEADER NAME
        // =================================

        const headerApplicantName =
            document.getElementById(
                "headerApplicantName"
            );


        if (headerApplicantName) {

            headerApplicantName.textContent =
                data.name ||
                "Applicant";

        }


        // =================================
        // EMAIL
        // =================================

        const applicantEmail =
            document.getElementById(
                "applicantEmail"
            );


        if (applicantEmail) {

            applicantEmail.textContent =
                user.email ||
                data.email ||
                "";

        }


        const userEmail =
            document.getElementById(
                "userEmail"
            );


        if (userEmail) {

            userEmail.textContent =
                user.email ||
                data.email ||
                "";

        }


        // =================================
        // PROFILE STATUS
        // =================================

        const profileStatus =
            document.getElementById(
                "profileStatus"
            );


        if (profileStatus) {

            if (
                data.profileCompleted === true
            ) {

                profileStatus.textContent =
                    "Profile Complete";

            } else {

                profileStatus.textContent =
                    "Profile Incomplete";

            }

        }


        // =================================
        // LOAD APPLICATIONS
        // =================================

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

async function loadApplicantApplications(
    uid
) {

    try {

        console.log(
            "Loading applications for:",
            uid
        );


        // =================================
        // QUERY APPLICATIONS
        // =================================

        const applicationsQuery =
            query(
                collection(
                    db,
                    "applications"
                ),
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


        console.log(
            "Applications found:",
            snapshot.size
        );


        // =================================
        // COUNTERS
        // =================================

        let total =
            0;

        let pending =
            0;

        let approved =
            0;

        let rejected =
            0;


        const applications = [];


        snapshot.forEach(
            (item) => {

                const data =
                    item.data();


                applications.push({

                    id:
                        item.id,

                    ...data

                });


                total++;


                const status =
                    String(
                        data.applicationStatus ||
                        data.status ||
                        "Pending"
                    )
                    .trim()
                    .toLowerCase();


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

            }
        );


        // =================================
        // UPDATE DASHBOARD COUNTERS
        // =================================

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


        // =================================
        // SORT NEWEST FIRST
        // =================================

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


        // =================================
        // RECENT APPLICATIONS
        // =================================

        displayRecentApplications(
            applications
        );


    } catch (error) {

        console.error(
            "Application loading error:",
            error
        );

        // Do not show dashboard failure popup
        // because profile itself may be working.

    }

}


// ========================================
// SET TEXT HELPER
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
// DISPLAY RECENT APPLICATIONS
// ========================================

function displayRecentApplications(
    applications
) {

    const container =
        document.getElementById(
            "recentApplications"
        ) ||
        document.getElementById(
            "recentApplicationsList"
        );


    if (!container) {

        console.log(
            "Recent applications container not found."
        );

        return;
    }


    // =================================
    // NO APPLICATIONS
    // =================================

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
                    You haven't submitted any certificate applications yet.
                </p>

                <button
                    onclick="applyCertificate()"
                    class="apply-first-btn"
                >
                    Apply for Your First Certificate
                </button>

            </div>

        `;

        return;
    }


    // =================================
    // SHOW MAX 3 RECENT
    // =================================

    const recent =
        applications.slice(
            0,
            3
        );


    container.innerHTML = "";


    recent.forEach(
        (application) => {

            const status =
                application.applicationStatus ||
                application.status ||
                "Pending";


            const applicationNo =
                application.applicationNo ||
                "Application No. Pending";


            const certificateType =
                application.certificateType ||
                "Certificate";


            const submittedDate =
                formatDate(
                    application.submittedAt
                );


            container.innerHTML += `

                <div class="recent-application-card">

                    <div class="recent-application-icon">
                        📄
                    </div>


                    <div class="recent-application-info">

                        <h3>
                            ${certificateType}
                        </h3>

                        <p>
                            ${applicationNo}
                        </p>

                        <small>
                            Submitted: ${submittedDate}
                        </small>

                    </div>


                    <div class="recent-application-status">

                        <span>
                            ${status}
                        </span>

                    </div>

                </div>

            `;

        }
    );

}


// ========================================
// FORMAT DATE
// ========================================

function formatDate(
    timestamp
) {

    if (
        !timestamp ||
        !timestamp.seconds
    ) {

        return "Recently";

    }


    const date =
        new Date(
            timestamp.seconds * 1000
        );


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

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
// TRACK APPLICATION
// ========================================

window.trackApplication =
    function () {

        window.location.href =
            "my-applications.html";

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
