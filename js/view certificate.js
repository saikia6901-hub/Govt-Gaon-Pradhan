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
