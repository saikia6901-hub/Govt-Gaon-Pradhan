alert("auth.js loaded");

import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

window.login = async function () {

  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {

    await signInWithEmailAndPassword(auth, email, password);

    alert("Login Successful");

    window.location.href = "dashboard.html";

  } catch (error) {

    document.getElementById("message").innerHTML = error.message;

  }

};
