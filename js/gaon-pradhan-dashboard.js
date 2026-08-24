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
// GLOBAL DATA
// =====================================================

let currentUser = null;
let gaonPradhanData = null;


// =====================================================
// AUTHENTICATION
// =====================================================

onAuthStateChanged(
    auth,
    async (user) => {

        console.log(
            "GAON PRADHAN AUTH STATE:",
            user
        );


        // =================================================
        // USER NOT LOGGED IN
        // =================================================

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        currentUser = user;


        try {

            // =============================================
            // LOAD USER PROFILE
            // =============================================

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
                    "Official profile not found."
                );

                window.location.href =
                    "login.html";

                return;

            }


            gaonPradhanData =
                userSnap.data();


            console.log(
                "GAON PRADHAN DATA:",
                gaonPradhanData
            );


            // =============================================
            // ROLE SECURITY
            // =============================================

            if (
                gaonPradhanData.role !==
                "gaon_pradhan"
            ) {

                alert(
                    "Access denied. Gaon Pradhan account required."
                );


                // Send other officials to
                // their normal official dashboard.

                window.location.href =
                    "dashboard.html";

                return;

            }


            // =============================================
            // LOAD DASHBOARD
            // =============================================

            loadOfficialInformation();

            loadAssignedLocation();

            loadCurrentDate();

            setupMobileMenu();

            await loadApplications();


            console.log(
                "Gaon Pradhan dashboard loaded successfully."
            );


        }
        catch (error) {

            console.error(
                "GAON PRADHAN DASHBOARD ERROR:",
                error
            );


            alert(
                "Unable to load Gaon Pradhan dashboard.\n\n" +
                error.message
            );

        }

    }
);


// =====================================================
// LOAD OFFICIAL INFORMATION
// =====================================================

function loadOfficialInformation() {

    const name =
        gaonPradhanData.name ||
        currentUser.displayName ||
        "Gaon Pradhan";


    const email =
        currentUser.email ||
        gaonPradhanData.email ||
        "";


    // =============================================
    // HEADER
    // =============================================

    setText(
        "headerGpName",
        name
    );


    setText(
        "dashboardGpName",
        name
    );


    setText(
        "sidebarGpName",
        name
    );


    // =============================================
    // OFFICIAL INFORMATION
    // =============================================

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


    // =============================================
    // AVATARS
    // =============================================

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

}


// =====================================================
// LOAD ASSIGNED LOCATION
// =====================================================

function loadAssignedLocation() {

    const location =
        buildOfficialLocation(
            gaonPradhanData
        );


    setText(
        "officialLocation",
        location ||
        "Official area not assigned"
    );

}


// =====================================================
// BUILD LOCATION
// =====================================================

function buildOfficialLocation(data) {

    const parts = [];


    // =============================================
    // DISTRICT
    // =============================================

    if (data.districtName) {

        parts.push(
            data.districtName
        );

    }
    else if (data.district) {

        parts.push(
            data.district
        );

    }


    // =============================================
    // REVENUE CIRCLE
    // =============================================

    if (data.revenueCircleName) {

        parts.push(
            data.revenueCircleName
        );

    }
    else if (data.revenueCircle) {

        parts.push(
            data.revenueCircle
        );

    }


    // =============================================
    // MOUZA
    // =============================================

    if (data.mouzaName) {

        parts.push(
            data.mouzaName
        );

    }
    else if (data.mouza) {

        parts.push(
            data.mouza
        );

    }


    // =============================================
    // LOT
    // =============================================

    if (data.lotName) {

        parts.push(
            data.lotName
        );

    }
    else if (data.lot) {

        parts.push(
            data.lot
        );

    }


    // =============================================
    // VILLAGE
    // =============================================

    if (data.villageName) {

        parts.push(
            data.villageName
        );

    }
    else if (data.village) {

        parts.push(
            data.village
        );

    }


    return parts.join(
        " → "
    );

}


// =====================================================
// LOAD APPLICATIONS
// =====================================================

async function loadApplications() {

    try {

        const applicationsRef =
            collection(
                db,
                "applications"
            );


        let applicationsQuery;


        // =================================================
        // FIND MOST SPECIFIC ASSIGNED AREA
        // =================================================

        /*
         * Gaon Pradhan should normally have
         * a village assigned.
         *
         * Therefore we first use villageId.
         *
         * If villageId is unavailable,
         * fallback to Lot → Mouza → Revenue Circle → District.
         */


        if (
            gaonPradhanData.villageId
        ) {

            applicationsQuery =
                query(
                    applicationsRef,
                    where(
                        "villageId",
                        "==",
                        gaonPradhanData.villageId
                    )
                );

        }

        else if (
            gaonPradhanData.village
        ) {

            applicationsQuery =
                query(
                    applicationsRef,
                    where(
                        "village",
                        "==",
                        gaonPradhanData.village
                    )
                );

        }

        else if (
            gaonPradhanData.lotId
        ) {

            applicationsQuery =
                query(
                    applicationsRef,
                    where(
                        "lotId",
                        "==",
                        gaonPradhanData.lotId
                    )
                );

        }

        else if (
            gaonPradhanData.mouzaId
        ) {

            applicationsQuery =
                query(
                    applicationsRef,
                    where(
                        "mouzaId",
                        "==",
                        gaonPradhanData.mouzaId
                    )
                );

        }

        else if (
            gaonPradhanData.revenueCircleId
        ) {

            applicationsQuery =
                query(
                    applicationsRef,
                    where(
                        "revenueCircleId",
                        "==",
                        gaonPradhanData.revenueCircleId
                    )
                );

        }

        else if (
            gaonPradhanData.districtId
        ) {

            applicationsQuery =
                query(
                    applicationsRef,
                    where(
                        "districtId",
                        "==",
                        gaonPradhanData.districtId
                    )
                );

        }

        else {

            console.warn(
                "No official location assigned."
            );


            updateStatistics(
                []
            );


            renderRecentApplications(
                []
            );


            return;

        }


        // =================================================
        // GET APPLICATIONS
        // =================================================

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
            "GAON PRADHAN APPLICATIONS:",
            applications
        );


        // =================================================
        // UPDATE STATISTICS
        // =================================================

        updateStatistics(
            applications
        );


        // =================================================
        // SORT APPLICATIONS
        // =================================================

        applications.sort(
            (a, b) => {

                const aTime =
                    getTimestamp(
                        a.submittedAt
                    );

                const bTime =
                    getTimestamp(
                        b.submittedAt
                    );


                return bTime - aTime;

            }
        );


        // =================================================
        // RENDER RECENT APPLICATIONS
        // =================================================

        renderRecentApplications(
            applications
        );

    }
    catch (error) {

        console.error(
            "APPLICATION LOADING ERROR:",
            error
        );


        updateStatistics(
            []
        );


        showApplicationError();

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
                normalizeStatus(
                    application.applicationStatus ||
                    application.status
                );


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


    // =============================================
    // UPDATE UI
    // =============================================

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


    setText(
        "sidebarPendingCount",
        pending
    );


    console.log(
        "GAON PRADHAN STATISTICS:",
        {
            total,
            pending,
            approved,
            rejected
        }
    );

}


// =====================================================
// RENDER RECENT APPLICATIONS
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


    // =============================================
    // NO APPLICATIONS
    // =============================================

    if (
        applications.length === 0
    ) {

        container.innerHTML = `

            <div class="gp-empty-state">

                <div class="gp-empty-icon">
                    📄
                </div>

                <h3>
                    No Applications Yet
                </h3>

                <p>
                    No certificate applications
                    have been submitted for your
                    assigned area.
                </p>

            </div>

        `;

        return;

    }


    // =============================================
    // MAX 5 RECENT
    // =============================================

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
                    normalizeStatus(
                        status
                    );


                const applicationNo =
                    application.applicationNo ||
                    application.id ||
                    "Application";


                const certificateType =
                    application.certificateType ||
                    "Certificate";


                const applicantName =
                    application.applicantName ||
                    "Applicant";


                const date =
                    formatDate(
                        application.submittedAt
                    );


                return `

                    <div
                        class="gp-application-item"
                        data-application-id="${escapeHtml(application.id)}"
                    >

                        <div class="gp-application-icon">
                            📄
                        </div>


                        <div class="gp-application-info">

                            <strong>
                                ${escapeHtml(applicationNo)}
                            </strong>

                            <span>
                                ${escapeHtml(certificateType)}
                            </span>

                            <small>
                                ${escapeHtml(applicantName)}
                                ${date ? " • " + escapeHtml(date) : ""}
                            </small>

                        </div>


                        <div class="gp-application-right">

                            <span
                                class="gp-application-status ${statusClass}"
                            >
                                ${escapeHtml(status)}
                            </span>


                            <button
                                type="button"
                                class="gp-application-view"
                                onclick="viewApplication('${escapeHtml(application.id)}')"
                            >
                                View
                            </button>

                        </div>

                    </div>

                `;

            }
        ).join("");

}


// =====================================================
// VIEW APPLICATION
// =====================================================

window.viewApplication =
    function (applicationId) {

        if (!applicationId) {

            return;

        }


        window.location.href =
            "gaon-pradhan-application-view.html?id=" +
            encodeURIComponent(
                applicationId
            );

    };


// =====================================================
// LOGOUT
// =====================================================

window.logout =
    async function () {

        try {

            const confirmed =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmed) {

                return;

            }


            await signOut(
                auth
            );


            window.location.href =
                "login.html";

        }
        catch (error) {

            console.error(
                "LOGOUT ERROR:",
                error
            );


            alert(
                "Unable to logout. Please try again."
            );

        }

    };


// =====================================================
// CURRENT DATE
// =====================================================

function loadCurrentDate() {

    const date =
        new Date();


    const formatted =
        date.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    setText(
        "currentDate",
        formatted
    );

}


// =====================================================
// MOBILE MENU
// =====================================================

function setupMobileMenu() {

    const menuButton =
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
        !menuButton ||
        !sidebar
    ) {

        return;

    }


    menuButton.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "open"
            );


            if (overlay) {

                overlay.classList.toggle(
                    "active"
                );

            }

        }
    );


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeMobileMenu
        );

    }


    const navItems =
        sidebar.querySelectorAll(
            ".gp-nav-item"
        );


    navItems.forEach(
        (item) => {

            item.addEventListener(
                "click",
                () => {

                    closeMobileMenu();

                }
            );

        }
    );

}


// =====================================================
// CLOSE MOBILE MENU
// =====================================================

function closeMobileMenu() {

    const sidebar =
        document.getElementById(
            "gpSidebar"
        );


    const overlay =
        document.getElementById(
            "gpSidebarOverlay"
        );


    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }


    if (overlay) {

        overlay.classList.remove(
            "active"
        );

    }

}


// =====================================================
// NORMALIZE STATUS
// =====================================================

function normalizeStatus(
    status
) {

    if (!status) {

        return "pending";

    }


    return String(
        status
    )
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            "_"
        );

}


// =====================================================
// GET FIRESTORE TIMESTAMP
// =====================================================

function getTimestamp(
    timestamp
) {

    if (!timestamp) {

        return 0;

    }


    if (
        timestamp.seconds
    ) {

        return (
            timestamp.seconds * 1000
        );

    }


    if (
        timestamp.toDate
    ) {

        return timestamp
            .toDate()
            .getTime();

    }


    if (
        timestamp instanceof Date
    ) {

        return timestamp.getTime();

    }


    return 0;

}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(
    timestamp
) {

    const time =
        getTimestamp(
            timestamp
        );


    if (!time) {

        return "";

    }


    return new Date(
        time
    ).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// =====================================================
// GET INITIALS
// =====================================================

function getInitials(
    name
) {

    if (!name) {

        return "GP";

    }


    const words =
        String(name)
            .trim()
            .split(/\s+/);


    if (
        words.length === 1
    ) {

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
// SHOW APPLICATION ERROR
// =====================================================

function showApplicationError() {

    const container =
        document.getElementById(
            "recentApplications"
        );


    if (!container) {

        return;

    }


    container.innerHTML = `

        <div class="gp-empty-state">

            <div class="gp-empty-icon">
                ⚠️
            </div>

            <h3>
                Unable to Load Applications
            </h3>

            <p>
                Please refresh the page and try again.
            </p>

            <button
                type="button"
                class="gp-view-all"
                onclick="location.reload()"
            >
                Refresh
            </button>

        </div>

    `;

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
// HTML ESCAPE
// =====================================================

function escapeHtml(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
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
