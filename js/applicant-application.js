import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ========================================
// ELEMENTS
// ========================================

const form =
    document.getElementById("applicationForm");

const message =
    document.getElementById("applicationMessage");

const submitButton =
    document.getElementById("submitApplication");


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
        // GET APPLICANT PROFILE
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
                "Applicant profile not found. Please complete your profile first."
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
            data.role &&
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
        // PROFILE COMPLETION CHECK
        // =================================

        if (
            data.profileCompleted !== true
        ) {

            const proceed =
                confirm(
                    "Your applicant profile is incomplete. Complete your profile before applying for a certificate."
                );

            if (proceed) {

                window.location.href =
                    "applicant-profile.html";

            }

            return;

        }


        // =================================
        // LOAD PROFILE DATA
        // =================================

        const applicantName =
            document.getElementById(
                "applicantName"
            );

        const fatherName =
            document.getElementById(
                "fatherName"
            );

        const motherName =
            document.getElementById(
                "motherName"
            );

        const mobile =
            document.getElementById(
                "mobile"
            );

        const headerName =
            document.getElementById(
                "headerApplicantName"
            );


        applicantName.value =
            data.name || "";

        fatherName.value =
            data.fatherName || "";

        motherName.value =
            data.motherName || "";

        mobile.value =
            data.mobile || "";

        headerName.textContent =
            data.name || "Applicant";


        message.textContent =
            "Profile information loaded successfully.";

    } catch (error) {

        console.error(
            "Application page error:",
            error
        );

        message.textContent =
            "Unable to load applicant information.";

    }

});


// ========================================
// FORM SUBMIT - TEMPORARY
// ========================================

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const certificateType =
            document.getElementById(
                "certificateType"
            ).value;


        const district =
            document.getElementById(
                "districtSelect"
            ).value;


        const circle =
            document.getElementById(
                "circleSelect"
            ).value;


        const mouza =
            document.getElementById(
                "mouzaSelect"
            ).value;


        const lot =
            document.getElementById(
                "lotSelect"
            ).value;


        const village =
            document.getElementById(
                "villageSelect"
            ).value;


        const purpose =
            document.getElementById(
                "purpose"
            ).value.trim();


        // =================================
        // VALIDATION
        // =================================

        if (!certificateType) {

            message.textContent =
                "Please select a certificate type.";

            return;

        }


        if (!district) {

            message.textContent =
                "Please select a district.";

            return;

        }


        if (!circle) {

            message.textContent =
                "Please select a Revenue Circle.";

            return;

        }


        if (!mouza) {

            message.textContent =
                "Please select a Mouza.";

            return;

        }


        if (!lot) {

            message.textContent =
                "Please select a Lot.";

            return;

        }


        if (!village) {

            message.textContent =
                "Please select a Village.";

            return;

        }


        if (!purpose) {

            message.textContent =
                "Please enter the purpose.";

            return;

        }


        // =================================
        // TEMPORARY TEST
        // =================================

        message.textContent =
            "Form completed successfully. Application saving will be connected in the next step.";

        alert(
            "Application form is working successfully."
        );

    }
);
