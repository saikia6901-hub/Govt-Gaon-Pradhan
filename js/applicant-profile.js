import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


const form =
  document.getElementById("profileForm");

const message =
  document.getElementById("profileMessage");

const profileStatus =
  document.getElementById("profileStatus");


// ========================================
// AUTHENTICATION
// ========================================

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href =
      "login.html";

    return;

  }


  document.getElementById(
    "userEmail"
  ).textContent =
    "Logged in as: " + user.email;


  try {

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

      return;

    }


    const data =
      userSnap.data();


    // ==================================
    // ROLE CHECK
    // ==================================

    if (
      data.role &&
      data.role !== "applicant"
    ) {

      alert(
        "This page is for applicants only."
      );

      window.location.href =
        "dashboard.html";

      return;

    }


    // ==================================
    // LOAD PROFILE DATA
    // ==================================

    document.getElementById(
      "fullName"
    ).value =
      data.name || "";


    document.getElementById(
      "fatherName"
    ).value =
      data.fatherName || "";


    document.getElementById(
      "motherName"
    ).value =
      data.motherName || "";


    document.getElementById(
      "dateOfBirth"
    ).value =
      data.dateOfBirth || "";


    document.getElementById(
      "gender"
    ).value =
      data.gender || "";


    document.getElementById(
      "mobile"
    ).value =
      data.mobile || "";


    document.getElementById(
      "email"
    ).value =
      user.email || data.email || "";


    document.getElementById(
      "address"
    ).value =
      data.address || "";


    document.getElementById(
      "villageTown"
    ).value =
      data.villageTown || "";


    document.getElementById(
      "postOffice"
    ).value =
      data.postOffice || "";


    document.getElementById(
      "policeStation"
    ).value =
      data.policeStation || "";


    document.getElementById(
      "district"
    ).value =
      data.district || "";


    document.getElementById(
      "pinCode"
    ).value =
      data.pinCode || "";


    // ==================================
    // PROFILE STATUS
    // ==================================

    updateProfileStatus(data);


  } catch (error) {

    console.error(
      "Profile loading error:",
      error
    );

    message.textContent =
      "Unable to load profile.";

  }

});


// ========================================
// SAVE PROFILE
// ========================================

form.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    const user =
      auth.currentUser;


    if (!user) {

      alert(
        "Please login again."
      );

      window.location.href =
        "login.html";

      return;

    }


    const fullName =
      document.getElementById(
        "fullName"
      ).value.trim();


    const fatherName =
      document.getElementById(
        "fatherName"
      ).value.trim();


    const motherName =
      document.getElementById(
        "motherName"
      ).value.trim();


    const dateOfBirth =
      document.getElementById(
        "dateOfBirth"
      ).value;


    const gender =
      document.getElementById(
        "gender"
      ).value;


    const mobile =
      document.getElementById(
        "mobile"
      ).value.trim();


    const address =
      document.getElementById(
        "address"
      ).value.trim();


    const villageTown =
      document.getElementById(
        "villageTown"
      ).value.trim();


    const postOffice =
      document.getElementById(
        "postOffice"
      ).value.trim();


    const policeStation =
      document.getElementById(
        "policeStation"
      ).value.trim();


    const district =
      document.getElementById(
        "district"
      ).value.trim();


    const pinCode =
      document.getElementById(
        "pinCode"
      ).value.trim();


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
      pinCode.length !== 6 ||
      !/^[0-9]+$/.test(pinCode)
    ) {

      message.textContent =
        "Please enter a valid 6 digit PIN Code.";

      return;

    }


    message.textContent =
      "Saving profile...";


    try {

      const userRef =
        doc(
          db,
          "users",
          user.uid
        );


      await setDoc(
        userRef,
        {

          uid:
            user.uid,

          name:
            fullName,

          email:
            user.email,

          mobile:
            mobile,

          role:
            "applicant",

          fatherName:
            fatherName,

          motherName:
            motherName,

          dateOfBirth:
            dateOfBirth,

          gender:
            gender,

          address:
            address,

          villageTown:
            villageTown,

          postOffice:
            postOffice,

          policeStation:
            policeStation,

          district:
            district,

          pinCode:
            pinCode,

          profileCompleted:
            true,

          updatedAt:
            serverTimestamp()

        },

        {
          merge:
            true
        }

      );


      message.textContent =
        "Profile saved successfully.";


      profileStatus.textContent =
        "Profile Status: Complete ✅";


      alert(
        "Applicant profile saved successfully."
      );


    } catch (error) {

      console.error(
        "Profile save error:",
        error
      );


      message.textContent =
        "Unable to save profile.";

    }

  }
);


// ========================================
// PROFILE STATUS
// ========================================

function updateProfileStatus(data) {

  const requiredFields = [

    data.name,

    data.fatherName,

    data.motherName,

    data.dateOfBirth,

    data.gender,

    data.mobile,

    data.address,

    data.villageTown,

    data.postOffice,

    data.policeStation,

    data.district,

    data.pinCode

  ];


  const complete =
    requiredFields.every(
      (value) =>
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
    );


  if (complete) {

    profileStatus.textContent =
      "Profile Status: Complete ✅";

  } else {

    profileStatus.textContent =
      "Profile Status: Incomplete ⚠️";

  }

}


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

    }

  };
