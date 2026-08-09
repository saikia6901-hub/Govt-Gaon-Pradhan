import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ========================================
// HTML ELEMENTS
// ========================================

const adminEmail =
  document.getElementById("adminEmail");

const districtSelect =
  document.getElementById("districtSelect");

const circleSelect =
  document.getElementById("circleSelect");


// ========================================
// AUTH CHECK
// ========================================

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href =
      "login.html";

    return;
  }


  // Show logged in email

  if (adminEmail) {

    adminEmail.textContent =
      "Logged in as: " + user.email;

  }


  try {

    // Get user profile

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

      return;
    }


    const userData =
      userSnap.data();


    // Super Admin check

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
      "Unable to load User Management: " +
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

    const snapshot =
      await getDocs(
        collection(
          db,
          "districts"
        )
      );


    if (snapshot.empty) {

      districtSelect.innerHTML =
        `<option value="">
          No District Found
        </option>`;

      return;
    }


    const districts = [];


    snapshot.forEach(
      (districtDoc) => {

        const data =
          districtDoc.data();


        districts.push({

          id:
            districtDoc.id,

          name:
            data.name || districtDoc.id

        });

      }
    );


    // Sort alphabetically

    districts.sort(
      (a, b) =>
        a.name.localeCompare(
          b.name
        )
    );


    districts.forEach(
      (district) => {

        const option =
          document.createElement(
            "option"
          );


        option.value =
          district.id;


        option.textContent =
          district.name;


        districtSelect.appendChild(
          option
        );

      }
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
      "District loading error: " +
      error.message
    );

  }

}


// ========================================
// DISTRICT → REVENUE CIRCLE
// ========================================

districtSelect.addEventListener(
  "change",
  async () => {

    const districtId =
      districtSelect.value;


    circleSelect.innerHTML =
      `<option value="">
        Loading Revenue Circles...
      </option>`;


    if (!districtId) {

      circleSelect.innerHTML =
        `<option value="">
          Select Revenue Circle
        </option>`;

      return;
    }


    try {

      // Get all Revenue Circles
      // No Firestore index required

      const snapshot =
        await getDocs(
          collection(
            db,
            "revenueCircles"
          )
        );


      circleSelect.innerHTML =
        `<option value="">
          Select Revenue Circle
        </option>`;


      let found = 0;


      snapshot.forEach(
        (circleDoc) => {

          const data =
            circleDoc.data();


          const circleDistrictId =
            String(
              data.districtId || ""
            )
            .trim()
            .toLowerCase();


          const selectedDistrictId =
            String(
              districtId
            )
            .trim()
            .toLowerCase();


          if (
            circleDistrictId ===
            selectedDistrictId
          ) {

            const option =
              document.createElement(
                "option"
              );


            option.value =
              circleDoc.id;


            option.textContent =
              data.name ||
              circleDoc.id;


            circleSelect.appendChild(
              option
            );


            found++;

          }

        }
      );


      if (found === 0) {

        circleSelect.innerHTML =
          `<option value="">
            No Revenue Circle Found
          </option>`;

      }

    } catch (error) {

      console.error(
        "Revenue Circle loading error:",
        error
      );


      circleSelect.innerHTML =
        `<option value="">
          Error loading Revenue Circles
        </option>`;


      alert(
        "Revenue Circle error: " +
        error.message
      );

    }

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
