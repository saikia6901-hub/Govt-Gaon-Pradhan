import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ========================================
// ELEMENTS
// ========================================

const applicationsList =
    document.getElementById(
        "applicationsList"
    );

const loadingMessage =
    document.getElementById(
        "loadingMessage"
    );

const emptyMessage =
    document.getElementById(
        "emptyMessage"
    );


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
        // USER PROFILE
        // =================================

        const userRef =
            await getDocs(
                query(
                    collection(db, "users"),
                    where(
                        "uid",
                        "==",
                        user.uid
                    )
                )
            );


        if (!userRef.empty) {

            const userData =
                userRef.docs[0].data();


            const applicantName =
                document.getElementById(
                    "applicantName"
                );


            if (applicantName) {

                applicantName.textContent =
                    userData.name ||
                    "Applicant";

            }

        }


        const userEmail =
            document.getElementById(
                "userEmail"
            );


        if (userEmail) {

            userEmail.textContent =
                user.email || "";

        }


        // =================================
        // LOAD APPLICATIONS
        // =================================

        const applicationQuery =
            query(
                collection(
                    db,
                    "applications"
                ),
                where(
                    "applicantUid",
                    "==",
                    user.uid
                )
            );


        const snapshot =
            await getDocs(
                applicationQuery
            );


        loadingMessage.style.display =
            "none";


        if (snapshot.empty) {

            emptyMessage.style.display =
                "block";

            updateSummary([]);

            return;

        }


        // =================================
        // GET DATA
        // =================================

        const applications = [];


        snapshot.forEach((item) => {

            applications.push({

                id:
                    item.id,

                ...item.data()

            });

        });


        // =================================
        // NEWEST FIRST
        // =================================

        applications.sort(
            (a, b) => {

                const aTime =
                    a.submittedAt?.seconds || 0;

                const bTime =
                    b.submittedAt?.seconds || 0;

                return bTime - aTime;

            }
        );


        // =================================
        // SUMMARY
        // =================================

        updateSummary(
            applications
        );


        // =================================
        // DISPLAY
        // =================================

        applicationsList.innerHTML =
            "";


        applications.forEach(
            (application) => {

                applicationsList.innerHTML +=
                    createApplicationCard(
                        application
                    );

            }
        );


    } catch (error) {

        console.error(
            "My applications error:",
            error
        );


        loadingMessage.textContent =
            "Unable to load applications.";

    }

});


// ========================================
// SUMMARY
// ========================================

function updateSummary(
    applications
) {

    let pending = 0;

    let approved = 0;

    let rejected = 0;


    applications.forEach(
        (application) => {

            const status =
                String(
                    application.applicationStatus ||
                    application.status ||
                    ""
                ).toLowerCase();


            if (
                status === "approved"
            ) {

                approved++;

            }
            else if (
                status === "rejected"
            ) {

                rejected++;

            }
            else {

                pending++;

            }

        }
    );


    document.getElementById(
        "totalApplications"
    ).textContent =
        applications.length;


    document.getElementById(
        "pendingApplications"
    ).textContent =
        pending;


    document.getElementById(
        "approvedApplications"
    ).textContent =
        approved;


    document.getElementById(
        "rejectedApplications"
    ).textContent =
        rejected;

}


// ========================================
// APPLICATION CARD
// ========================================

function createApplicationCard(
    application
) {

    const status =
        application.applicationStatus ||
        application.status ||
        "Pending";


    const statusClass =
        getStatusClass(status);


    const applicationNo =
        application.applicationNo ||
        "Application Number Pending";


    const certificateType =
        application.certificateType ||
        "Certificate";


    const location =
        [
            application.village,
            application.mouza,
            application.revenueCircle,
            application.district
        ]
        .filter(Boolean)
        .join(", ");


    const submittedDate =
        formatDate(
            application.submittedAt
        );


    return `

        <div class="application-card">

            <div class="application-top">

                <div>

                    <div class="application-number">
                        ${applicationNo}
                    </div>

                    <div class="application-type">
                        ${certificateType}
                    </div>

                </div>


                <span class="status ${statusClass}">
                    ${status}
                </span>

            </div>


            <div class="application-details">


                <div class="detail-item">

                    <span>
                        Applicant
                    </span>

                    <strong>
                        ${application.applicantName || "Applicant"}
                    </strong>

                </div>


                <div class="detail-item">

                    <span>
                        Location
                    </span>

                    <strong>
                        ${location || "Not available"}
                    </strong>

                </div>


                <div class="detail-item">

                    <span>
                        Submitted On
                    </span>

                    <strong>
                        ${submittedDate}
                    </strong>

                </div>


            </div>


            <div class="application-actions">

                <button
                    class="track-btn"
                    onclick="trackApplication('${application.id}')"
                >
                    View Application Status →
                </button>

            </div>

        </div>

    `;

}


// ========================================
// STATUS CLASS
// ========================================

function getStatusClass(
    status
) {

    const value =
        String(status)
        .toLowerCase();


    if (
        value === "approved"
    ) {

        return "status-approved";

    }


    if (
        value === "rejected"
    ) {

        return "status-rejected";

    }


    if (
        value.includes("review")
    ) {

        return "status-review";

    }


    return "status-pending";

}


// ========================================
// DATE
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
// TRACK APPLICATION
// ========================================

window.trackApplication =
    function (id) {

        localStorage.setItem(
            "trackingApplicationId",
            id
        );

        window.location.href =
            "track-application.html";

    };
