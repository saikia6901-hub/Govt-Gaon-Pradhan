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
  document.getElementById(
    "applicantRegisterForm"
  );

const message =
  document.getElementById(
    "registerMessage"
  );


form.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


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


    // ==================================
    // VALIDATION
    // ==================================

    if (
      mobile.length !== 10 ||
      !/^[0-9]+$/.test(mobile)
    ) {

      message.textContent =
        "Please enter a valid 10 digit mobile number.";

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


    if (password.length < 6) {

      message.textContent =
        "Password must contain at least 6 characters.";

      return;

    }


    message.textContent =
      "Creating your account...";


    try {

      // ==================================
      // CREATE FIREBASE AUTH ACCOUNT
      // ==================================

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );


      const user =
        userCredential.user;


      // ==================================
      // CREATE USER PROFILE
      // ==================================

      await setDoc(
        doc(
          db,
          "users",
          user.uid
        ),
        {

         
