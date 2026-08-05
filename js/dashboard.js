import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

async function loadDashboard() {
  const snapshot = await getDocs(collection(db, "certificates"));

  let total = 0;

  snapshot.forEach(() => {
    total++;
  });

  document.getElementById("totalCertificates").textContent = total;
}

loadDashboard();
