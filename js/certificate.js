function generateCertificate(){

localStorage.setItem("name",
document.getElementById("name").value);

localStorage.setItem("father",
document.getElementById("father").value);

localStorage.setItem("village",
document.getElementById("village").value);

localStorage.setItem("ps",
document.getElementById("ps").value);

localStorage.setItem("district",
document.getElementById("district").value);

window.location.href="certificate.html";

}

if(document.getElementById("certificateNo")){

document.getElementById("certificateNo").innerHTML=
"GP-2026-"+Math.floor(Math.random()*100000);

document.getElementById("date").innerHTML=
new Date().toLocaleDateString();

document.getElementById("name").innerHTML=
localStorage.getItem("name");

document.getElementById("father").innerHTML=
localStorage.getItem("father");

document.getElementById("village").innerHTML=
localStorage.getItem("village");

document.getElementById("ps").innerHTML=
localStorage.getItem("ps");

document.getElementById("district").innerHTML=
localStorage.getItem("district");

}
