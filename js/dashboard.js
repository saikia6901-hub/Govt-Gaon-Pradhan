import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// =====================================================
// DASHBOARD
// =====================================================

async function loadDashboard(user) {

    try {

        console.log("DASHBOARD USER:", user.uid);


        // =================================================
        // LOAD USER PROFILE
        // =================================================

        const userRef = doc(
            db,
            "users",
            user.uid
        );

        const userSnap = await getDoc(userRef);


        if (userSnap.exists()) {

            const userData = userSnap.data();

            console.log(
                "OFFICIAL USER DATA:",
                userData
            );


            // =============================================
            // USER NAME
            // =============================================

            const userName =
                document.getElementById(
                    "dashboardUserName"
                );

            if (userName) {

                userName.textContent =
                    userData.name ||
                    user.displayName ||
                    "Official User";

            }


            // =============================================
            // EMAIL
            // =============================================

            const userEmail =
                document.getElementById(
                    "userEmail"
                );

            if (userEmail) {

                userEmail.textContent =
                    user.email ||
                    userData.email ||
                    "";

            }


            // =============================================
            // ROLE
            // =============================================

            const roleElement =
                document.getElementById(
                    "dashboardUserRole"
                );

            if (roleElement) {

                roleElement.textContent =
                    formatRole(
                        userData.role
                    );

            }


            // =============================================
            // OFFICIAL LOCATION / SCOPE
            // =============================================

            const locationElement =
                document.getElementById(
                    "officialLocation"
                );

            if (locationElement) {

                const location =
                    buildOfficialLocation(
                        userData
                    );

                locationElement.textContent =
                    location ||
                    "Official scope not assigned";

            }

        }
        else {

            console.warn(
                "User profile not found:",
                user.uid
            );

        }


        // =================================================
        // LOAD CERTIFICATES
        // =================================================

        await loadCertificateStatistics();


    }
    catch (error) {

        console.error(
            "DASHBOARD LOAD ERROR:",
            error
        );

    }

}


// =====================================================
// CERTIFICATE STATISTICS
// =====================================================

async function loadCertificateStatistics() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "certificates"
                )
            );


        let total = 0;

        let today = 0;

        let thisMonth = 0;


        // Current date

        const now =
            new Date();


        const currentYear =
            now.getFullYear();


        const currentMonth =
            now.getMonth();


        const currentDate =
            now.getDate();


        snapshot.forEach(
            (certificateDoc) => {

                total++;


                const data =
                    certificateDoc.data();


                // =========================================
                // CERTIFICATE DATE
                // =========================================

                let certificateDate = null;


                if (
                    data.createdAt &&
                    data.createdAt.seconds
                ) {

                    certificateDate =
                        new Date(
                            data.createdAt.seconds * 1000
                        );

                }
                else if (
                    data.issuedAt &&
                    data.issuedAt.seconds
                ) {

                    certificateDate =
                        new Date(
                            data.issuedAt.seconds * 1000
                        );

                }


                if (certificateDate) {


                    // =====================================
                    // TODAY
                    // =====================================

                    if (
                        certificateDate.getFullYear() ===
                            currentYear &&

                        certificateDate.getMonth() ===
                            currentMonth &&

                        certificateDate.getDate() ===
                            currentDate
                    ) {

                        today++;

                    }


                    // =====================================
                    // THIS MONTH
                    // =====================================

                    if (
                        certificateDate.getFullYear() ===
                            currentYear &&

                        certificateDate.getMonth() ===
                            currentMonth
                    ) {

                        thisMonth++;

                    }

                }

            }
        );


        // =================================================
        // UPDATE UI
        // =================================================

        const totalElement =
            document.getElementById(
                "totalCertificates"
            );

        const todayElement =
            document.getElementById(
                "todayCertificates"
            );

        const monthElement =
            document.getElementById(
                "monthCertificates"
            );


        if (totalElement) {

            totalElement.textContent =
                total;

        }


        if (todayElement) {

            todayElement.textContent =
                today;

        }


        if (monthElement) {

            monthElement.textContent =
                thisMonth;

        }


        console.log(
            "CERTIFICATE STATS:",
            {
                total,
                today,
                thisMonth
            }
        );


    }
    catch (error) {

        console.error(
            "CERTIFICATE STATISTICS ERROR:",
            error
        );

    }

}


// =====================================================
// FORMAT ROLE
// =====================================================

function formatRole(role) {

    if (!role) {

        return "Official";

    }


    const roles = {

        "super_admin":
            "Super Administrator",

        "circle_officer":
            "Circle Officer",

        "sk":
            "S.K.",

        "mandal":
            "Mandal",

        "gaon_pradhan":
            "Gaon Pradhan",

        "applicant":
            "Applicant"

    };


    return (
        roles[role] ||
        role
    );

}


// =====================================================
// BUILD OFFICIAL LOCATION
// =====================================================

function buildOfficialLocation(
    userData
) {

    const locationParts = [];


    if (
        userData.districtName
    ) {

        locationParts.push(
            userData.districtName
        );

    }
    else if (
        userData.district
    ) {

        locationParts.push(
            userData.district
        );

    }


    if (
        userData.revenueCircleName
    ) {

        locationParts.push(
            userData.revenueCircleName
        );

    }
    else if (
        userData.revenueCircle
    ) {

        locationParts.push(
            userData.revenueCircle
        );

    }


    if (
        userData.mouzaName
    ) {

        locationParts.push(
            userData.mouzaName
        );

    }
    else if (
        userData.mouza
    ) {

        locationParts.push(
            userData.mouza
        );

    }


    if (
        userData.lotName
    ) {

        locationParts.push(
            userData.lotName
        );

    }
    else if (
        userData.lot
    ) {

        locationParts.push(
            userData.lot
        );

    }


    if (
        userData.villageName
    ) {

        locationParts.push(
            userData.villageName
        );

    }
    else if (
        userData.village
    ) {

        locationParts.push(
            userData.village
        );

    }


    if (
        locationParts.length === 0
    ) {

        return "";

    }


    return locationParts.join(
        " → "
    );

}


// =====================================================
// AUTH STATE
// =====================================================

onAuthStateChanged(
    auth,
    async (user) => {

        console.log(
            "AUTH STATE:",
            user
        );


        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        await loadDashboard(
            user
        );

    }
);
