import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// =====================================================
// ELEMENTS
// =====================================================

const headerOfficerName =
    document.getElementById("headerOfficerName");

const headerOfficerAvatar =
    document.getElementById("headerOfficerAvatar");

const sidebarOfficerName =
    document.getElementById("sidebarOfficerName");

const sidebarOfficerAvatar =
    document.getElementById("sidebarOfficerAvatar");

const dashboardOfficerName =
    document.getElementById("dashboardOfficerName");

const officialName =
    document.getElementById("officialName");

const officialEmail =
    document.getElementById("officialEmail");

const officialRole =
    document.getElementById("officialRole");

const officialDistrict =
    document.getElementById("officialDistrict");

const officialRevenueCircle =
    document.getElementById("officialRevenueCircle");

const officialJurisdiction =
    document.getElementById("officialJurisdiction");

const currentDate =
    document.getElementById("currentDate");

const totalApplications =
    document.getElementById("totalApplications");

const pendingApplications =
    document.getElementById("pendingApplications");

const approvedApplications =
    document.getElementById("approvedApplications");

const rejectedApplications =
    document.getElementById("rejectedApplications");

const totalMandals =
    document.getElementById("totalMandals");

const totalGaonPradhans =
    document.getElementById("totalGaonPradhans");

const sidebarPendingCount =
    document.getElementById("sidebarPendingCount");

const recentApplications =
    document.getElementById("recentApplications");


// =====================================================
// CURRENT DATE
// =====================================================

function setCurrentDate() {

    if (!currentDate) return;

    const today = new Date();

    currentDate.textContent =
        today.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

}


// =====================================================
// AVATAR INITIALS
// =====================================================

function getInitials(name) {

    if (!name) {
        return "CO";
    }

    const words =
        String(name)
            .trim()
            .split(/\s+/);

    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }

    return (
        words[0].charAt(0) +
        words[words.length - 1].charAt(0)
    ).toUpperCase();

}


// =====================================================
// SAFE HTML
// =====================================================

function escapeHtml(value) {

    return String(value ?? "")

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}


// =====================================================
// LOAD OFFICER PROFILE
// =====================================================

async function loadOfficerProfile(user) {

    const userRef =
        doc(db, "users", user.uid);

    const userSnap =
        await getDoc(userRef);

    if (!userSnap.exists()) {

        throw new Error(
            "Officer profile not found."
        );

    }

    const data =
        userSnap.data();


    // =================================================
    // ROLE SECURITY
    // =================================================

    const role =
        String(data.role || "")
            .toLowerCase()
            .trim();


    if (
        role !== "circle_officer" &&
        role !== "circle officer"
    ) {

        alert(
            "Access denied. Circle Officer only."
        );

        window.location.href =
            "login.html";

        return null;

    }


    // =================================================
    // OFFICER NAME
    // =================================================

    const name =
        data.name ||
        data.fullName ||
        data.displayName ||
        "Circle Officer";


    // =================================================
    // LOCATION
    // =================================================

    const district =
        data.districtName ||
        data.district ||
        "Not Assigned";


    const revenueCircle =
        data.revenueCircleName ||
        data.revenueCircle ||
        "Not Assigned";


    // =================================================
    // HEADER
    // =================================================

    if (headerOfficerName) {

        headerOfficerName.textContent =
            name;

    }


    if (sidebarOfficerName) {

        sidebarOfficerName.textContent =
            name;

    }


    if (dashboardOfficerName) {

        dashboardOfficerName.textContent =
            name;

    }


    if (officialName) {

        officialName.textContent =
            name;

    }


    if (officialEmail) {

        officialEmail.textContent =
            user.email || data.email || "—";

    }


    if (officialRole) {

        officialRole.textContent =
            "Circle Officer";

    }


    if (officialDistrict) {

        officialDistrict.textContent =
            district;

    }


    if (officialRevenueCircle) {

        officialRevenueCircle.textContent =
            revenueCircle;

    }


    if (officialJurisdiction) {

        officialJurisdiction.textContent =
            `${district} → ${revenueCircle}`;

    }


    // =================================================
    // AVATAR
    // =================================================

    const initials =
        getInitials(name);


    if (headerOfficerAvatar) {

        headerOfficerAvatar.textContent =
            initials;

    }


    if (sidebarOfficerAvatar) {

        sidebarOfficerAvatar.textContent =
            initials;

    }


    return {

        ...data,

        uid: user.uid,

        name,

        district,

        revenueCircle

    };

}


// =====================================================
// GET LOCATION VALUE
// =====================================================

function getLocationValue(data, type) {

    if (type === "district") {

        return (
            data.districtName ||
            data.district ||
            data.districtId ||
            ""
        );

    }


    if (type === "revenueCircle") {

        return (
            data.revenueCircleName ||
            data.revenueCircle ||
            data.revenueCircleId ||
            ""
        );

    }


    return "";

}


// =====================================================
// LOAD APPLICATIONS
// =====================================================

async function loadApplications(officer) {

    if (!recentApplications) return;


    recentApplications.innerHTML = `

        <div class="co-loading-state">

            <div class="co-loader"></div>

            <p>
                Loading applications...
            </p>

        </div>

    `;


    try {

        const applicationsRef =
            collection(
                db,
                "applications"
            );


        /*
         * IMPORTANT
         *
         * We first read applications and then
         * filter according to the Circle Officer's
         * assigned jurisdiction.
         *
         * This avoids depending on one exact
         * Firestore field naming convention.
         */

        const snapshot =
            await getDocs(
                applicationsRef
            );


        let applications = [];


        snapshot.forEach(
            (applicationDoc) => {

                const data =
                    applicationDoc.data();


                const applicationDistrict =
                    getLocationValue(
                        data,
                        "district"
                    );


                const applicationCircle =
                    getLocationValue(
                        data,
                        "revenueCircle"
                    );


                const officerDistrict =
                    String(
                        officer.district || ""
                    )
                    .trim()
                    .toLowerCase();


                const officerCircle =
                    String(
                        officer.revenueCircle || ""
                    )
                    .trim()
                    .toLowerCase();


                const districtMatch =
                    !officerDistrict ||
                    !applicationDistrict ||
                    String(
                        applicationDistrict
                    )
                    .trim()
                    .toLowerCase() ===
                    officerDistrict;


                const circleMatch =
                    !officerCircle ||
                    !applicationCircle ||
                    String(
                        applicationCircle
                    )
                    .trim()
                    .toLowerCase() ===
                    officerCircle;


                if (
                    districtMatch &&
                    circleMatch
                ) {

                    applications.push({

                        id:
                            applicationDoc.id,

                        ...data

                    });

                }

            }
        );


        // =================================================
        // STATISTICS
        // =================================================

        let pending = 0;

        let approved = 0;

        let rejected = 0;


        applications.forEach(
            (application) => {

                const status =
                    String(
                        application.status || "Pending"
                    )
                    .trim()
                    .toLowerCase();


                if (status === "pending") {

                    pending++;

                }
                else if (status === "approved") {

                    approved++;

                }
                else if (status === "rejected") {

                    rejected++;

                }

            }
        );


        if (totalApplications) {

            totalApplications.textContent =
                applications.length;

        }


        if (pendingApplications) {

            pendingApplications.textContent =
                pending;

        }


        if (approvedApplications) {

            approvedApplications.textContent =
                approved;

        }


        if (rejectedApplications) {

            rejectedApplications.textContent =
                rejected;

        }


        if (sidebarPendingCount) {

            sidebarPendingCount.textContent =
                pending;

        }


        // =================================================
        // RECENT APPLICATIONS
        // =================================================

        applications.sort(
            (a, b) => {

                const dateA =
                    a.createdAt?.toMillis
                        ? a.createdAt.toMillis()
                        : 0;

                const dateB =
                    b.createdAt?.toMillis
                        ? b.createdAt.toMillis()
                        : 0;

                return dateB - dateA;

            }
        );


        const recent =
            applications.slice(0, 5);


        if (!recent.length) {

            recentApplications.innerHTML = `

                <div class="co-empty-state">

                    <div class="co-empty-icon">
                        📄
                    </div>

                    <h3>
                        No Applications
                    </h3>

                    <p>
                        No certificate applications
                        are currently available
                        for your jurisdiction.
                    </p>

                </div>

            `;

            return;

        }


        let html = "";


        recent.forEach(
            (application) => {

                const applicantName =
                    application.applicantName ||
                    application.name ||
                    "Applicant";


                const applicationNo =
                    application.applicationNo ||
                    application.applicationNumber ||
                    application.id;


                const certificateType =
                    application.certificateType ||
                    application.serviceName ||
                    "Certificate";


                const status =
                    application.status ||
                    "Pending";


                const statusClass =
                    String(status)
                        .toLowerCase();


                html += `

                    <div class="co-application-item">

                        <div class="co-application-icon">
                            📄
                        </div>

                        <div class="co-application-info">

                            <strong>
                                ${escapeHtml(
                                    applicantName
                                )}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    applicationNo
                                )}
                            </span>

                            <small>
                                ${escapeHtml(
                                    certificateType
                                )}
                            </small>

                        </div>

                        <div class="co-application-status ${escapeHtml(
                            statusClass
                        )}">

                            ${escapeHtml(status)}

                        </div>

                    </div>

                `;

            }
        );


        recentApplications.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Application loading error:",
            error
        );


        recentApplications.innerHTML = `

            <div class="co-error-state">

                <div>
                    ⚠️
                </div>

                <h3>
                    Unable to Load Applications
                </h3>

                <p>
                    ${escapeHtml(
                        error.message ||
                        "Something went wrong while loading applications."
                    )}
                </p>

            </div>

        `;

    }

}


// =====================================================
// LOAD MANDALS
// =====================================================

async function loadMandals(officer) {

    if (!totalMandals) return;


    try {

        const mandalsRef =
            collection(
                db,
                "mandals"
            );


        const snapshot =
            await getDocs(
                mandalsRef
            );


        let count = 0;


        snapshot.forEach(
            (mandalDoc) => {

                const data =
                    mandalDoc.data();


                const district =
                    getLocationValue(
                        data,
                        "district"
                    );


                const revenueCircle =
                    getLocationValue(
                        data,
                        "revenueCircle"
                    );


                const officerDistrict =
                    String(
                        officer.district || ""
                    )
                    .trim()
                    .toLowerCase();


                const officerCircle =
                    String(
                        officer.revenueCircle || ""
                    )
                    .trim()
                    .toLowerCase();


                const districtMatch =
                    !district ||
                    String(district)
                        .trim()
                        .toLowerCase() ===
                    officerDistrict;


                const circleMatch =
                    !revenueCircle ||
                    String(revenueCircle)
                        .trim()
                        .toLowerCase() ===
                    officerCircle;


                if (
                    districtMatch &&
                    circleMatch
                ) {

                    count++;

                }

            }
        );


        totalMandals.textContent =
            count;


    } catch (error) {

        console.error(
            "Mandal loading error:",
            error
        );


        totalMandals.textContent =
            "0";

    }

}


// =====================================================
// LOAD GAON PRADHANS
// =====================================================

async function loadGaonPradhans(officer) {

    if (!totalGaonPradhans) return;


    try {

        const usersRef =
            collection(
                db,
                "users"
            );


        const q =
            query(
                usersRef,
                where(
                    "role",
                    "==",
                    "gaon_pradhan"
                )
            );


        const snapshot =
            await getDocs(q);


        let count = 0;


        snapshot.forEach(
            (userDoc) => {

                const data =
                    userDoc.data();


                const district =
                    getLocationValue(
                        data,
                        "district"
                    );


                const revenueCircle =
                    getLocationValue(
                        data,
                        "revenueCircle"
                    );


                const officerDistrict =
                    String(
                        officer.district || ""
                    )
                    .trim()
                    .toLowerCase();


                const officerCircle =
                    String(
                        officer.revenueCircle || ""
                    )
                    .trim()
                    .toLowerCase();


                const districtMatch =
                    !district ||
                    String(district)
                        .trim()
                        .toLowerCase() ===
                    officerDistrict;


                const circleMatch =
                    !revenueCircle ||
                    String(revenueCircle)
                        .trim()
                        .toLowerCase() ===
                    officerCircle;


                if (
                    districtMatch &&
                    circleMatch
                ) {

                    count++;

                }

            }
        );


        totalGaonPradhans.textContent =
            count;


    } catch (error) {

        console.error(
            "Gaon Pradhan loading error:",
            error
        );


        totalGaonPradhans.textContent =
            "0";

    }

}


// =====================================================
// MOBILE SIDEBAR
// =====================================================

function setupMobileMenu() {

    const menuButton =
        document.getElementById(
            "mobileMenuBtn"
        );

    const sidebar =
        document.getElementById(
            "coSidebar"
        );

    const overlay =
        document.getElementById(
            "coSidebarOverlay"
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


    const navLinks =
        sidebar.querySelectorAll(
            ".co-nav-item"
        );


    navLinks.forEach(
        (link) => {

            link.addEventListener(
                "click",
                () => {

                    sidebar.classList.remove(
                        "open"
                    );

                    if (overlay) {

                        overlay.classList.remove(
                            "active"
                        );

                    }

                }
            );

        }
    );

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
                "Unable to logout. Please try again."
            );

        }

    };


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


        try {

            setCurrentDate();

            setupMobileMenu();


            // =========================================
            // LOAD PROFILE
            // =========================================

            const officer =
                await loadOfficerProfile(
                    user
                );


            if (!officer) {

                return;

            }


            // =========================================
            // LOAD DASHBOARD DATA
            // =========================================

            await Promise.all([

                loadApplications(
                    officer
                ),

                loadMandals(
                    officer
                ),

                loadGaonPradhans(
                    officer
                )

            ]);


        } catch (error) {

            console.error(
                "Circle Officer Dashboard Error:",
                error
            );


            alert(
                error.message ||
                "Unable to load Circle Officer dashboard."
            );


            window.location.href =
                "login.html";

        }

    }
);
