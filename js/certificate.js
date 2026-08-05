import { db, collection, addDoc } from "./firebase.js";

window.generateCertificate = async function () {

    const data = {

        certificateNo: "GP-" + Date.now(),

        name: document.getElementById("name").value,

        father: document.getElementById("father").value,

        mother: document.getElementById("mother").value,

        village: document.getElementById("village").value,

        post: document.getElementById("post").value,

        ps: document.getElementById("ps").value,

        district: document.getElementById("district").value,

        certificateType: document.getElementById("certificateType").value,

        purpose: document.getElementById("purpose").value,

        issueDate: new Date().toLocaleDateString()

    };

    try {

        await addDoc(collection(db, "certificates"), data);

        alert("Certificate Saved Successfully.");

        localStorage.setItem("certificate", JSON.stringify(data));

        window.location.href = "certificate.html";

    } catch (error) {

        alert("Error : " + error.message);

    }

};
