import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    console.log("No user logged in.");
    return;
  }

  try {

    await setDoc(
      doc(db, "users", user.uid),
      {
        name: "Super Admin",
        email: user.email,
        role: "super_admin",
        status: "active",
        createdAt: serverTimestamp()
      },
      { merge: true }
    );

    console.log("Super Admin profile created successfully.");

  } catch (error) {

    console.error("Error creating Super Admin:", error);

  }

});
