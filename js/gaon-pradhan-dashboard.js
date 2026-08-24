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


// =====================================================
// AUTHENTICATION
// =====================================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;
    }


    try {

        console.log("GAON PRADHAN USER:", user.uid);


        // =================================================
        // LOAD USER PROFILE
        // =================================================

        const userRef = doc(
            db,
            "users",
            user.uid
        );

        const userSnap = await getDoc(userRef);


        if (!userSnap.exists()) {

            alert("Official profile not found.");

            await signOut(auth);

            window.location.href = "login.html";

            return;
        }


        const userData = userSnap.data();

        console.log(
            "GAON PRADHAN PROFILE:",
            userData
        );


        // =================================================
        // ROLE SECURITY
        // =================================================

        if (userData.role !== "gaon_pradhan") {

            alert(
                "Access denied. Gaon Pradhan account required."
            );

            // IMPORTANT:
            // Do not allow another official role
            // to open this dashboard directly.

            window.location.href = getDashboardByRole(
                userData.role
            );

            return;
        }


        // =================================================
        // DISPLAY USER INFORMATION
        // =================================================

        const name =
            userData.name ||
            user.displayName ||
            "Gaon Pradhan";


        const email =
            user.email ||
            userData.email ||
            "";


        setText(
            "headerGpName",
            name
        );


        setText(
            "sidebarGpName",
            name
        );


        setText(
            "dashboardGpName",
            name
        );


        setText(
            "officialName",
            name
        );


        setText(
            "officialEmail",
            email
        );


        setText(
            "officialRole",
            "Gaon Pradhan"
        );


        // =================================================
        // AVATAR
        // =================================================

        const initials =
            getInitials(name);


        setText(
            "headerGpAvatar",
            initials
        );


        setText(
            "sidebarGpAvatar",
            initials
        );


        // =================================================
        // OFFICIAL LOCATION
        // =================================================

        const location =
            buildOfficialLocation(
                userData
            );


        setText(
            "officialLocation",
            location ||
            "Official area not assigned"
        );


        // =================================================
        // CURRENT DATE
        // =================================================

        setCurrentDate();


        // =================================================
        // LOAD APPLICATIONS
        // =================================================

        await loadApplications(
            userData
        );


        console.log(
            "Gaon Pradhan Dashboard loaded successfully."
        );


    }
    catch (error) {

        console.error(
            "GAON PRADHAN DASHBOARD ERROR:",
            error
        );


        alert(
            "Unable to load Gaon Pradhan Dashboard.\n\n" +
            error.message
        );

    }

});


// =====================================================
// LOAD APPLICATIONS
// =====================================================

async function loadApplications(userData) {

    try {

        const applicationsRef =
            collection(
                db,
                "applications"
            );


        /*
         * IMPORTANT
         *
         * Initially we load applications based on
         * the assigned village.
         *
         * This means Gaon Pradhan will only see
         * applications from their assigned village.
         */


        let applicationsQuery;


        if (userData.villageId) {

            applicationsQuery =
                query(
                    applicationsRef,
                    where(
                        "villageId",
                        "==",
                        userData.villageId
                    )
                );

        }

        else if (userData.village) {

            applicationsQuery =
                query(
                    applicationsRef,
                    where(
                        "village",
                        "==",
                        userData.village
                    )
                );

        }

        else {

            console.warn(
                "Gaon Pradhan village is not assigned."
            );


            updateStatistics([]);

            renderRecentApplications([]);

            return;
        }


        const snapshot =
            await getDocs(
                applicationsQuery
            );


        const applications = [];


        snapshot.forEach(
            (applicationDoc) => {

                applications.push({

                    id:
                        applicationDoc.id,

                    ...applicationDoc.data()

                });

            }
        );


        console.log(
            "Applications:",
            applications
        );


        // =================================================
        // STATISTICS
        // =================================================

        updateStatistics(
            applications
        );


        // =================================================
        // RECENT APPLICATIONS
        // =================================================

        renderRecentApplications(
            applications
        );


    }
    catch (error) {

        console.error(
            "APPLICATION LOAD ERROR:",
            error
        );


        updateStatistics([]);

        renderRecentApplications([]);

    }

}


// =====================================================
// UPDATE STATISTICS
// =====================================================

function updateStatistics(
    applications
) {

    let total = 0;

    let pending = 0;

    let approved = 0;

    let rejected = 0;


    applications.forEach(
        (application) => {

            total++;


            const status =
                String(
                    application.applicationStatus ||
                    application.status ||
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

        }
    );


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


    // Sidebar pending badge

    setText(
        "sidebarPendingCount",
        pending
    );

}


// =====================================================
// RECENT APPLICATIONS
// =====================================================

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


    // =================================================
    // NO APPLICATION
    // =================================================

    if (
        applications.length === 0
    ) {

        container.innerHTML = `

            <div class="gp-empty-state">

                <div class="gp-empty-icon">
                    📄
                </div>

                <h3>
                    No Applications Found
                </h3>

                <p>
                    No certificate applications
                    have been submitted for your
                    assigned village yet.
                </p>

            </div>

        `;

        return;
    }


    // =================================================
    // SORT BY SUBMITTED DATE
    // =================================================

    applications.sort(
        (a, b) => {

            const aTime =
                a.submittedAt?.seconds || 0;

            const bTime =
                b.submittedAt?.seconds || 0;

            return bTime - aTime;

        }
    );


    // Show maximum 5

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


                const statusClass =
                    String(status)
                        .toLowerCase()
                        .replace(
                            /\s+/g,
                            "-"
                        );


                return `

                    <div class="gp-application-item">

                        <div class="gp-application-main">

                            <strong>
                                ${
                                    application.applicationNo ||
                                    "Application"
                                }
                            </strong>

                            <span>
                                ${
                                    application.applicantName ||
                                    "Applicant"
                                }
                            </span>

                            <small>
                                ${
                                    application.certificateType ||
                                    "Certificate"
                                }
                            </small>

                        </div>


                        <div
                            class="gp-application-status ${statusClass}"
                        >
                            ${status}
                        </div>

                    </div>

                `;

            }
        ).join("");

}


// =====================================================
// BUILD OFFICIAL LOCATION
// =====================================================

function buildOfficialLocation(
    userData
) {

    const parts = [];


    if (
        userData.districtName
    ) {

        parts.push(
            userData.districtName
        );

    }
    else if (
        userData.district
    ) {

        parts.push(
            userData.district
        );

    }


    if (
        userData.revenueCircleName
    ) {

        parts.push(
            userData.revenueCircleName
        );

    }
    else if (
        userData.revenueCircle
    ) {

        parts.push(
            userData.revenueCircle
        );

    }


    if (
        userData.mouzaName
    ) {

        parts.push(
            userData.mouzaName
        );

    }
    else if (
        userData.mouza
    ) {

        parts.push(
            userData.mouza
        );

    }


    if (
        userData.lotName
    ) {

        parts.push(
            userData.lotName
        );

    }
    else if (
        userData.lot
    ) {

        parts.push(
            userData.lot
        );

    }


    if (
        userData.villageName
    ) {

        parts.push(
            userData.villageName
        );

    }
    else if (
        userData.village
    ) {

        parts.push(
            userData.village
        );

    }


    return parts.join(
        " → "
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


    const today =
        new Date();


    const options = {

        weekday: "long",

        year: "numeric",

        month: "long",

        day: "numeric"

    };


    element.textContent =
        today.toLocaleDateString(
            "en-IN",
            options
        );

}


// =====================================================
// INITIALS
// =====================================================

function getInitials(
    name
) {

    if (!name) {

        return "GP";
    }


    const words =
        name
            .trim()
            .split(/\s+/);


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();

}


// =====================================================
// SAFE TEXT
// =====================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value ?? "";

    }

}


// =====================================================
// ROLE DASHBOARD REDIRECTION
// =====================================================

function getDashboardByRole(
    role
) {

    switch (role) {

        case "super_admin":

            return "dashboard.html";


        case "circle_officer":

            return "circle-officer-dashboard.html";


        case "sk":

            return "sk-dashboard.html";


        case "mandal":

            return "mandal-dashboard.html";


        case "gaon_pradhan":

            return "gaon-pradhan-dashboard.html";


        case "applicant":

            return "applicant-dashboard.html";


        default:

            return "login.html";

    }

}


// =====================================================
// LOGOUT
// =====================================================

window.logout =
    async function () {

        try {

            await signOut(
                auth
            );


            window.location.href =
                "login.html";

        }
        catch (error) {

            console.error(
                "Logout error:",
                error
            );


            alert(
                "Unable to logout. Please try again."
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
    sidebar &&
    overlay
) {

    mobileMenuBtn.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "open"
            );

            overlay.classList.toggle(
                "active"
            );

        }
    );


    overlay.addEventListener(
        "click",
        () => {

            sidebar.classList.remove(
                "open"
            );

            overlay.classList.remove(
                "active"
            );

        }
    );

}
