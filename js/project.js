import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  }
  document.getElementById("userEmail").innerText = "Logged in as: " + user.email;
});

window.logout = async function () {
  await signOut(auth);
  window.location.href = "login.html";
};
