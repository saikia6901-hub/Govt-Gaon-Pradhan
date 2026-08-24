import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// =====================================================
// GLOBAL DATA
// =====================================================

let allApplications = [];

let filteredApplications = [];

let currentUser = null;

let officialData = null;


// =====================================================
// DOM READY
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    setupFilters();

    setupDate();

    setupMobileMenu();

});


// =====================================================
// AUTHENTICATION
// =====================================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }


    currentUser = user;


    try {

        // =============================================
        // LOAD OFFICIAL PROFILE
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

            await signOut(auth);

            window.location.href =
                "login.html";

            return;

        }


        officialData =
            userSnap.data();


        // =============================================
        // ROLE SECURITY
        // =============================================

        if (
            officialData.role !==
            "gaon_pradhan"
        ) {

            alert(
                "Access denied. Gaon Pradhan account required."
            );

            window.location.href =
                "dashboard.html";

            return;

        }


        // =============================================
        // DISPLAY OFFICIAL INFORMATION
        // =============================================

        const officialName =
            officialData.name ||
            user.displayName ||
            "Gaon Pradhan";


        setText(
            "headerGpName",
            officialName
        );


        setText(
            "sidebarGpName",
            officialName
        );


        setText(
            "officialName",
            officialName
        );


        setText(
            "officialEmail",
            user.email ||
            officialData.email ||
            "—"
        );


        setText(
            "officialRole",
            "Gaon Pradhan"
        );


        // =============================================
        // AVATAR
        // =============================================

        const initials =
            getInitials(
                officialName
            );


        setText(
            "headerGpAvatar",
            initials
        );


        setText(
            "sidebarGpAvatar",
            initials
        );


        // =============================================
        // LOCATION
        // =============================================

        const location =
            buildOfficialLocation(
                officialData
            );


        setText(
            "officialLocation",
            location ||
            "Official area not assigned"
        );


        // =============================================
        // LOAD APPLICATIONS
        // =============================================

        await loadApplications();


        console.log(
            "Gaon Pradhan applications loaded successfully."
        );


    }
    catch (error) {

        console.error(
            "GAON PRADHAN APPLICATION ERROR:",
            error
        );


        const container =
            document.getElementById(
                "applicationsList"
            );


        if (container) {

            container.innerHTML = `

                <div class="gp-loading-state">

                    <p>
                        Unable to load applications.
                    </p>

                    <small>
                        ${escapeHTML(error.message)}
                    </small>

                </div>

            `;

        }

    }

});


// =====================================================
// LOAD APPLICATIONS
// =====================================================

async function loadApplications() {

    const container =
        document.getElementById(
            "applicationsList"
        );


    try {

        if (container) {

            container.innerHTML = `

                <div class="gp-loading-state">

                    <div class="gp-loader"></div>

                    <p>
                        Loading applications...
                    </p>

                </div>

            `;

        }


        // =============================================
        // GET APPLICATIONS
        // =============================================

        const applicationsRef =
            collection(
                db,
                "applications"
            );


        /*
         * IMPORTANT
         *
         * Applications are filtered using
         * the Gaon Pradhan's assigned village.
         *
         * First we load applications where
         * villageId matches the official villageId.
         */


        let snapshot;


        if (
            officialData.villageId
        ) {

            const applicationsQuery =
                query(
                    applicationsRef,
                    where(
                        "villageId",
                        "==",
                        officialData.villageId
                    )
                );


            snapshot =
                await getDocs(
                    applicationsQuery
                );

        }
        else if (
            officialData.village
        ) {

            const applicationsQuery =
                query(
                    applicationsRef,
                    where(
                        "village",
                        "==",
                        officialData.village
                    )
                );


            snapshot =
                await getDocs(
                    applicationsQuery
                );

        }
        else {

            /*
             * No village assigned.
             * Do NOT show applications from
             * other areas.
             */

            allApplications = [];

            filteredApplications = [];

            updateStatistics();

            renderApplications();

            setText(
                "sidebarPendingCount",
                "0"
            );

            return;

        }


        // =============================================
        // CONVERT SNAPSHOT
        // =============================================

        allApplications = [];


        snapshot.forEach((applicationDoc) => {

            const data =
                applicationDoc.data();


            allApplications.push({

                id:
                    applicationDoc.id,

                ...data

            });

        });


        // =============================================
        // SORT NEWEST FIRST
        // =============================================

        allApplications.sort(
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


        filteredApplications =
            [...allApplications];


        // =============================================
        // UPDATE UI
        // =============================================

        updateStatistics();

        populateCertificateFilter();

        renderApplications();


    }
    catch (error) {

        console.error(
            "APPLICATION LOAD ERROR:",
            error
        );


        if (container) {

            container.innerHTML = `

                <div class="gp-loading-state">

                    <p>
                        Unable to load applications.
                    </p>

                    <small>
                        ${escapeHTML(error.message)}
                    </small>

                </div>

            `;

        }

    }

}


// =====================================================
// STATISTICS
// =====================================================

function updateStatistics() {

    let total = 0;

    let pending = 0;

    let approved = 0;

    let rejected = 0;


    allApplications.forEach(
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

}


// =====================================================
// CERTIFICATE FILTER
// =====================================================

function populateCertificateFilter() {

    const select =
        document.getElementById(
            "certificateFilter"
        );


    if (!select) {

        return;

    }


    const types =
        new Set();


    allApplications.forEach(
        (application) => {

            if (
                application.certificateType
            ) {

                types.add(
                    application.certificateType
                );

            }

        }
    );


    select.innerHTML = `

        <option value="all">
            All Certificates
        </option>

    `;


    [...types]
        .sort()
        .forEach(
            (type) => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    type;


                option.textContent =
                    type;


                select.appendChild(
                    option
                );

            }
        );

}


// =====================================================
// FILTER SETUP
// =====================================================

function setupFilters() {

    const search =
        document.getElementById(
            "applicationSearch"
        );


    const status =
        document.getElementById(
            "statusFilter"
        );


    const certificate =
        document.getElementById(
            "certificateFilter"
        );


    const reset =
        document.getElementById(
            "resetFilters"
        );


    if (search) {

        search.addEventListener(
            "input",
            applyFilters
        );

    }


    if (status) {

        status.addEventListener(
            "change",
            applyFilters
        );

    }


    if (certificate) {

        certificate.addEventListener(
            "change",
            applyFilters
        );

    }


    if (reset) {

        reset.addEventListener(
            "click",
            () => {

                if (search) {

                    search.value = "";

                }


                if (status) {

                    status.value =
                        "all";

                }


                if (certificate) {

                    certificate.value =
                        "all";

                }


                applyFilters();

            }
        );

    }

}


// =====================================================
// APPLY FILTERS
// =====================================================

function applyFilters() {

    const search =
        document.getElementById(
            "applicationSearch"
        );


    const status =
        document.getElementById(
            "statusFilter"
        );


    const certificate =
        document.getElementById(
            "certificateFilter"
        );


    const searchValue =
        search
            ? search.value
                .trim()
                .toLowerCase()
            : "";


    const statusValue =
        status
            ? status.value
            : "all";


    const certificateValue =
        certificate
            ? certificate.value
            : "all";


    filteredApplications =
        allApplications.filter(
            (application) => {


                // =====================================
                // SEARCH
                // =====================================

                const applicationNo =
                    String(
                        application.applicationNo ||
                        ""
                    ).toLowerCase();


                const applicantName =
                    String(
                        application.applicantName ||
                        ""
                    ).toLowerCase();


                const matchesSearch =
                    !searchValue ||
                    applicationNo.includes(
                        searchValue
                    ) ||
                    applicantName.includes(
                        searchValue
                    );


                // =====================================
                // STATUS
                // =====================================

                const applicationStatus =
                    normalizeStatus(
                        application.applicationStatus ||
                        application.status
                    );


                const matchesStatus =
                    statusValue === "all" ||
                    applicationStatus ===
                        statusValue.toLowerCase();


                // =====================================
                // CERTIFICATE
                // =====================================

                const matchesCertificate =
                    certificateValue === "all" ||
                    application.certificateType ===
                        certificateValue;


                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesCertificate
                );

            }
        );


    renderApplications();

}


// =====================================================
// RENDER APPLICATIONS
// =====================================================

function renderApplications() {

    const container =
        document.getElementById(
            "applicationsList"
        );


    if (!container) {

        return;

    }


    if (
        filteredApplications.length === 0
    ) {

        container.innerHTML = `

            <div class="gp-loading-state">

                <div style="font-size:42px;">
                    📄
                </div>

                <p>
                    No applications found.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        filteredApplications
            .map(
                renderApplicationCard
            )
            .join("");

}


// =====================================================
// APPLICATION CARD
// =====================================================

function renderApplicationCard(
    application
) {

    const status =
        application.applicationStatus ||
        application.status ||
        "Pending";


    const normalizedStatus =
        normalizeStatus(
            status
        );


    const statusClass =
        normalizedStatus;


    const applicationNo =
        escapeHTML(
            application.applicationNo ||
            "—"
        );


    const applicantName =
        escapeHTML(
            application.applicantName ||
            "Applicant"
        );


    const certificateType =
        escapeHTML(
            application.certificateType ||
            "Certificate"
        );


    const village =
        escapeHTML(
            application.village ||
            ""
        );


    const submittedDate =
        formatDate(
            application.submittedAt
        );


    return `

        <div class="gp-application-card">

            <div class="gp-application-main">

                <div class="gp-application-icon">
                    📄
                </div>


                <div class="gp-application-info">

                    <strong>
                        ${applicationNo}
                    </strong>

                    <h3>
                        ${applicantName}
                    </h3>

                    <p>
                        ${certificateType}
                    </p>

                    ${
                        village
                        ? `
                            <small>
                                📍 ${village}
                            </small>
                          `
                        : ""
                    }

                </div>

            </div>


            <div class="gp-application-meta">

                <span class="gp-application-date">
                    ${submittedDate}
                </span>


                <span
                    class="gp-application-status ${statusClass}"
                >
                    ${escapeHTML(status)}
                </span>


                <button
                    type="button"
                    class="gp-view-application-btn"
                    onclick="viewApplication('${application.id}')"
                >
                    View →
                </button>

            </div>

        </div>

    `;

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

            await signOut(auth);

            window.location.href =
                "login.html";

        }
        catch (error) {

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
// LOCATION BUILDER
// =====================================================

function buildOfficialLocation(
    data
) {

    const parts = [];


    if (
        data.districtName ||
        data.district
    ) {

        parts.push(
            data.districtName ||
            data.district
        );

    }


    if (
        data.revenueCircleName ||
        data.revenueCircle
    ) {

        parts.push(
            data.revenueCircleName ||
            data.revenueCircle
        );

    }


    if (
        data.mouzaName ||
        data.mouza
    ) {

        parts.push(
            data.mouzaName ||
            data.mouza
        );

    }


    if (
        data.lotName ||
        data.lot
    ) {

        parts.push(
            data.lotName ||
            data.lot
        );

    }


    if (
        data.villageName ||
        data.village
    ) {

        parts.push(
            data.villageName ||
            data.village
        );

    }


    return parts.join(
        " → "
    );

}


// =====================================================
// DATE
// =====================================================

function setupDate() {

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
// MOBILE MENU
// =====================================================

function setupMobileMenu() {

    const button =
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
        !button ||
        !sidebar
    ) {

        return;

    }


    button.addEventListener(
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

}


// =====================================================
// HELPERS
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
            value;

    }

}


function getInitials(
    name
) {

    const parts =
        String(name)
            .trim()
            .split(/\s+/);


    if (
        parts.length === 1
    ) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();

}


function normalizeStatus(
    status
) {

    return String(
        status || "pending"
    )
        .trim()
        .toLowerCase();

}


function getTimestamp(
    timestamp
) {

    if (
        timestamp &&
        typeof timestamp.seconds ===
            "number"
    ) {

        return (
            timestamp.seconds * 1000
        );

    }


    return 0;

}


function formatDate(
    timestamp
) {

    const time =
        getTimestamp(
            timestamp
        );


    if (!time) {

        return "Date unavailable";

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


function escapeHTML(
    value
) {

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
