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
  where,
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
// SUPER ADMIN CHECK
// ========================================

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href =
      "login.html";

    return;
  }


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
        "User profile not found."
      );

      window.location.href =
        "login.html";

      return;

    }


    const userData =
      userSnap.data();


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


    document.getElementById(
      "adminEmail"
    ).textContent =
      "Logged in as: " +
      user.email;


    await loadDistricts();


  } catch (error) {

    console.error(
      "Authentication error:",
      error
    );

    alert(
      "Unable to verify administrator."
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

}


// ========================================
// LOAD REVENUE CIRCLES
// ========================================

async function loadRevenueCircles(
  districtId
) {

  circleSelect.innerHTML =
    `<option value="">
      Select Revenue Circle
    </option>`;


  resetSelect(
    mouzaSelect,
    "Select Mouza"
  );

  resetSelect(
    lotSelect,
    "Select Lot"
  );

  resetSelect(
    villageSelect,
    "Select Village"
  );


  if (!districtId) {

    return;

  }


  const circleQuery =
    query(
      collection(
        db,
        "revenueCircles"
      ),
      where(
        "districtId",
        "==",
        districtId
      ),
      orderBy("name")
    );


  const snapshot =
    await getDocs(
      circleQuery
    );


  snapshot.forEach(
    (circleDoc) => {

      const data =
        circleDoc.data();


      if (
        data.status !==
        "active"
      ) {

        return;

      }


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

    }
  );

}


// ========================================
// LOAD MOUZAS
// ========================================

async function loadMouzas(
  circleId
) {

  resetSelect(
    mouzaSelect,
    "Select Mouza"
  );

  resetSelect(
    lotSelect,
    "Select Lot"
  );

  resetSelect(
    villageSelect,
    "Select Village"
  );


  if (!circleId) {
