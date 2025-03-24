import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBqL74yMxVrazLyGUwweyTIG3dfEKCCo84",
  authDomain: "surtte-4bf22.firebaseapp.com",
  projectId: "surtte-4bf22",
  storageBucket: "surtte-4bf22.firebasestorage.app",
  messagingSenderId: "876719111475",
  appId: "1:876719111475:web:88d894c9b5f905d9fb5246"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };