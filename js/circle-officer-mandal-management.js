import { auth, db } from "./firebase.js";

import {
   onAuthStateChanged,
   createUserWithEmailAndPassword,
   getAuth
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    collection,
    getDocs,
    query,
    where,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";



// ========================================
// FIREBASE SECONDARY APP
// ========================================

import {
    firebaseConfig
} from "./firebase.js";


const secondaryApp =
    initializeApp(
        firebaseConfig,
        "Secondary"
    );


const secondaryAuth =
    getAuth(
        secondaryApp
    );



// ========================================
// ELEMENTS
// ========================================

const form =
document.getElementById(
    "mandalCreateForm"
);


const list =
document.getElementById(
    "mandalList"
);



let currentOfficer = null;



// ========================================
// CHECK CIRCLE OFFICER
// ========================================


onAuthStateChanged(
auth,
async(user)=>{


if(!user){

window.location.href =
"login.html";

return;

}



const userSnap =
await getDoc(
doc(
db,
"users",
user.uid
)
);



if(!userSnap.exists()){

alert(
"Profile not found"
);

return;

}



const data =
userSnap.data();



if(
data.role !== "circle_officer"
&&
data.role !== "circle officer"
){

alert(
"Access denied"
);

window.location.href =
"login.html";

return;

}



currentOfficer = {

uid:user.uid,

...data

};



loadMandals();


});




// ========================================
// CREATE MANDAL USER
// ========================================


if(form){

form.addEventListener(
"submit",
async(e)=>{


e.preventDefault();



const name =
document.getElementById(
"mandalName"
).value.trim();



const email =
document.getElementById(
"mandalEmail"
).value.trim();



const password =
document.getElementById(
"mandalPassword"
).value;



if(
!name ||
!email ||
!password
){

alert(
"Fill all details"
);

return;

}



try{


// Create Authentication User

const result =
await createUserWithEmailAndPassword(
secondaryAuth,
email,
password
);



const uid =
result.user.uid;




// Save User Profile


await setDoc(
doc(
db,
"users",
uid
),
{


uid:uid,


name:name,


email:email,


role:
"mandal",



district:
currentOfficer.district ||
currentOfficer.districtName,



revenueCircle:
currentOfficer.revenueCircle ||
currentOfficer.revenueCircleName,



createdBy:
currentOfficer.uid,


status:
"active",



createdAt:
serverTimestamp(),



}

);



alert(
"Mandal account created successfully"
);



form.reset();


loadMandals();



}
catch(error){

console.error(
error
);


alert(
error.message
);


}


}
);

}





// ========================================
// LOAD MANDALS
// ========================================


async function loadMandals(){


if(!list)
return;



list.innerHTML =
"Loading...";



const q =
query(
collection(db,"users"),
where(
"role",
"==",
"mandal"
)
);



const snap =
await getDocs(q);



let html="";



snap.forEach(
(docSnap)=>{


const data =
docSnap.data();



if(
data.revenueCircle !==
currentOfficer.revenueCircle
&&
data.revenueCircle !==
currentOfficer.revenueCircleName
){

return;

}



html += `


<div class="management-card">


<h3>
${data.name}
</h3>


<p>
Email:
${data.email}
</p>


<p>
District:
${data.district}
</p>


<p>
Revenue Circle:
${data.revenueCircle}
</p>


<span class="status-active">
Active
</span>


</div>


`;



}
);



list.innerHTML =
html ||
"<p>No Mandal Assigned</p>";



}
