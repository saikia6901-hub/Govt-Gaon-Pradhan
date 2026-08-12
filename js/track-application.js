import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ========================================
// ELEMENTS
// ========================================

const loadingState =
    document.getElementById("loadingState");

const applicationContent =
    document.getElementById("applicationContent");

const errorState =
    document.getElementById("errorState");

const errorMessage =
    document.getElementById("errorMessage");


// ========================================
// GET APPLICATION NUMBER
// ========================================
//
// My Applications page-ৰ পৰা যদি
// ?applicationId=DOCUMENT_ID আহে,
// সেইটো ব্যৱহাৰ কৰিব।
//
// যদি নাহে, latest application দেখুৱাব।
// ========================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const applicationId =
    urlParams.get("applicationId");


// ========================================
// AUTHENTICATION
// ========================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        try {

            // =================================
            // LOAD APPLICATION
            // =================================

            let applicationData = null;


            // ---------------------------------
            // OPTION 1
            // Specific application ID
            // ---------------------------------

            if (applicationId) {

                const snapshot =
                    await getDocs(
                        query(
                            collection(
                                db,
                                "applications"
                            ),
                            where(
                                "__name__",
                                "==",
                                applicationId
                            )
                        )
                    );


                snapshot.forEach(
                    (application) => {

                        const data =
                            application.data();


                        // Security:
                        // Make sure this application
                        // belongs to current applicant.

                        if (
                            data.applicantUid ===
                            user.uid
                        ) {

                            applicationData = {
                                id:
                                    application.id,

                                ...data
                            };

                        }

                    }
                );

            }


            // ---------------------------------
            // OPTION 2
            // If no specific application
            // is supplied, load latest
            // applicant application.
            // ---------------------------------

            if (!applicationData) {

                const q =
                    query(
                        collection(
                            db,
                            "applications"
                        ),

                        where(
                            "applicantUid",
                            "==",
                            user.uid
                        ),

                        orderBy(
                            "submittedAt",
                            "desc"
                        ),

                        limit(1)
                    );


                const snapshot =
                    await getDocs(q);


                if (
                    !snapshot.empty
                ) {

                    const application =
                        snapshot.docs[0];


                    applicationData = {

                        id:
                            application.id,

                        ...application.data()

                    };

                }

            }


            // =================================
            // NOT FOUND
            // =================================

            if (!applicationData) {

                showError(
                    "No application was found for your account."
                );

                return;

            }


            // =================================
            // DISPLAY APPLICATION
            // =================================

            displayApplication(
                applicationData
            );


        } catch (error) {

            console.error(
                "Track application error:",
                error
            );


            showError(
                "Unable to load application. " +
                error.message
            );

        }

    }
);


// ========================================
// DISPLAY APPLICATION
// ========================================

function displayApplication(
    data
) {


    // =================================
    // HIDE LOADING
    // =================================

    if (loadingState) {

        loadingState.style.display =
            "none";

    }


    if (errorState) {

        errorState.style.display =
            "none";

    }


    if (applicationContent) {

        applicationContent.style.display =
            "block";

    }


    // =================================
    // APPLICANT NAME
    // =================================

    setText(
        "applicantName",
        data.applicantName ||
        "Applicant"
    );


    setText(
        "headerApplicantName",
        data.applicantName ||
        "Applicant"
    );


    // =================================
    // APPLICATION NUMBER
    // =================================

    setText(
        "applicationNumber",
        data.applicationNo ||
        data.applicationId ||
        data.id ||
        "—"
    );


    // =================================
    // CERTIFICATE TYPE
    // =================================

    setText(
        "certificateType",
        data.certificateType ||
        "—"
    );


    // =================================
    // LOCATION
    // =================================

    setText(
        "district",
        data.district ||
        "—"
    );


    setText(
        "revenueCircle",
        data.revenueCircle ||
        "—"
    );


    setText(
        "mouza",
        data.mouza ||
        "—"
    );


    setText(
        "lot",
        data.lot ||
        "Not Provided"
    );


    setText(
        "village",
        data.village ||
        "—"
    );


    // =================================
    // PURPOSE
    // =================================

    setText(
        "purpose",
        data.purpose ||
        "—"
    );


    // =================================
    // DATE
    // =================================

    setText(
        "submittedDate",
        formatDate(
            data.submittedAt
        )
    );


    // =================================
    // STATUS
    // =================================

    updateStatus(
        data
    );

}


// ========================================
// SET TEXT SAFELY
// ========================================

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent =
            value;

    }

}


// ========================================
// FORMAT FIRESTORE DATE
// ========================================

function formatDate(
    timestamp
) {

    if (!timestamp) {

        return "—";

    }


    try {

        let date;


        if (
            timestamp.toDate
        ) {

            date =
                timestamp.toDate();

        } else {

            date =
                new Date(timestamp);

        }


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );


    } catch (error) {

        return "—";

    }

}


// ========================================
// APPLICATION STATUS
// ========================================

function updateStatus(
    data
) {

    const status =
        String(
            data.applicationStatus ||
            data.status ||
            "Pending"
        )
        .trim()
        .toLowerCase();


    const submittedIcon =
        document.querySelector(
            "#stepSubmitted .timeline-icon"
        );


    const verificationIcon =
        document.querySelector(
            "#stepVerification .timeline-icon"
        );


    const finalIcon =
        document.getElementById(
            "finalStatusIcon"
        );


    const finalTitle =
        document.getElementById(
            "finalStatusTitle"
        );


    const finalText =
        document.getElementById(
            "finalStatusText"
        );


    const badge =
        document.getElementById(
            "applicationStatusBadge"
        );


    // =================================
    // DEFAULT
    // =================================

    if (submittedIcon) {

        submittedIcon.textContent =
            "✓";

    }


    // =================================
    // SUBMITTED
    // =================================

    if (
        status === "submitted"
    ) {

        setPendingStep(
            verificationIcon
        );

        setPendingStep(
            finalIcon
        );

        if (badge) {

            badge.textContent =
                "Submitted";

        }

        if (finalTitle) {

            finalTitle.textContent =
                "Final Decision";

        }

        if (finalText) {

            finalText.textContent =
                "Your application is awaiting verification.";

        }

        return;

    }


    // =================================
    // PENDING
    // =================================

    if (
        status === "pending" ||
        status === "under verification" ||
        status === "verification"
    ) {

        setActiveStep(
            verificationIcon,
            "✓"
        );

        setPendingStep(
            finalIcon
        );

        if (badge) {

            badge.textContent =
                "Pending";

        }

        if (finalTitle) {

            finalTitle.textContent =
                "Final Decision";

        }

        if (finalText) {

            finalText.textContent =
                "Your application is currently under verification.";

        }

        return;

    }


    // =================================
    // APPROVED
    // =================================

    if (
        status === "approved" ||
        status === "approve"
    ) {

        setActiveStep(
            verificationIcon,
            "✓"
        );

        setActiveStep(
            finalIcon,
            "✓"
        );

        if (badge) {

            badge.textContent =
                "Approved";

        }

        if (finalTitle) {

            finalTitle.textContent =
                "Application Approved";

        }

        if (finalText) {

            finalText.textContent =
                "Your certificate application has been approved.";

        }

        return;

    }


    // =================================
    // REJECTED
    // =================================

    if (
        status === "rejected" ||
        status === "reject"
    ) {

        setActiveStep(
            verificationIcon,
            "✓"
        );


        if (finalIcon) {

            finalIcon.textContent =
                "✕";

            finalIcon.style.background =
                "#dc2626";

            finalIcon.style.color =
                "#ffffff";

        }


        if (badge) {

            badge.textContent =
                "Rejected";

        }


        if (finalTitle) {

            finalTitle.textContent =
                "Application Rejected";

        }


        if (finalText) {

            finalText.textContent =
                data.rejectionReason ||
                "Your application has been rejected by the concerned authority.";

        }

        return;

    }


    // =================================
    // OTHER STATUS
    // =================================

    if (badge) {

        badge.textContent =
            data.applicationStatus ||
            data.status ||
            "Pending";

    }

}


// ========================================
// TIMELINE HELPERS
// ========================================

function setActiveStep(
    element,
    symbol
) {

    if (!element) return;


    element.textContent =
        symbol;


    element.style.background =
        "#046A38";


    element.style.color =
        "#ffffff";

}


function setPendingStep(
    element
) {

    if (!element) return;


    element.style.background =
        "#e5e7eb";


    element.style.color =
        "#6b7280";

}


// ========================================
// NAVIGATION
// ========================================

window.goBackApplications =
    function () {

        window.location.href =
            "my-applications.html";

    };


window.goDashboard =
    function () {

        window.location.href =
            "applicant-dashboard.html";

    };
