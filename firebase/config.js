import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// Replace this with your actual Firebase config values
const firebaseConfig = {
    apiKey: "AIzaSyAPaACgMGJiI_IJCL5EosH5HuJnQ2w_hv8",
    authDomain: "cebuhike.firebaseapp.com",
    projectId: "cebuhike",
    storageBucket: "cebuhike.firebasestorage.app",
    messagingSenderId: "642781992317",
    appId: "1:642781992317:web:079d4b8b9c533b46b86814",
    measurementId: "G-50ZD6L0CXF"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, GoogleAuthProvider };