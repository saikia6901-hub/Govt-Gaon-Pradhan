import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  signOut
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
  // LOGIN TYPE
  // ========================================

  const loginType =
    document.body.dataset.loginType || "official";


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

      await signOut(auth);

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

      await signOut(auth);

      return;

    }


    // ========================================
    // APPLICANT LOGIN PAGE
    // ========================================

    if (loginType === "applicant") {

      if (role !== "applicant") {

        message.textContent =
          "This login is for applicants only. Please use Official Login.";

        await signOut(auth);

        return;

      }


      alert("Applicant Login Successful");

      window.location.href =
        "applicant-dashboard.html";

      return;

    }


    // ========================================
    // OFFICIAL LOGIN PAGE
    // ========================================

    if (role === "applicant") {

      message.textContent =
        "Applicant accounts cannot use Official Login. Please use Applicant Login.";

      await signOut(auth);

      return;

    }


    // ========================================
    // OFFICIAL ROLE BASED REDIRECTION
    // ========================================

    alert("Official Login Successful");


    switch (role) {


      // --------------------------------------
      // SUPER ADMIN
      // --------------------------------------

      case "super_admin":

        window.location.href =
          "dashboard.html";

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
          "Invalid or unsupported official user role.";

        await signOut(auth);

        break;

    }


  } catch (error) {

    console.error(
      "Login error:",
      error
    );


    // ========================================
    // USER FRIENDLY ERROR MESSAGE
    // ========================================

    if (
      error.code ===
      "auth/invalid-credential"
    ) {

      message.textContent =
        "Invalid email or password.";

    }

    else if (
      error.code ===
      "auth/user-not-found"
    ) {

      message.textContent =
        "No account found with this email.";

    }

    else if (
      error.code ===
      "auth/wrong-password"
    ) {

      message.textContent =
        "Incorrect password.";

    }

    else if (
      error.code ===
      "auth/too-many-requests"
    ) {

      message.textContent =
        "Too many login attempts. Please try again later.";

    }

    else {

      message.textContent =
        error.message;

    }

  }

};
