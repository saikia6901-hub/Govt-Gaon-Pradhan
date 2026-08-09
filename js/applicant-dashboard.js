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


    if (!userSnap.exists()) {

      alert(
        "Applicant profile not found."
      );

      await signOut(auth);

      window.location.href =
        "login.html";

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
    // DISPLAY EMAIL
    // ====================================

    document.getElementById(
      "applicantEmail"
    ).textContent =
      "Logged in as: " + user.email;


    // ====================================
    // DISPLAY NAME
    // ====================================

    document.getElementById(
      "applicantName"
    ).textContent =
      "Name: " +
      (data.name || "Applicant");


    // ====================================
    // PROFILE STATUS
    // ====================================

    const profileStatus =
      document.getElementById(
        "profileStatus"
      );


    if (
      data.profileCompleted === true
    ) {

      profileStatus.textContent =
        "Profile Status: Complete ✅";

    } else {

      profileStatus.textContent =
        "Profile Status: Incomplete ⚠️";

    }


  } catch (error) {

    console.error(
      "Applicant dashboard error:",
      error
    );

    alert(
      "Unable to load applicant dashboard."
    );

  }

});


// ========================================
// APPLY CERTIFICATE
// ========================================

window.applyCertificate =
  function () {

    alert(
      "Certificate application module will be available soon."
    );

  };


// ========================================
// MY APPLICATIONS
// ========================================

window.myApplications =
  function () {

    alert(
      "My Applications module will be available soon."
    );

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
