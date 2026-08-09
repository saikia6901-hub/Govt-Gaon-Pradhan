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
  async () => {

    const districtId =
      districtSelect.value;

    console.log(
      "Selected District ID:",
      districtId
    );


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


          console.log(
            "Revenue Circle:",
            circleDoc.id,
            data
          );


          if (
            data.districtId ===
            districtId &&
            data.status ===
            "active"
          ) {

            const option =
              document.createElement(
                "option"
              );


            option.value =
              circleDoc.id;


            option.textContent =
              data.name;


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
            No Active Revenue Circle Found
          </option>`;

      }


      console.log(
        "Revenue Circles Found:",
        found
      );


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
        "Unable to load Revenue Circles: " +
        error.message
      );

    }

  }
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
