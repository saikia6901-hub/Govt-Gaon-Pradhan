import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ========================================
// AUTHENTICATION
// ========================================

onAuthStateChanged(auth, async (user) => {

    // ====================================
    // NOT LOGGED IN
    // ====================================

    if (!user) {

        window.location.href =
            "login.html";

        return;
    }


    try {

        // ====================================
        // GET USER PROFILE
        // ====================================

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        const userSnap =
            await getDoc(userRef);


        // ====================================
        // PROFILE NOT FOUND
        // ====================================

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
        // APPLICANT NAME
        // ====================================

        const applicantName =
            document.getElementById(
                "applicantName"
            );


        if (applicantName) {

            applicantName.textContent =
                data.name ||
                "Applicant";

        }


        // ====================================
        // HEADER APPLICANT NAME
        // ====================================

        const headerApplicantName =
            document.getElementById(
                "headerApplicantName"
            );


        if (headerApplicantName) {

            headerApplicantName.textContent =
                data.name ||
                "Applicant";

        }


        // ====================================
        // EMAIL
        // ====================================

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


        // ====================================
        // USER EMAIL
        // ====================================

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


        // ====================================
        // PROFILE STATUS
        // ====================================

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


        // ====================================
        // SUCCESS
        // ====================================

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
