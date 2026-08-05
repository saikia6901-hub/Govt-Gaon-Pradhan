<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyC4yT9YQg8g35_1J_8ILgg5S2Ps2oi5_Cs",
    authDomain: "govt-gaon-pradhan.firebaseapp.com",
    projectId: "govt-gaon-pradhan",
    storageBucket: "govt-gaon-pradhan.firebasestorage.app",
    messagingSenderId: "695225920086",
    appId: "1:695225920086:web:ecf455d3d58f94cee669f7",
    measurementId: "G-R3043Y47D0"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>
