import { auth, db } from "./firebase.js";

import {
    getNextApplicationNumber
} from "./serial.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    addDoc,
    serverTimestamp
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
// CURRENT APPLICANT
// ========================================

let currentUser = null;

let applicantData = null;


// ========================================
// AUTHENTICATION
// ========================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href =
            "login.html";

        return;

    }


    currentUser = user;


    try {

        // =================================
        // LOAD USER PROFILE
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
                "Applicant profile not found."
            );

            window.location.href =
                "applicant-profile.html";

            return;

        }


        applicantData =
            userSnap.data();


        // =================================
        // ROLE SECURITY
        // =================================

        if (
            applicantData.role &&
            applicantData.role !== "applicant"
        ) {

            alert(
                "Access denied. Applicant account required."
            );

            window.location.href =
                "dashboard.html";

            return;

        }


        // =================================
        // PROFILE COMPLETION
        // =================================

        if (
            applicantData.profileCompleted !== true
        ) {

            alert(
                "Please complete your applicant profile before applying."
            );

            window.location.href =
                "applicant-profile.html";

            return;

        }


        // =================================
        // DISPLAY PROFILE DATA
        // =================================

        document.getElementById(
            "applicantName"
        ).value =
            applicantData.name || "";


        document.getElementById(
            "fatherName"
        ).value =
            applicantData.fatherName || "";


        document.getElementById(
            "motherName"
        ).value =
            applicantData.motherName || "";


        document.getElementById(
            "mobile"
        ).value =
            applicantData.mobile || "";


        document.getElementById(
            "headerApplicantName"
        ).textContent =
            applicantData.name ||
            "Applicant";


        message.textContent =
            "Your profile information has been loaded.";


    } catch (error) {

        console.error(
            "Applicant loading error:",
            error
        );


        message.textContent =
            "Unable to load applicant information.";

    }

});


// ========================================
// SUBMIT APPLICATION
// ========================================

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        // =================================
        // AUTH CHECK
        // =================================

        if (!currentUser) {

            alert(
                "Please login again."
            );

            window.location.href =
                "login.html";

            return;

        }


        // =================================
        // GET FORM DATA
        // =================================

        const certificateType =
            document.getElementById(
                "certificateType"
            ).value;


        const districtId =
            document.getElementById(
                "districtSelect"
            ).value;


        const districtName =
            document.getElementById(
                "districtSelect"
            ).selectedOptions[0]?.text ||
            "";


        const circleId =
            document.getElementById(
                "circleSelect"
            ).value;


        const circleName =
            document.getElementById(
                "circleSelect"
            ).selectedOptions[0]?.text ||
            "";


        const mouzaId =
            document.getElementById(
                "mouzaSelect"
            ).value;


        const mouzaName =
            document.getElementById(
                "mouzaSelect"
            ).selectedOptions[0]?.text ||
            "";


        const lotId =
            document.getElementById(
                "lotSelect"
            ).value;


        const lotName =
            document.getElementById(
                "lotSelect"
            ).selectedOptions[0]?.text ||
            "";


        const villageId =
            document.getElementById(
                "villageSelect"
            ).value;


        const villageName =
            document.getElementById(
                "villageSelect"
            ).selectedOptions[0]?.text ||
            "";


        const purpose =
            document.getElementById(
                "purpose"
            ).value.trim();


        // =================================
        // VALIDATION
        // =================================

        if (!certificateType) {

            message.textContent =
                "Please select Certificate Type.";

            return;

        }


        if (!districtId) {

            message.textContent =
                "Please select District.";

            return;

        }


        if (!circleId) {

            message.textContent =
                "Please select Revenue Circle.";

            return;

        }


        if (!mouzaId) {

            message.textContent =
                "Please select Mouza.";

            return;

        }


        // LOT IS OPTIONAL


        if (!villageId) {

            message.textContent =
                "Please select Village.";

            return;

        }


        if (!purpose) {

            message.textContent =
                "Please enter the purpose.";

            return;

        }


        // =================================
        // CONFIRMATION
        // =================================

        const confirmed =
            confirm(
                "Are you sure all the information provided is correct?"
            );


        if (!confirmed) {

            return;

        }


        // =================================
        // DISABLE BUTTON
        // =================================

        submitButton.disabled =
            true;


        submitButton.textContent =
            "Submitting...";


        message.textContent =
            "Submitting your application securely...";


        try {

            // =================================
            // CREATE APPLICATION
            // =================================

            const applicationNumber =
    await getNextApplicationNumber();

            const applicationData = {

                applicationNo:
                   applicationNumber,
                
                applicantUid:
                    currentUser.uid,

                applicantEmail:
                    currentUser.email || "",


                applicantName:
                    applicantData.name || "",

                fatherName:
                    applicantData.fatherName || "",

                motherName:
                    applicantData.motherName || "",

                mobile:
                    applicantData.mobile || "",


                certificateType:
                    certificateType,


                // LOCATION

                districtId:
                    districtId,

                district:
                    districtName,


                revenueCircleId:
                    circleId,

                revenueCircle:
                    circleName,


                mouzaId:
                    mouzaId,

                mouza:
                    mouzaName,


                // OPTIONAL LOT

                lotId:
                    lotId || "",

                lot:
                    lotId
                        ? lotName
                        : "",


                villageId:
                    villageId,

                village:
                    villageName,


                // PURPOSE

                purpose:
                    purpose,


                // STATUS

                status:
                    "Submitted",

                applicationStatus:
                    "Pending",


                // TIMESTAMP

                submittedAt:
                    serverTimestamp()

            };


            // =================================
            // SAVE TO FIRESTORE
            // =================================

            const applicationRef =
                await addDoc(
                    collection(
                        db,
                        "applications"
                    ),
                    applicationData
                );


            // =================================
            // APPLICATION ID
            // =================================

            const applicationId =
                applicationRef.id;


            // =================================
            // SUCCESS
            // =================================

            message.textContent =
                "Application submitted successfully.";


            alert(
    "Application Submitted Successfully!\n\n" +
    "Application No.: " +
    applicationNumber +
    "\n\nPlease keep this Application No. safe for future tracking."
);


            // =================================
            // REDIRECT
            // =================================

            window.location.href =
                "applicant-dashboard.html";


        } catch (error) {

            console.error(
                "Application submission error:",
                error
            );


            message.textContent =
                "Unable to submit application. Please try again.";


            alert(
                "Application submission failed:\n" +
                error.message
            );


            // ENABLE BUTTON AGAIN

            submitButton.disabled =
                false;


            submitButton.textContent =
                "Submit Application →";

        }

    }
);
