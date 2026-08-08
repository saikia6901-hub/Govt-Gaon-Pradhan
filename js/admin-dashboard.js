import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
  doc,
  getDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


onAuthStateChanged(auth, async (user) => {

  // User login কৰা নাই
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {

    // Firestore users collection ৰ পৰা user profile লওঁ
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    // User profile নাই
    if (!userSnap.exists()) {

      alert("User profile not found.");

      window.location.href = "login.html";
      return;
    }

    const userData = userSnap.data();

    // Super Admin নেকি check
    if (userData.role !== "super_admin") {

      alert("Access denied. Super Admin only.");

      window.location.href = "dashboard.html";
      return;
    }

    // Admin email দেখুৱাওঁ
    document.getElementById("adminEmail").textContent =
      "Logged in as: " + user.email;


    // Existing certificates count
    const certificateSnapshot =
      await getDocs(collection(db, "certificates"));

    document.getElementById("totalCertificates").textContent =
      certificateSnapshot.size;


    // Applicants collection এতিয়াও create হোৱা নাই
    document.getElementById("totalApplicants").textContent = "0";

    // Applications collection এতিয়াও create হোৱা নাই
    document.getElementById("totalApplications").textContent = "0";

    // Gaon Pradhan collection এতিয়াও create হোৱা নাই
    document.getElementById("totalPradhans").textContent = "0";


  } catch (error) {

    console.error("Admin dashboard error:", error);

    alert("Unable to load Admin Dashboard.");

  }

});


window.logout = async function () {

  try {

    await auth.signOut();

    window.location.href = "login.html";

  } catch (error) {

    console.error("Logout error:", error);

  }

};
