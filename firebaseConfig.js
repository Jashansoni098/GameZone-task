// firebaseConfig.js

const firebaseConfig = {
  apiKey: "AIzaSyDrqJAUCOzw_N-97N3EWbq1DVMUmkMxDmU",
  authDomain: "gamezone-website.firebaseapp.com",
  projectId: "gamezone-website",
  storageBucket: "gamezone-website.firebasestorage.app",
  messagingSenderId: "909646479013",
  appId: "1:909646479013:web:81d8e6dd573fb8667e174c",
  measurementId: "G-3JCWRXNY1Q"
};

const app = firebase.initializeApp(firebaseConfig);
const db = app.firestore();
const auth = app.auth(); // Initialize Firebase Authentication
// window.db = db; // Optional: If you want to make db truly global without rely on file order
// window.auth = auth; // Optional: If you want to make auth truly global