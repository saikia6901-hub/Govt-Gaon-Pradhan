import { db } from "./firebase.js";

import {
collection,
getDocs

} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

window.searchCertificate = async function(){

const keyword =
document.getElementById("searchInput")
.value
.toLowerCase();

const snapshot =
await getDocs(collection(db,"certificates"));

let html="";

snapshot.forEach((doc)=>{

const data=doc.data();

if(
data.name.toLowerCase().includes(keyword)
||
data.certificateNo.toLowerCase().includes(keyword)
){

html+=`
<div class="card">

<h3>${data.name}</h3>

<p>${data.certificateNo}</p>

<p>${data.certificateType}</p>

</div>
`;

}

});

if(html===""){

html="<p>No Certificate Found</p>";

}

document.getElementById("searchResult").innerHTML=html;

}
