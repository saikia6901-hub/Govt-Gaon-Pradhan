console.log("USERS.JS LOADED SUCCESSFULLY");
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
  getDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


const districtSelect =
  document.getElementById("districtSelect");

const circleSelect =
  document.getElementById("circleSelect");

const mouzaSelect =
  document.getElementById("mouzaSelect");

const lotSelect =
  document.getElementById("lotSelect");

const villageSelect =
  document.getElementById("villageSelect");


// ========================================
// AUTHENTICATION
// ========================================

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href = "login.html";

    return;
  }


  // Show email immediately
  const adminEmail =
    document.getElementById("adminEmail");

  if (adminEmail) {

    adminEmail.textContent =
      "Logged in as: " + user.email;

  }


  try {

    // Check user profile

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
        "User profile not found in Firestore."
      );

      return;
    }


    const userData =
      userSnap.data();


    console.log(
      "Current user role:",
      userData.role
    );


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


    // Load districts

    await loadDistricts();


  } catch (error) {

    console.error(
      "Users page error:",
      error
    );

    alert(
      "Error loading User Management: " +
      error.message
    );

  }

});


// ========================================
// LOAD DISTRICTS
// ========================================

async function loadDistricts() {

  districtSelect.innerHTML =
    `<option value="">
      Select District
    </option>`;


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

      districtSelect.innerHTML =
        `<option value="">
          No District Found
        </option>`;

      return;

    }


    snapshot.forEach(
      (districtDoc) => {

        const data =
          districtDoc.data();


        const option =
          document.createElement(
            "option"
          );


        option.value =
          districtDoc.id;


        option.textContent =
          data.name;


        districtSelect.appendChild(
          option
        );

      }
    );


    console.log(
      "Districts loaded:",
      snapshot.size
    );


  } catch (error) {

    console.error(
      "District loading error:",
      error
    );


    districtSelect.innerHTML =
      `<option value="">
        Error loading districts
      </option>`;


    alert(
      "Unable to load districts: " +
      error.message
    );

  }

}


// ========================================
// DISTRICT CHANGE
// ========================================

districtSelect.addEventListener(
  "change",
  () => {

    console.log(
      "Selected District:",
      districtSelect.value
    );

    // Revenue Circle will be added
    // in the next step.

  }
);


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
