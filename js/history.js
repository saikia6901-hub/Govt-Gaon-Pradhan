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
