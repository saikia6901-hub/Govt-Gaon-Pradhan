import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const tbody = document.querySelector("#certificateTable tbody");

async function loadHistory() {

  tbody.innerHTML = "";

  const snapshot = await getDocs(collection(db, "certificates"));

  snapshot.forEach((certificate) => {

    const data = certificate.data();

    tbody.innerHTML += `
      <tr>
        <td>${data.certificateNo}</td>
        <td>${data.name}</td>
        <td>${data.certificateType}</td>
        <td>${data.issueDate}</td>
        <td>
          <button onclick="viewCertificate('${certificate.id}')">👁 View</button>

          <button onclick="reprintCertificate('${certificate.id}')">🖨 Reprint</button>

          <button onclick="deleteCertificate('${certificate.id}')">🗑 Delete</button>
        </td>
      </tr>
    `;

  });

}

window.deleteCertificate = async function(id) {

  if (confirm("Delete this certificate?")) {

    await deleteDoc(doc(db, "certificates", id));

    alert("Certificate Deleted");

    loadHistory();

  }

};

window.viewCertificate = async function(id) {

  const snapshot = await getDocs(collection(db, "certificates"));

  snapshot.forEach((item) => {

    if (item.id === id) {

      localStorage.setItem(
        "certificate",
        JSON.stringify(item.data())
      );

      window.location.href = "certificate.html";

    }

  });

};

window.reprintCertificate = window.viewCertificate;

loadHistory();
