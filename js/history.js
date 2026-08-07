import { db } from "./firebase.js";

import {
collection,
getDocs

} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const tbody = document.querySelector("#certificateTable tbody");

const querySnapshot = await getDocs(collection(db,"certificates"));

querySnapshot.forEach((doc)=>{

const data = doc.data();

tbody.innerHTML += `
<tr>

<td>${data.certificateNo}</td>

<td>${data.name}</td>

<td>${data.certificateType}</td>

<td>${data.issueDate}</td>

</tr>
`;

});

import { db } from "./firebase.js";

import {
collection,
getDocs,
deleteDoc,
doc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

async function loadHistory(){

const snapshot = await getDocs(collection(db,"certificates"));

const table=document.getElementById("historyTable");

table.innerHTML="";

snapshot.forEach((certificate)=>{

const data=certificate.data();

table.innerHTML +=`

<tr>

<td>${data.certificateNo}</td>

<td>${data.name}</td>

<td>${data.issueDate}</td>

<td>

<button onclick="viewCertificate('${certificate.id}')">
View
</button>

<button onclick="reprintCertificate('${certificate.id}')">
Reprint
</button>

<button onclick="deleteCertificate('${certificate.id}')">
Delete
</button>

</td>

</tr>

`;

});

}

window.deleteCertificate=async(id)=>{

if(confirm("Delete this certificate?")){

await deleteDoc(doc(db,"certificates",id));

alert("Deleted Successfully");

loadHistory();

}

};
window.viewCertificate = async function(id) {

  const snapshot = await getDocs(collection(db, "certificates"));

  snapshot.forEach((docItem) => {

    if (docItem.id === id) {

      localStorage.setItem(
        "certificate",
        JSON.stringify(docItem.data())
      );

      window.location.href = "certificate.html";

    }

  });

};

window.reprintCertificate = async function(id) {

  const snapshot = await getDocs(collection(db, "certificates"));

  snapshot.forEach((docItem) => {

    if (docItem.id === id) {

      localStorage.setItem(
        "certificate",
        JSON.stringify(docItem.data())
      );

      window.location.href = "certificate.html";

    }

  });

};

