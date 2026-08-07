alert("viewCertificate.js loaded");
const data = JSON.parse(localStorage.getItem("certificate"));

if (!data) {
    alert("No certificate found.");
    window.location.href = "dashboard.html";
} else {
    document.getElementById("certificateNo").textContent = data.certificateNo;
    document.getElementById("name").textContent = data.name;
    document.getElementById("father").textContent = data.father;
    document.getElementById("village").textContent = data.village;
    document.getElementById("ps").textContent = data.ps;
    document.getElementById("district").textContent = data.district;
    document.getElementById("date").textContent = data.issueDate;
}
document.getElementById("verification").textContent =
Math.random().toString(36).substring(2,10).toUpperCase();
const verifyURL =
window.location.origin +
"/verify.html?cert=" +
encodeURIComponent(data.certificateNo);

new QRCode(document.getElementById("qrcode"), {
    text: verifyURL,
    width: 120,
    height: 120
});

alert(data.certificateNo);
