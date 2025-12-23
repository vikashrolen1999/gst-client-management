// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBHC_Kb0OBatkTN1INuvJuFqvWE-HT7O4Y",
  authDomain: "gst-client-management.firebaseapp.com",
  projectId: "gst-client-management",
  storageBucket: "gst-client-management.firebasestorage.app",
  messagingSenderId: "207332931636",
  appId: "1:207332931636:web:93fdc694fa97d8a0e4f261",
  measurementId: "G-JRXZLYFSX0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);