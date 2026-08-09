import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


const form =
  document.getElementById("applicantRegisterForm");

const message =
  document.getElementById("registerMessage");


// ========================================
// REGISTRATION
// ========================================

form.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    // ==================================
    // GET FORM DATA
    // ==================================

    const name =
      document.getElementById(
        "applicantName"
      ).value.trim();


    const mobile =
      document.getElementById(
        "applicantMobile"
      ).value.trim();


    const email =
      document.getElementById(
        "applicantEmail"
      ).value.trim();


    const password =
      document.getElementById(
        "applicantPassword"
      ).value;


    const confirmPassword =
      document.getElementById(
        "confirmPassword"
      ).value;


    // ==================================
    // VALIDATION
    // ==================================

    if (!name) {

      message.textContent =
        "Please enter your full name.";

      return;

    }


    if (
      mobile.length !== 10 ||
      !/^[0-9]+$/.test(mobile)
    ) {

      message.textContent =
        "Please enter a valid 10 digit mobile number.";

      return;

    }


    if (!email) {

      message.textContent =
        "Please enter your email address.";

      return;

    }


    if (
      password.length < 6
    ) {

      message.textContent =
        "Password must contain at least 6 characters.";

      return;

    }


    if (
      password !==
      confirmPassword
    ) {

      message.textContent =
        "Passwords do not match.";

      return;

    }


    // ==================================
    // START REGISTRATION
    // ==================================

    message.textContent =
      "Creating your account...";


    try {

      // ==================================
      // CREATE FIREBASE AUTH USER
      // ==================================

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );


      const user =
        userCredential.user;


      console.log(
        "Firebase Auth user created:",
        user.uid
      );


      // ==================================
      // CREATE FIRESTORE USER PROFILE
      // ==================================

      await setDoc(
        doc(
          db,
          "users",
          user.uid
        ),
        {

          uid:
            user.uid,

          name:
            name,

          email:
            email,

          mobile:
            mobile,

          role:
            "applicant",

          status:
            "active",

          profileCompleted:
            false,

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp()

        }
      );


      console.log(
        "Applicant profile created in Firestore."
      );


      // ==================================
      // SUCCESS
      // ==================================

      message.textContent =
        "Account created successfully.";


      alert(
        "Applicant account created successfully."
      );


      // Go to login

      window.location.href =
        "login.html";


    } catch (error) {

      console.error(
        "Applicant registration error:",
        error
      );


      // ==================================
      // ERROR HANDLING
      // ==================================

      if (
        error.code ===
        "auth/email-already-in-use"
      ) {

        message.textContent =
          "This email address is already registered.";

      }

      else if (
        error.code ===
        "auth/invalid-email"
      ) {

        message.textContent =
          "Please enter a valid email address.";

      }

      else if (
        error.code ===
        "auth/weak-password"
      ) {

        message.textContent =
          "Password must contain at least 6 characters.";

      }

      else {

        message.textContent =
          "Registration failed: " +
          error.message;

      }

    }

  }
);
