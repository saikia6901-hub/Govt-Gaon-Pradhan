import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

export function getCurrentUserRole(callback) {

  onAuthStateChanged(auth, async (user) => {

    if (!user) {
      callback(null, null);
      return;
    }

    try {

      const userDoc = await getDoc(
        doc(db, "users", user.uid)
      );

      if (!userDoc.exists()) {
        callback(user, null);
        return;
      }

      const userData = userDoc.data();

      callback(user, userData.role);

    } catch (error) {

      console.error("Role check error:", error);
      callback(user, null);

    }

  });

    }
