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
  getDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


const form = document.getElementById("districtForm");
const districtList = document.getElementById("districtList");


// Check Super Admin
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


// Add District
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

      status: status,

      createdAt: serverTimestamp(),

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


// Load Districts
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


// Basic HTML escaping
function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


// Logout
window.logout = async function () {

  try {

    await signOut(auth);

    window.location.href = "login.html";

  } catch (error) {

    console.error("Logout error:", error);

  }

};
