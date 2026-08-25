import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// =====================================================
// ELEMENTS
// =====================================================

const loading =
    document.getElementById("applicationLoading");

const content =
    document.getElementById("applicationContent");

const errorSection =
    document.getElementById("applicationError");

const errorMessage =
    document.getElementById("errorMessage");

const approveButton =
    document.getElementById("approveButton");

const rejectButton =
    document.getElementById("rejectButton");


// =====================================================
// CURRENT DATA
// =====================================================

let currentUser = null;

let currentUserData = null;

let currentApplication = null;

let applicationId = null;


// =====================================================
// GET APPLICATION ID FROM URL
// =====================================================

function getApplicationId() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get("id");
}


// =====================================================
// AUTHENTICATION
// =====================================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        currentUser = user;


        try {

            // =========================================
            // LOAD OFFICIAL PROFILE
            // =========================================

            const userRef =
                doc(
                    db,
                    "users",
                    user.uid
                );


            const userSnap =
                await getDoc(userRef);


            if (!userSnap.exists()) {

                showError(
                    "Official profile not found."
                );

                await signOut(auth);

                return;

            }


            currentUserData =
                userSnap.data();


            // =========================================
            // ROLE SECURITY
            // =========================================

            if (
                currentUserData.role !==
                "gaon_pradhan"
            ) {

                showError(
                    "Access denied. Gaon Pradhan account required."
                );

                return;

            }


            // =========================================
            // DISPLAY OFFICIAL INFORMATION
            // =========================================

            setText(
                "headerGpName",
                currentUserData.name ||
                "Gaon Pradhan"
            );


            setText(
                "sidebarGpName",
                currentUserData.name ||
                "Gaon Pradhan"
            );


            const initials =
                getInitials(
                    currentUserData.name ||
                    "Gaon Pradhan"
                );


            setText(
                "headerGpAvatar",
                initials
            );


            setText(
                "sidebarGpAvatar",
                initials
            );


            // =========================================
            // CURRENT DATE
            // =========================================

            setCurrentDate();


            // =========================================
            // GET APPLICATION ID
            // =========================================

            applicationId =
                getApplicationId();


            if (!applicationId) {

                showError(
                    "Application ID is missing."
                );

                return;

            }


            // =========================================
            // LOAD APPLICATION
            // =========================================

            await loadApplication(
                applicationId
            );


        } catch (error) {

            console.error(
                "Application review error:",
                error
            );


            showError(
                error.message ||
                "Unable to load application."
            );

        }

    }
);


// =====================================================
// LOAD APPLICATION
// =====================================================

async function loadApplication(id) {

    try {

        showLoading();


        const applicationRef =
            doc(
                db,
                "applications",
                id
            );


        const applicationSnap =
            await getDoc(
                applicationRef
            );


        if (!applicationSnap.exists()) {

            showError(
                "Application not found."
            );

            return;

        }


        const data =
            applicationSnap.data();


        currentApplication = data;


        // =========================================
        // AREA SECURITY
        // =========================================

        if (
            !isApplicationInOfficialArea(
                data,
                currentUserData
            )
        ) {

            showError(
                "Access denied. This application does not belong to your assigned area."
            );

            return;

        }


        // =========================================
        // RENDER APPLICATION
        // =========================================

        renderApplication(
            id,
            data
        );


        hideLoading();


    } catch (error) {

        console.error(
            "Load application error:",
            error
        );


        showError(
            error.message ||
            "Unable to load application."
        );

    }

}


// =====================================================
// AREA SECURITY
// =====================================================

function isApplicationInOfficialArea(
    application,
    official
) {

    /*
       We compare the applicant's
       selected location with the
       Gaon Pradhan's assigned location.

       Village is the most important
       level for Gaon Pradhan.
    */


    // =========================================
    // VILLAGE CHECK
    // =========================================

    const officialVillageId =
        official.villageId ||
        "";

    const applicationVillageId =
        application.villageId ||
        "";


    if (
        officialVillageId &&
        applicationVillageId
    ) {

        return (
            officialVillageId ===
            applicationVillageId
        );

    }


    // =========================================
    // VILLAGE NAME FALLBACK
    // =========================================

    const officialVillage =
        normalize(
            official.villageName ||
            official.village ||
            ""
        );


    const applicationVillage =
        normalize(
            application.village ||
            application.villageName ||
            ""
        );


    if (
        officialVillage &&
        applicationVillage
    ) {

        return (
            officialVillage ===
            applicationVillage
        );

    }


    /*
       If village information is not
       available in official profile,
       fall back to broader location.
    */


    const officialMouzaId =
        official.mouzaId ||
        "";

    const applicationMouzaId =
        application.mouzaId ||
        "";


    if (
        officialMouzaId &&
        applicationMouzaId
    ) {

        return (
            officialMouzaId ===
            applicationMouzaId
        );

    }


    return true;

}


// =====================================================
// RENDER APPLICATION
// =====================================================

function renderApplication(
    id,
    data
) {

    // =========================================
    // APPLICATION NUMBER
    // =========================================

    setText(
        "applicationNo",
        data.applicationNo ||
        id
    );


    // =========================================
    // SUBMITTED DATE
    // =========================================

    setText(
        "submittedDate",
        "Submitted " +
        formatDate(
            data.submittedAt
        )
    );


    // =========================================
    // STATUS
    // =========================================

    updateStatus(
        data.applicationStatus ||
        data.status ||
        "Pending"
    );


    // =========================================
    // APPLICANT
    // =========================================

    setText(
        "applicantName",
        data.applicantName ||
        "—"
    );


    setText(
        "fatherName",
        data.fatherName ||
        "—"
    );


    setText(
        "motherName",
        data.motherName ||
        "—"
    );


    setText(
        "mobile",
        data.mobile ||
        "—"
    );


    setText(
        "applicantEmail",
        data.applicantEmail ||
        "—"
    );


    // =========================================
    // CERTIFICATE
    // =========================================

    setText(
        "certificateType",
        data.certificateType ||
        "—"
    );


    setText(
        "purpose",
        data.purpose ||
        "—"
    );


    // =========================================
    // LOCATION
    // =========================================

    setText(
        "district",
        data.district ||
        data.districtName ||
        "—"
    );


    setText(
        "revenueCircle",
        data.revenueCircle ||
        data.revenueCircleName ||
        "—"
    );


    setText(
        "mouza",
        data.mouza ||
        data.mouzaName ||
        "—"
    );


    setText(
        "lot",
        data.lot ||
        data.lotName ||
        "Not Assigned"
    );


    setText(
        "village",
        data.village ||
        data.villageName ||
        "—"
    );


    // =========================================
    // REJECTION REASON
    // =========================================

    if (
        data.rejectionReason
    ) {

        const section =
            document.getElementById(
                "rejectionSection"
            );


        setText(
            "rejectionReason",
            data.rejectionReason
        );


        if (section) {

            section.style.display =
                "block";

        }

    }


    // =========================================
    // ACTION BUTTONS
    // =========================================

    const status =
        normalize(
            data.applicationStatus ||
            data.status ||
            "Pending"
        );


    if (
        status === "approved" ||
        status === "rejected"
    ) {

        if (approveButton) {

            approveButton.style.display =
                "none";

        }


        if (rejectButton) {

            rejectButton.style.display =
                "none";

        }

    }
    else {

        if (approveButton) {

            approveButton.style.display =
                "inline-flex";

        }


        if (rejectButton) {

            rejectButton.style.display =
                "inline-flex";

        }

    }


    // =========================================
    // SHOW CONTENT
    // =========================================

    if (content) {

        content.style.display =
            "block";

    }

}


// =====================================================
// UPDATE STATUS UI
// =====================================================

function updateStatus(status) {

    const element =
        document.getElementById(
            "applicationStatus"
        );


    if (!element) {

        return;

    }


    const cleanStatus =
        String(
            status ||
            "Pending"
        );


    element.textContent =
        cleanStatus;


    element.classList.remove(
        "pending",
        "approved",
        "rejected"
    );


    const normalized =
        cleanStatus.toLowerCase();


    if (
        normalized === "approved"
    ) {

        element.classList.add(
            "approved"
        );

    }
    else if (
        normalized === "rejected"
    ) {

        element.classList.add(
            "rejected"
        );

    }
    else {

        element.classList.add(
            "pending"
        );

    }

}


// =====================================================
// APPROVE APPLICATION
// =====================================================

if (approveButton) {

    approveButton.addEventListener(
        "click",
        async () => {

            if (!currentApplication) {

                return;

            }


            const confirmed =
                confirm(
                    "Are you sure you want to APPROVE this application?"
                );


            if (!confirmed) {

                return;

            }


            try {

                approveButton.disabled =
                    true;

                rejectButton.disabled =
                    true;


                approveButton.textContent =
                    "Approving...";


                const applicationRef =
                    doc(
                        db,
                        "applications",
                        applicationId
                    );


                await updateDoc(
                    applicationRef,
                    {

                        applicationStatus:
                            "Approved",

                        status:
                            "Approved",

                        approvedBy:
                            currentUser.uid,

                        approvedByName:
                            currentUserData.name ||
                            "",

                        approvedAt:
                            serverTimestamp()

                    }
                );


                currentApplication.applicationStatus =
                    "Approved";


                currentApplication.status =
                    "Approved";


                updateStatus(
                    "Approved"
                );


                approveButton.style.display =
                    "none";

                rejectButton.style.display =
                    "none";


                alert(
                    "Application approved successfully."
                );


            } catch (error) {

                console.error(
                    "Approval error:",
                    error
                );


                alert(
                    "Unable to approve application.\n\n" +
                    error.message
                );


                approveButton.disabled =
                    false;

                rejectButton.disabled =
                    false;

                approveButton.textContent =
                    "✓ Approve Application";

            }

        }
    );

}


// =====================================================
// REJECT APPLICATION
// =====================================================

if (rejectButton) {

    rejectButton.addEventListener(
        "click",
        async () => {

            if (!currentApplication) {

                return;

            }


            const reason =
                prompt(
                    "Please enter the reason for rejecting this application:"
                );


            if (reason === null) {

                return;

            }


            const cleanReason =
                reason.trim();


            if (!cleanReason) {

                alert(
                    "Rejection reason is required."
                );

                return;

            }


            const confirmed =
                confirm(
                    "Are you sure you want to REJECT this application?"
                );


            if (!confirmed) {

                return;

            }


            try {

                approveButton.disabled =
                    true;

                rejectButton.disabled =
                    true;


                rejectButton.textContent =
                    "Rejecting...";


                const applicationRef =
                    doc(
                        db,
                        "applications",
                        applicationId
                    );


                await updateDoc(
                    applicationRef,
                    {

                        applicationStatus:
                            "Rejected",

                        status:
                            "Rejected",

                        rejectionReason:
                            cleanReason,

                        rejectedBy:
                            currentUser.uid,

                        rejectedByName:
                            currentUserData.name ||
                            "",

                        rejectedAt:
                            serverTimestamp()

                    }
                );


                currentApplication.applicationStatus =
                    "Rejected";


                currentApplication.status =
                    "Rejected";


                currentApplication.rejectionReason =
                    cleanReason;


                updateStatus(
                    "Rejected"
                );


                setText(
                    "rejectionReason",
                    cleanReason
                );


                const rejectionSection =
                    document.getElementById(
                        "rejectionSection"
                    );


                if (rejectionSection) {

                    rejectionSection.style.display =
                        "block";

                }


                approveButton.style.display =
                    "none";

                rejectButton.style.display =
                    "none";


                alert(
                    "Application rejected successfully."
                );


            } catch (error) {

                console.error(
                    "Rejection error:",
                    error
                );


                alert(
                    "Unable to reject application.\n\n" +
                    error.message
                );


                approveButton.disabled =
                    false;

                rejectButton.disabled =
                    false;

                rejectButton.textContent =
                    "✕ Reject Application";

            }

        }
    );

}


// =====================================================
// SHOW LOADING
// =====================================================

function showLoading() {

    if (loading) {

        loading.style.display =
            "block";

    }


    if (content) {

        content.style.display =
            "none";

    }


    if (errorSection) {

        errorSection.style.display =
            "none";

    }

}


// =====================================================
// SHOW ERROR
// =====================================================

function showError(message) {

    if (loading) {

        loading.style.display =
            "none";

    }


    if (content) {

        content.style.display =
            "none";

    }


    if (errorSection) {

        errorSection.style.display =
            "block";

    }


    setText(
        "errorMessage",
        message
    );

}


// =====================================================
// SAFE TEXT
// =====================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value ??
            "—";

    }

}


// =====================================================
// NORMALIZE
// =====================================================

function normalize(value) {

    return String(
        value ||
        ""
    )
    .trim()
    .toLowerCase();

}


// =====================================================
// DATE
// =====================================================

function formatDate(timestamp) {

    if (!timestamp) {

        return "—";

    }


    let date;


    if (
        timestamp.seconds
    ) {

        date =
            new Date(
                timestamp.seconds * 1000
            );

    }
    else if (
        timestamp.toDate
    ) {

        date =
            timestamp.toDate();

    }
    else {

        return "—";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// =====================================================
// CURRENT DATE
// =====================================================

function setCurrentDate() {

    const element =
        document.getElementById(
            "currentDate"
        );


    if (!element) {

        return;

    }


    const now =
        new Date();


    element.textContent =
        now.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

}


// =====================================================
// INITIALS
// =====================================================

function getInitials(name) {

    const parts =
        String(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (!parts.length) {

        return "GP";

    }


    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();

}


// =====================================================
// LOGOUT
// =====================================================

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


// =====================================================
// MOBILE SIDEBAR
// =====================================================

const mobileMenuBtn =
    document.getElementById(
        "mobileMenuBtn"
    );

const sidebar =
    document.getElementById(
        "gpSidebar"
    );

const overlay =
    document.getElementById(
        "gpSidebarOverlay"
    );


if (
    mobileMenuBtn &&
    sidebar
) {

    mobileMenuBtn.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "open"
            );


            if (overlay) {

                overlay.classList.toggle(
                    "show"
                );

            }

        }
    );

}


if (overlay) {

    overlay.addEventListener(
        "click",
        () => {

            sidebar?.classList.remove(
                "open"
            );

            overlay.classList.remove(
                "show"
            );

        }
    );

}
