import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


window.login = async function () {

  const email =
    document.getElementById("username").value.trim();

  const password =
    document.getElementById("password").value;


  const message =
    document.getElementById("message");


  // ========================================
  // BASIC VALIDATION
  // ========================================

  if (!email || !password) {

    message.textContent =
      "Please enter email and password.";

    return;

  }


  message.textContent =
    "Logging in...";


  try {

    // ========================================
    // FIREBASE LOGIN
    // ========================================

    const userCredential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );


    const user =
      userCredential.user;


    // ========================================
    // GET USER PROFILE
    // ========================================

    const userRef =
      doc(
        db,
        "users",
        user.uid
      );


    const userSnap =
      await getDoc(userRef);


    if (!userSnap.exists()) {

      message.textContent =
        "User profile not found.";

      await auth.signOut();

      return;

    }


    const userData =
      userSnap.data();


    const role =
      userData.role;


    // ========================================
    // ROLE CHECK
    // ========================================

    if (!role) {

      message.textContent =
        "User role is not assigned.";

      await auth.signOut();

      return;

    }


    alert(
      "Login Successful"
    );


    // ========================================
    // ROLE BASED REDIRECTION
    // ========================================

    switch (role) {


      // --------------------------------------
      // SUPER ADMIN
      // --------------------------------------

      case "super_admin":

        window.location.href =
          "dashboard.html";

        break;


      // --------------------------------------
      // APPLICANT
      // --------------------------------------

      case "applicant":

        window.location.href =
          "applicant-dashboard.html";

        break;


      // --------------------------------------
      // CIRCLE OFFICER
      // --------------------------------------

      case "circle_officer":

        window.location.href =
          "circle-officer-dashboard.html";

        break;


      // --------------------------------------
      // S.K.
      // --------------------------------------

      case "sk":

        window.location.href =
          "sk-dashboard.html";

        break;


      // --------------------------------------
      // MANDAL
      // --------------------------------------

      case "mandal":

        window.location.href =
          "mandal-dashboard.html";

        break;


      // --------------------------------------
      // GAON PRADHAN
      // --------------------------------------

      case "gaon_pradhan":

        window.location.href =
          "gaon-pradhan-dashboard.html";

        break;


      // --------------------------------------
      // UNKNOWN ROLE
      // --------------------------------------

      default:

        message.textContent =
          "Invalid or unsupported user role.";

        await auth.signOut();

        break;

    }


  } catch (error) {

    console.error(
      "Login error:",
      error
    );


    message.textContent =
      error.message;

  }

};
