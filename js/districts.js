import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


const form = document.getElementById("districtForm");
const districtList = document.getElementById("districtList");


// ========================================
// SUPER ADMIN CHECK
// ========================================

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {

      alert("User profile not found.");
      window.location.href = "login.html";
      return;

    }

    const userData = userSnap.data();

    if (userData.role !== "super_admin") {

      alert("Access denied. Super Admin only.");
      window.location.href = "dashboard.html";
      return;

    }

    document.getElementById("adminEmail").textContent =
      "Logged in as: " + user.email;

    loadDistricts();

  } catch (error) {

    console.error("Authentication error:", error);

    alert("Unable to verify administrator.");

  }

});


// ========================================
// ADD DISTRICT
// ========================================

form.addEventListener("submit", async (event) => {

  event.preventDefault();

  const name =
    document.getElementById("districtName").value.trim();

  const code =
    document.getElementById("districtCode").value.trim().toUpperCase();

  const status =
    document.getElementById("districtStatus").value;


  if (!name || !code) {

    alert("Please enter District Name and District Code.");

    return;

  }


  try {

    await addDoc(collection(db, "districts"), {

      name: name,

      code: code,

      state: "Assam",

      status: status,

      createdAt: serverTimestamp(),

      updatedAt: serverTimestamp(),

      createdBy: auth.currentUser.uid

    });


    alert("District added successfully.");

    form.reset();

    loadDistricts();


  } catch (error) {

    console.error("Error adding district:", error);

    alert("Unable to add district.");

  }

});


// ========================================
// LOAD DISTRICTS
// ========================================

async function loadDistricts() {

  districtList.innerHTML =
    "<p>Loading districts...</p>";

  try {

    const districtQuery = query(
      collection(db, "districts"),
      orderBy("name")
    );

    const snapshot =
      await getDocs(districtQuery);


    if (snapshot.empty) {

      districtList.innerHTML =
        "<p>No districts added yet.</p>";

      return;

    }


    let html = "";

    snapshot.forEach((document) => {

      const data = document.data();

      html += `
        <div class="card">

          <h3>${escapeHtml(data.name)}</h3>

          <p>
            Code:
            <strong>${escapeHtml(data.code || "")}</strong>
          </p>

          <p>
            State:
            <strong>${escapeHtml(data.state || "Assam")}</strong>
          </p>

          <p>
            Status:
            <strong>${escapeHtml(data.status || "")}</strong>
          </p>

        </div>
      `;

    });


    districtList.innerHTML = html;


  } catch (error) {

    console.error("Error loading districts:", error);

    districtList.innerHTML =
      "<p>Unable to load districts.</p>";

  }

}


// ========================================
// HTML SECURITY
// ========================================

function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


// ========================================
// LOGOUT
// ========================================

window.logout = async function () {

  try {

    await signOut(auth);

    window.location.href = "login.html";

  } catch (error) {

    console.error("Logout error:", error);

  }

};

// ========================================
// OFFICIAL ASSAM DISTRICT MASTER LIST
// ========================================

const officialDistricts = [
  "Baksa",
  "Barpeta",
  "Biswanath",
  "Bongaigaon",
  "Bajali",
  "Cachar",
  "Charaideo",
  "Chirang",
  "Darrang",
  "Dhemaji",
  "Dhubri",
  "Dibrugarh",
  "Dima Hasao",
  "Goalpara",
  "Golaghat",
  "Hailakandi",
  "Hojai",
  "Jorhat",
  "Kamrup",
  "Kamrup Metropolitan",
  "Karbi Anglong",
  "Kokrajhar",
  "Lakhimpur",
  "Majuli",
  "Morigaon",
  "Nagaon",
  "Nalbari",
  "Sivasagar",
  "Sonitpur",
  "Shribhumi",
  "South Salmara-Mancachar",
  "Tamulpur",
  "Tinsukia",
  "Udalguri",
  "West Karbi Anglong"
];


// ========================================
// CREATE SAFE DOCUMENT ID
// ========================================

function createDistrictId(name) {

  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

}


// ========================================
// IMPORT OFFICIAL DISTRICTS
// ========================================

const importButton =
  document.getElementById("importDistrictsBtn");

const importStatus =
  document.getElementById("importStatus");


if (importButton) {

  importButton.addEventListener("click", async () => {

    const user = auth.currentUser;

    if (!user) {

      alert("Please login first.");

      return;

    }


    importButton.disabled = true;

    importButton.textContent = "Importing...";

    importStatus.textContent =
      "Checking official district data...";


    try {

      // Verify Super Admin again
      const userRef = doc(db, "users", user.uid);

      const userSnap = await getDoc(userRef);


      if (!userSnap.exists()) {

        throw new Error("User profile not found.");

      }


      const userData = userSnap.data();


      if (userData.role !== "super_admin") {

        throw new Error(
          "Only Super Admin can import district data."
        );

      }


      let imported = 0;


      for (const districtName of officialDistricts) {

        const districtId =
          createDistrictId(districtName);


        const districtRef =
          doc(db, "districts", districtId);


        await setDoc(
          districtRef,
          {
            districtId: districtId,

            name: districtName,

            state: "Assam",

            status: "active",

            source: "Government of Assam - General Administration Department",

            updatedAt: serverTimestamp(),

            updatedBy: user.uid
          },
          { merge: true }
        );


        imported++;

      }


      importStatus.textContent =
        `${imported} official districts imported successfully.`;

      alert(
        `${imported} official Assam districts imported successfully.`
      );


      loadDistricts();


    } catch (error) {

      console.error(
        "Official district import error:",
        error
      );


      importStatus.textContent =
        "Import failed. Please try again.";


      alert(
        "District import failed: " +
        error.message
      );


    } finally {

      importButton.disabled = false;

      importButton.textContent =
        "Import Official Districts";

    }

  });

}
