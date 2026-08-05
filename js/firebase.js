import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC4yT9YQg8g35_1J_8ILgg5S2Ps2oi5_Cs",
  authDomain: "govt-gaon-pradhan.firebaseapp.com",
  projectId: "govt-gaon-pradhan",
  storageBucket: "govt-gaon-pradhan.firebasestorage.app",
  messagingSenderId: "695225920086",
  appId: "1:695225920086:web:ecf455d3d58f94cee669f7",
  measurementId: "G-R3043Y47D0"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db, collection, addDoc, getDocs };
