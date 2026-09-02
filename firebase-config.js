const firebaseConfig = {
  apiKey: "AIzaSyBHC_Kb0OBatkTN1INuvJuFqvWE-HT7O4Y",
  authDomain: "gst-client-management.firebaseapp.com",
  projectId: "gst-client-management",
  storageBucket: "gst-client-management.firebasestorage.app",
  messagingSenderId: "207332931636",
  appId: "1:207332931636:web:93fdc694fa97d8a0e4f261",
  measurementId: "G-JRXZLYFSX0"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();