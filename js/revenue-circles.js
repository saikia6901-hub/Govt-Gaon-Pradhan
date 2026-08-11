import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ========================================
// ELEMENTS
// ========================================

const circleForm =
  document.getElementById("circleForm");

const districtSelect =
  document.getElementById("districtSelect");

const circleList =
  document.getElementById("circleList");

const filterDistrict =
  document.getElementById("filterDistrict");

const searchCircle =
  document.getElementById("searchCircle");

const filterStatus =
  document.getElementById("filterStatus");

const editCircleModal =
  document.getElementById("editCircleModal");

const saveCircleEditBtn =
  document.getElementById("saveCircleEditBtn");

const cancelCircleEditBtn =
  document.getElementById("cancelCircleEditBtn");

const adminEmail =
  document.getElementById("adminEmail");


// ========================================
// PAGE INITIALIZATION
// ========================================

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href =
      "login.html";

    return;

  }


  try {

    // ------------------------------------
    // GET USER PROFILE
    // ------------------------------------

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
        "User profile not found."
      );

      window.location.href =
        "login.html";

      return;

    }


    const userData =
      userSnap.data();


    // ------------------------------------
    // SUPER ADMIN CHECK
    // ------------------------------------

    if (
      userData.role !==
      "super_admin"
    ) {

      alert(
        "Access denied. Super Admin only."
      );

      window.location.href =
        "dashboard.html";

      return;

    }


    // ------------------------------------
    // SHOW LOGGED-IN EMAIL
    // ------------------------------------

    if (adminEmail) {

      adminEmail.textContent =
        "Logged in as: " +
        (
          user.email ||
          "Unknown Email"
        );

    }


    // ------------------------------------
    // LOAD DATA
    // ------------------------------------

    await loadDistricts();

    await loadCircles();


  } catch (error) {

    console.error(
      "Revenue Circle initialization error:",
      error
    );


    alert(
      "Unable to load Revenue Circle Management.\n\n" +
      (
        error.code ||
        "unknown-error"
      ) +
      "\n\n" +
      (
        error.message ||
        "Unknown error"
      )
    );

  }

});


// ========================================
// LOAD DISTRICTS
// ========================================

async function loadDistricts() {

  if (!districtSelect) {

    console.error(
      "districtSelect element not found."
    );

    return;

  }


  // --------------------------------------
  // RESET DISTRICT DROPDOWN
  // --------------------------------------

  districtSelect.innerHTML =
    `
      <option value="">
        Select District
      </option>
    `;


  // --------------------------------------
  // RESET FILTER DROPDOWN
  // --------------------------------------

  if (filterDistrict) {

    filterDistrict.innerHTML =
      `
        <option value="">
          All Districts
        </option>
      `;

  }


  try {

    const districtQuery =
      query(
        collection(
          db,
          "districts"
        ),
        orderBy("name")
      );


    const snapshot =
      await getDocs(
        districtQuery
      );


    if (snapshot.empty) {

      console.warn(
        "No districts found."
      );

      return;

    }


    snapshot.forEach(
      (districtDoc) => {

        const data =
          districtDoc.data();


        const districtName =
          data.name || "";


        // -------------------------------
        // MAIN DISTRICT DROPDOWN
        // -------------------------------

        const option =
          document.createElement(
            "option"
          );


        option.value =
          districtDoc.id;


        option.textContent =
          districtName;


        districtSelect.appendChild(
          option
        );


        // -------------------------------
        // FILTER DROPDOWN
        // -------------------------------

        if (filterDistrict) {

          const filterOption =
            document.createElement(
              "option"
            );


          filterOption.value =
            districtDoc.id;


          filterOption.textContent =
            districtName;


          filterDistrict.appendChild(
            filterOption
          );

        }

      }
    );


  } catch (error) {

    console.error(
      "Error loading districts:",
      error
    );


    if (districtSelect) {

      districtSelect.innerHTML =
        `
          <option value="">
            Unable to load districts
          </option>
        `;

    }


    throw error;

  }

}


// ========================================
// ADD REVENUE CIRCLE
// ========================================

if (circleForm) {

  circleForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      // ----------------------------------
      // CHECK AUTHENTICATION
      // ----------------------------------

      const user =
        auth.currentUser;


      if (!user) {

        alert(
          "Your session has expired. Please login again."
        );

        window.location.href =
          "login.html";

        return;

      }


      // ----------------------------------
      // GET FORM VALUES
      // ----------------------------------

      const districtId =
        districtSelect
          ? districtSelect.value
          : "";


      const circleNameElement =
        document.getElementById(
          "circleName"
        );


      const statusElement =
        document.getElementById(
          "circleStatus"
        );


      const circleName =
        circleNameElement
          ? circleNameElement.value.trim()
          : "";


      const status =
        statusElement
          ? statusElement.value
          : "active";


      // ----------------------------------
      // VALIDATION
      // ----------------------------------

      if (!districtId) {

        alert(
          "Please select a district."
        );

        return;

      }


      if (!circleName) {

        alert(
          "Please enter Revenue Circle Name."
        );

        return;

      }


      try {

        // -------------------------------
        // GET DISTRICT
        // -------------------------------

        const districtRef =
          doc(
            db,
            "districts",
            districtId
          );


        const districtSnap =
          await getDoc(
            districtRef
          );


        if (!districtSnap.exists()) {

          alert(
            "Selected district does not exist."
          );

          return;

        }


        const districtData =
          districtSnap.data();


        // -------------------------------
        // CREATE STABLE ID
        // ----------------
